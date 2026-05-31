import { z } from 'zod';

/** Уровень функционального места (где выполняется функция). */
export const functionalLocationLevelSchema = z.enum([
  'enterprise', // Предприятие
  'shop', // Цех
  'area', // Участок
  'position', // Технологическая позиция
]);
export type FunctionalLocationLevel = z.infer<
  typeof functionalLocationLevelSchema
>;

/** Статус актива (демо-набор; в проде задаётся статусной схемой). */
export const assetStatusSchema = z.enum([
  'in_operation', // В работе
  'standby', // В резерве
  'maintenance', // На обслуживании
  'fault', // Неисправен
  'decommissioned', // Выведен из эксплуатации
]);
export type AssetStatus = z.infer<typeof assetStatusSchema>;

/** Критичность оборудования (RCM/FMECA-ранжирование). */
export const criticalityLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export type CriticalityLevel = z.infer<typeof criticalityLevelSchema>;
