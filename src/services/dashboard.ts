import type {
  Asset,
  CriticalityAssessment,
  CriticalityLevel,
  Defect,
  Reading,
  RoundExecution,
  RoutePoint,
  Status,
} from '@/model';
import { latestAssessmentByAsset } from './criticality';
import { roundProgress } from './rounds';

/**
 * Доменные правила раздела «Дашборд надёжности». Чистые функции над уже
 * загруженными списками: сводные KPI, топ критичных активов, последние
 * отклонения, открытые дефекты, тренды для графиков и выполнение обходов.
 * UI получает данные через репозиторий, а сводки считает здесь — единый
 * источник правил для виджетов дашборда. Всё реагирует на «живые» данные
 * симулятора телеметрии (он пишет замеры/дефекты в тот же репозиторий).
 */

/** Порядок классов критичности по возрастанию серьёзности (для сортировок/осей). */
export const CRITICALITY_ORDER: CriticalityLevel[] = [
  'low',
  'medium',
  'high',
  'critical',
];

/** Ранг класса критичности (для сортировки топа активов). */
const criticalityRank: Record<CriticalityLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/** Дефект считается открытым, пока не устранён и не закрыт. */
export function isOpenDefect(defect: Defect): boolean {
  return defect.status !== 'resolved' && defect.status !== 'closed';
}

/** Карта `statusId → код состояния` (для распознавания «в работе» и т.п.). */
export function statusCodeById(statuses: Status[]): Map<string, string> {
  return new Map(statuses.map((s) => [s.id, s.code]));
}

/** Сводные KPI надёжности парка оборудования. */
export interface ReliabilityKpis {
  totalAssets: number;
  /** Активов в работе (код состояния `in_operation`). */
  inOperation: number;
  /** Доля активов в работе, % (0…100). */
  operationalRate: number;
  /** Активов класса «высокая» + «критическая». */
  criticalAssets: number;
  /** Открытых дефектов (не устранены и не закрыты). */
  openDefects: number;
  /** Открытых дефектов критической серьёзности. */
  criticalOpenDefects: number;
  /** Всего зафиксировано отклонений в замерах. */
  deviations: number;
}

export function computeKpis(
  assets: Asset[],
  statuses: Status[],
  defects: Defect[],
  readings: Reading[],
): ReliabilityKpis {
  const codeById = statusCodeById(statuses);
  const inOperation = assets.filter(
    (a) => codeById.get(a.statusId) === 'in_operation',
  ).length;
  const criticalAssets = assets.filter(
    (a) => a.criticality === 'high' || a.criticality === 'critical',
  ).length;
  const openDefects = defects.filter(isOpenDefect);
  const deviations = readings.filter((r) => r.isDeviation).length;

  return {
    totalAssets: assets.length,
    inOperation,
    operationalRate:
      assets.length > 0 ? Math.round((inOperation / assets.length) * 100) : 0,
    criticalAssets,
    openDefects: openDefects.length,
    criticalOpenDefects: openDefects.filter((d) => d.severity === 'critical')
      .length,
    deviations,
  };
}

/** Строка топа критичных активов с риск-баллом и числом открытых дефектов. */
export interface TopCriticalAsset {
  asset: Asset;
  level: CriticalityLevel;
  /** Риск-балл последней оценки критичности (если есть). */
  score?: number;
  openDefects: number;
}

/**
 * Топ оборудования по риску: сначала по риск-баллу последней оценки, затем по
 * классу критичности из реестра, далее по числу открытых дефектов.
 */
export function topCriticalAssets(
  assets: Asset[],
  assessments: CriticalityAssessment[],
  defects: Defect[],
  limit = 6,
): TopCriticalAsset[] {
  const latest = latestAssessmentByAsset(assessments);
  const openByAsset = new Map<string, number>();
  for (const defect of defects) {
    if (isOpenDefect(defect)) {
      openByAsset.set(defect.assetId, (openByAsset.get(defect.assetId) ?? 0) + 1);
    }
  }

  return assets
    .map<TopCriticalAsset>((asset) => ({
      asset,
      level: asset.criticality,
      score: latest.get(asset.id)?.score,
      openDefects: openByAsset.get(asset.id) ?? 0,
    }))
    .sort((a, b) => {
      const scoreDiff = (b.score ?? -1) - (a.score ?? -1);
      if (scoreDiff !== 0) return scoreDiff;
      const rankDiff = criticalityRank[b.level] - criticalityRank[a.level];
      if (rankDiff !== 0) return rankDiff;
      return b.openDefects - a.openDefects;
    })
    .slice(0, limit);
}

