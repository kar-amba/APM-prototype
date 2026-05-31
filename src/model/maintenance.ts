import { z } from 'zod';

/** Тип стратегии обслуживания (от реактивной к предиктивной). */
export const strategyTypeSchema = z.enum([
  'reactive', // реактивная (до отказа)
  'preventive', // планово-предупредительная (ППР)
  'condition_based', // по состоянию
  'predictive', // предиктивная
]);
export type StrategyType = z.infer<typeof strategyTypeSchema>;

/** Стратегия обслуживания; привязывается к активам и/или классам. */
export const strategySchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  type: strategyTypeSchema,
  description: z.string().optional(),
});
export type Strategy = z.infer<typeof strategySchema>;

/** Тип мероприятия ТОиР. */
export const maintenanceTaskKindSchema = z.enum(['ppr', 'inspection', 'condition']);
export type MaintenanceTaskKind = z.infer<typeof maintenanceTaskKindSchema>;

/**
 * Мероприятие ТОиР — конкретная задача стратегии с интервалом. Может быть
 * привязана к активу и/или к классу оборудования.
 */
export const maintenanceTaskSchema = z.object({
  id: z.string().min(1),
  strategyId: z.string().min(1),
  name: z.string().min(1),
  kind: maintenanceTaskKindSchema,
  /** Периодичность в днях. */
  intervalDays: z.number().int().positive(),
  assetId: z.string().nullable(),
  classificationId: z.string().nullable(),
});
export type MaintenanceTask = z.infer<typeof maintenanceTaskSchema>;
