import type {
  CriticalityAssessment,
  CriticalityLevel,
  StrategyType,
} from '@/model';

/**
 * Доменные правила анализа критичности (RCM/FMECA). Чистые функции над матрицей
 * «последствия × вероятность»: риск-балл, класс по баллу, рекомендация стратегии
 * и выборки оценок. UI получает данные через репозиторий, а считает риск здесь —
 * единый источник правил для раздела «Анализ критичности» и виджетов карточки.
 */

/** Размерность шкалы матрицы (5×5): уровни 1…5 для обеих осей. */
export const CRITICALITY_SCALE = [1, 2, 3, 4, 5] as const;
export type CriticalityScalePoint = (typeof CRITICALITY_SCALE)[number];

/** Риск-балл ячейки матрицы: произведение последствий на вероятность (1…25). */
export function riskScore(consequence: number, probability: number): number {
  return consequence * probability;
}

/** Ключ ячейки матрицы по координатам «последствия-вероятность». */
export function cellKey(consequence: number, probability: number): string {
  return `${consequence}-${probability}`;
}

/**
 * Класс критичности по риск-баллу. Пороги подобраны под шкалу 5×5 так, чтобы
 * разбить диапазон 1…25 на четыре зоны (зелёная/жёлтая/оранжевая/красная).
 */
export function criticalityLevelFromScore(score: number): CriticalityLevel {
  if (score >= 15) return 'critical';
  if (score >= 9) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/** Класс критичности для ячейки матрицы (последствия × вероятность). */
export function criticalityLevelFromCell(
  consequence: number,
  probability: number,
): CriticalityLevel {
  return criticalityLevelFromScore(riskScore(consequence, probability));
}

/**
 * Рекомендованный тип стратегии обслуживания по классу критичности — подсказка
 * для раздела «Стратегии и мероприятия» (см. план 08-strategies). Градиент от
 * реактивной (некритичное) к предиктивной (критичное оборудование).
 */
export const recommendedStrategyType: Record<CriticalityLevel, StrategyType> = {
  low: 'reactive',
  medium: 'preventive',
  high: 'condition_based',
  critical: 'predictive',
};

/** Последняя по дате оценка для каждого актива (ключ — `assetId`). */
export function latestAssessmentByAsset(
  assessments: CriticalityAssessment[],
): Map<string, CriticalityAssessment> {
  const byAsset = new Map<string, CriticalityAssessment>();
  for (const assessment of assessments) {
    const current = byAsset.get(assessment.assetId);
    if (!current || assessment.assessedAt.localeCompare(current.assessedAt) >= 0) {
      byAsset.set(assessment.assetId, assessment);
    }
  }
  return byAsset;
}
