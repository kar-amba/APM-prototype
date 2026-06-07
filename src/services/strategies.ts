import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type {
  CriticalityAssessment,
  CriticalityLevel,
  MaintenanceTask,
  Strategy,
  StrategyType,
} from '@/model';
import { latestAssessmentByAsset, recommendedStrategyType } from './criticality';

/**
 * Доменные правила раздела «Стратегии и мероприятия». Чистые функции над уже
 * загруженными списками: выбор задач стратегии, расчёт расписания ТОиР по
 * интервалу (date-fns) и сводка рекомендаций «класс критичности → стратегия».
 */

/** Порядок типов стратегий — от реактивной к предиктивной (для сортировки/легенд). */
export const STRATEGY_TYPE_ORDER: StrategyType[] = [
  'reactive',
  'preventive',
  'condition_based',
  'predictive',
];

/** Мероприятия конкретной стратегии. */
export function tasksForStrategy(
  strategyId: string,
  tasks: MaintenanceTask[],
): MaintenanceTask[] {
  return tasks.filter((task) => task.strategyId === strategyId);
}

/** Число мероприятий по каждой стратегии (ключ — `strategyId`). */
export function taskCountByStrategy(
  tasks: MaintenanceTask[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    counts.set(task.strategyId, (counts.get(task.strategyId) ?? 0) + 1);
  }
  return counts;
}

/**
 * Дата следующего выполнения мероприятия. У задач прототипа нет журнала
 * выполнения, поэтому расписание симулируется от опорной даты (по умолчанию —
 * сегодня) на величину интервала.
 */
export function nextDueDate(intervalDays: number, from: Date = new Date()): Date {
  return addDays(from, intervalDays);
}

/** Человекочитаемая дата следующего выполнения (ru-locale). */
export function formatNextDue(
  intervalDays: number,
  from: Date = new Date(),
): string {
  return format(nextDueDate(intervalDays, from), 'd MMMM yyyy', { locale: ru });
}

/** Период интервала в виде «N дн.» либо приближённо в месяцах/годах. */
export function formatInterval(intervalDays: number): string {
  if (intervalDays % 365 === 0) {
    const years = intervalDays / 365;
    return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
  }
  if (intervalDays % 30 === 0) {
    return `${intervalDays / 30} мес.`;
  }
  return `${intervalDays} дн.`;
}

/** Сколько дней осталось до следующего выполнения от опорной даты. */
export function daysUntilDue(intervalDays: number, from: Date = new Date()): number {
  return differenceInCalendarDays(nextDueDate(intervalDays, from), from);
}

/** Строка сводки рекомендаций по классу критичности. */
export interface StrategyRecommendation {
  level: CriticalityLevel;
  recommendedType: StrategyType;
  /** Сколько оценённых активов попало в этот класс. */
  assetCount: number;
}

/**
 * Сводка «класс критичности → рекомендуемая стратегия» с числом активов в
 * каждом классе (по последним оценкам критичности). Подсказывает, какие
 * стратегии стоит завести/назначить.
 */
export function strategyRecommendations(
  assessments: CriticalityAssessment[],
): StrategyRecommendation[] {
  const latest = latestAssessmentByAsset(assessments);
  const countByLevel: Record<CriticalityLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const assessment of latest.values()) {
    countByLevel[assessment.level] += 1;
  }

  const levels: CriticalityLevel[] = ['critical', 'high', 'medium', 'low'];
  return levels.map((level) => ({
    level,
    recommendedType: recommendedStrategyType[level],
    assetCount: countByLevel[level],
  }));
}

/** Итоговый список стратегий (для удобной типизации в UI). */
export type { Strategy };
