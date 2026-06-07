import { nanoid } from 'nanoid';
import type {
  CriticalityLevel,
  Defect,
  Notification,
  Reading,
  RoundExecution,
  RoutePoint,
  ScalarValue,
} from '@/model';

/**
 * Доменные правила раздела «Обходы и маршруты». Чистые функции над списками:
 * порядок точек маршрута, валидация замера по допустимому диапазону и фабрики
 * дефекта/уведомления из отклонения. Фабрики намеренно вынесены в сервис —
 * тот же механизм переиспользует симулятор телеметрии (см. план 10).
 */

/** Точки маршрута по порядку обхода. */
export function pointsForRoute(
  routeId: string,
  points: RoutePoint[],
): RoutePoint[] {
  return points
    .filter((p) => p.routeId === routeId)
    .sort((a, b) => a.order - b.order);
}

/** Замеры конкретного выполнения обхода. */
export function readingsForExecution(
  executionId: string,
  readings: Reading[],
): Reading[] {
  return readings.filter((r) => r.roundExecutionId === executionId);
}

/** Замеры по точке контроля (новые сверху). */
export function readingsForPoint(
  routePointId: string,
  readings: Reading[],
): Reading[] {
  return readings
    .filter((r) => r.routePointId === routePointId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

/**
 * Отклонение замера: число вне допустимого диапазона точки либо
 * отрицательный результат чек-листа (`false`). Текстовые значения отклонением
 * не считаются.
 */
export function isReadingDeviation(
  point: RoutePoint,
  value: ScalarValue,
): boolean {
  if (point.kind === 'checklist') {
    return value === false;
  }
  if (typeof value !== 'number' || Number.isNaN(value)) return false;
  if (point.min !== undefined && value < point.min) return true;
  if (point.max !== undefined && value > point.max) return true;
  return false;
}

/** Текст допустимого диапазона точки (для подсказок в UI). */
export function rangeLabel(point: RoutePoint, unitCode?: string): string {
  if (point.kind === 'checklist') return '—';
  const unit = unitCode ? ` ${unitCode}` : '';
  if (point.min !== undefined && point.max !== undefined) {
    return `${point.min}…${point.max}${unit}`;
  }
  if (point.max !== undefined) return `≤ ${point.max}${unit}`;
  if (point.min !== undefined) return `≥ ${point.min}${unit}`;
  return '—';
}

/** Прогресс выполнения обхода: сколько точек уже замерено и сколько отклонений. */
export interface RoundProgress {
  total: number;
  recorded: number;
  deviations: number;
  done: boolean;
}

export function roundProgress(
  execution: RoundExecution,
  points: RoutePoint[],
  readings: Reading[],
): RoundProgress {
  const routePoints = pointsForRoute(execution.routeId, points);
  const execReadings = readingsForExecution(execution.id, readings);
  const recordedPointIds = new Set(execReadings.map((r) => r.routePointId));
  const deviations = execReadings.filter((r) => r.isDeviation).length;
  return {
    total: routePoints.length,
    recorded: recordedPointIds.size,
    deviations,
    done: recordedPointIds.size >= routePoints.length && routePoints.length > 0,
  };
}

/** Точка тренда замеров для графика (значение по времени). */
export interface ReadingTrendPoint {
  recordedAt: string;
  value: number;
  isDeviation: boolean;
}

/**
 * Числовой тренд замеров точки (старые → новые) для графика. Нечисловые
 * (чек-лист) замеры отбрасываются.
 */
export function readingTrend(
  routePointId: string,
  readings: Reading[],
): ReadingTrendPoint[] {
  return readings
    .filter((r) => r.routePointId === routePointId && typeof r.value === 'number')
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map((r) => ({
      recordedAt: r.recordedAt,
      value: r.value as number,
      isDeviation: r.isDeviation,
    }));
}

/**
 * Дефект из отклонения на обходе. Severity берётся от класса критичности актива
 * (если известен), иначе — средний. `detectedAt` совпадает с моментом замера.
 */
export function buildDeviationDefect(params: {
  assetId: string;
  reading: Reading;
  point: RoutePoint;
  title: string;
  description?: string;
  severity?: CriticalityLevel;
}): Defect {
  return {
    id: `df-${nanoid(8)}`,
    assetId: params.assetId,
    title: params.title,
    description: params.description,
    source: 'round',
    severity: params.severity ?? 'medium',
    status: 'open',
    detectedAt: params.reading.recordedAt,
    readingId: params.reading.id,
  };
}

/** Уведомление по дефекту обхода — отражается в оболочке и на дашборде. */
export function buildDeviationNotification(params: {
  defect: Defect;
  message: string;
}): Notification {
  return {
    id: `nt-${nanoid(8)}`,
    defectId: params.defect.id,
    assetId: params.defect.assetId,
    message: params.message,
    createdAt: params.defect.detectedAt,
    read: false,
  };
}
