import { z } from 'zod';
import { scalarValueSchema } from './common';

/** Тип точки контроля на маршруте. */
export const routePointKindSchema = z.enum([
  'measurement', // числовой замер с допустимым диапазоном
  'checklist', // пункт чек-листа (да/нет, осмотр)
]);
export type RoutePointKind = z.infer<typeof routePointKindSchema>;

/** Маршрут обхода — упорядоченный набор точек контроля. */
export const routeSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});
export type Route = z.infer<typeof routeSchema>;

/** Точка контроля на маршруте (замер или пункт чек-листа). */
export const routePointSchema = z.object({
  id: z.string().min(1),
  routeId: z.string().min(1),
  /** Порядок обхода точки. */
  order: z.number().int().nonnegative(),
  assetId: z.string().min(1),
  name: z.string().min(1),
  kind: routePointKindSchema,
  /** Код единицы измерения (для замеров). */
  unitId: z.string().optional(),
  /** Допустимый диапазон значения (для замеров). */
  min: z.number().optional(),
  max: z.number().optional(),
});
export type RoutePoint = z.infer<typeof routePointSchema>;

/** Статус выполнения обхода. */
export const roundStatusSchema = z.enum(['planned', 'in_progress', 'done']);
export type RoundStatus = z.infer<typeof roundStatusSchema>;

/** Выполнение обхода по маршруту. */
export const roundExecutionSchema = z.object({
  id: z.string().min(1),
  routeId: z.string().min(1),
  /** Кто выполняет (id персонала). */
  performedById: z.string().optional(),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  status: roundStatusSchema,
});
export type RoundExecution = z.infer<typeof roundExecutionSchema>;

/** Замер по точке контроля в рамках выполнения обхода. */
export const readingSchema = z.object({
  id: z.string().min(1),
  roundExecutionId: z.string().min(1),
  routePointId: z.string().min(1),
  recordedAt: z.string(),
  value: scalarValueSchema,
  /** Значение вне допустимого диапазона → отклонение (порождает дефект). */
  isDeviation: z.boolean().default(false),
});
export type Reading = z.infer<typeof readingSchema>;