/** Последнее отклонение замера с привязкой к точке и активу. */
export interface DeviationItem {
  reading: Reading;
  point?: RoutePoint;
  assetId?: string;
}

/** Последние отклонения в замерах (обходы + симулятор), новые сверху. */
export function recentDeviations(
  readings: Reading[],
  points: RoutePoint[],
  limit = 6,
): DeviationItem[] {
  const pointById = new Map(points.map((p) => [p.id, p]));
  return readings
    .filter((r) => r.isDeviation)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, limit)
    .map((reading) => {
      const point = pointById.get(reading.routePointId);
      return { reading, point, assetId: point?.assetId };
    });
}

/** Открытые дефекты, новые сверху. */
export function openDefectsList(defects: Defect[], limit = 6): Defect[] {
  return defects
    .filter(isOpenDefect)
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
    .slice(0, limit);
}

/** Точка тренда «новые дефекты по дням». */
export interface DefectsByDay {
  /** ISO-дата (YYYY-MM-DD). */
  date: string;
  count: number;
}

/**
 * Число новых дефектов по дням за последние `days` суток (включая сегодня).
 * Возвращает непрерывный ряд дат (с нулями), чтобы график был ровным.
 */
export function defectsByDay(
  defects: Defect[],
  days = 14,
  now: Date = new Date(),
): DefectsByDay[] {
  const counts = new Map<string, number>();
  for (const defect of defects) {
    const day = defect.detectedAt.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const series: DefectsByDay[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i += 1) {
    const date = cursor.toISOString().slice(0, 10);
    series.push({ date, count: counts.get(date) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

/** Доля оборудования по классу критичности. */
export interface CriticalityBucket {
  level: CriticalityLevel;
  count: number;
}

/** Распределение активов по классам критичности (по возрастанию серьёзности). */
export function criticalityDistribution(assets: Asset[]): CriticalityBucket[] {
  const counts: Record<CriticalityLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const asset of assets) {
    counts[asset.criticality] += 1;
  }
  return CRITICALITY_ORDER.map((level) => ({ level, count: counts[level] }));
}

/** Прогресс выполнения одного обхода (для виджета дашборда). */
export interface RoundCompletion {
  execution: RoundExecution;
  total: number;
  recorded: number;
  deviations: number;
  done: boolean;
  /** Процент пройденных точек (0…100). */
  percent: number;
}

/** Последние обходы с прогрессом (в процессе — сверху, затем недавно завершённые). */
export function roundsCompletion(
  executions: RoundExecution[],
  points: RoutePoint[],
  readings: Reading[],
  limit = 5,
): RoundCompletion[] {
  return [...executions]
    .sort((a, b) => {
      const aActive = a.status === 'in_progress' ? 1 : 0;
      const bActive = b.status === 'in_progress' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const at = a.finishedAt ?? a.startedAt;
      const bt = b.finishedAt ?? b.startedAt;
      return bt.localeCompare(at);
    })
    .slice(0, limit)
    .map((execution) => {
      const progress = roundProgress(execution, points, readings);
      return {
        execution,
        total: progress.total,
        recorded: progress.recorded,
        deviations: progress.deviations,
        done: progress.done,
        percent:
          progress.total > 0
            ? Math.round((progress.recorded / progress.total) * 100)
            : 0,
      };
    });
}

/** Сводка по обходам: завершено / в процессе / всего. */
export interface RoundsSummary {
  total: number;
  done: number;
  inProgress: number;
  /** Доля завершённых обходов, % (0…100). */
  doneRate: number;
}

export function roundsSummary(executions: RoundExecution[]): RoundsSummary {
  const done = executions.filter((e) => e.status === 'done').length;
  const inProgress = executions.filter((e) => e.status === 'in_progress').length;
  return {
    total: executions.length,
    done,
    inProgress,
    doneRate:
      executions.length > 0 ? Math.round((done / executions.length) * 100) : 0,
  };
}
