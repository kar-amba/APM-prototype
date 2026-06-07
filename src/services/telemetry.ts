import type { RoutePoint } from '@/model';

/**
 * Симулятор телеметрии (доменная логика, чистые функции). Генерирует показания
 * датчиков во времени по точкам контроля: случайное блуждание около предыдущего
 * значения с возвратом к центру допустимого диапазона и периодическим выходом за
 * границу — это порождает дефект/уведомление тем же механизмом, что и ручной
 * замер на обходе (см. `services/rounds.ts`). Императивный таймер и запись через
 * репозиторий живут в `store/simulatorStore.ts` — здесь только правила.
 */

/** Скорость симуляции: ключ → интервал тика в миллисекундах. */
export const SIMULATION_SPEEDS = ['slow', 'normal', 'fast'] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export const SPEED_INTERVAL_MS: Record<SimulationSpeed, number> = {
  slow: 5000,
  normal: 2500,
  fast: 1000,
};

/** Вероятность того, что очередной замер выйдет за допустимый диапазон. */
export const DEVIATION_PROBABILITY = 0.12;

/** Префикс id замеров симулятора — отличает их от ручных замеров обхода. */
export const TELEMETRY_READING_PREFIX = 'rd-sim-';

/** Сколько последних замеров симулятора хранить на точку (ограничение роста). */
export const TELEMETRY_RETENTION_PER_POINT = 40;

/** Точка контроля пригодна для симуляции: числовой замер с границей диапазона. */
export function isSimulablePoint(point: RoutePoint): boolean {
  return (
    point.kind === 'measurement' &&
    (point.min !== undefined || point.max !== undefined)
  );
}

/** Точки контроля, по которым симулятор генерирует показания. */
export function measurementPoints(points: RoutePoint[]): RoutePoint[] {
  return points.filter(isSimulablePoint);
}

/** Замер создан симулятором телеметрии (по префиксу id). */
export function isTelemetryReadingId(id: string): boolean {
  return id.startsWith(TELEMETRY_READING_PREFIX);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Границы диапазона точки с разумными значениями по умолчанию. */
function bounds(point: RoutePoint): { lo: number; hi: number } {
  const lo = point.min ?? (point.max !== undefined ? point.max - 10 : 0);
  const hi = point.max ?? lo + 10;
  return { lo, hi };
}

/** Стартовое значение для точки — середина допустимого диапазона. */
export function seedValue(point: RoutePoint): number {
  const { lo, hi } = bounds(point);
  return round1((lo + hi) / 2);
}

/** Нужно ли сделать текущий замер отклонением (по вероятности). */
export function shouldDeviate(probability: number = DEVIATION_PROBABILITY): boolean {
  return Math.random() < probability;
}

/**
 * Следующее показание датчика. В норме — блуждание около предыдущего значения с
 * мягким возвратом к центру диапазона (значение остаётся внутри допуска).
 * При `deviate` — намеренный выход за ближайшую границу (имитация зарождающегося
 * дефекта), что приведёт к созданию дефекта и уведомления.
 */
export function nextValue(
  point: RoutePoint,
  last: number,
  deviate: boolean,
): number {
  const { lo, hi } = bounds(point);
  const span = hi - lo || 1;

  if (deviate) {
    const excess = span * (0.05 + Math.random() * 0.2);
    return round1(Math.random() < 0.5 ? lo - excess : hi + excess);
  }

  const center = (lo + hi) / 2;
  const noise = (Math.random() - 0.5) * span * 0.18;
  const pull = (center - last) * 0.12;
  let value = last + noise + pull;

  const margin = span * 0.04;
  if (value < lo + margin) value = lo + margin;
  if (value > hi - margin) value = hi - margin;
  return round1(value);
}
