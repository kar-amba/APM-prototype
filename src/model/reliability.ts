import { z } from 'zod';
import { criticalityLevelSchema } from './common';

/** Источник дефекта/уведомления. */
export const defectSourceSchema = z.enum([
  'round', // отклонение на обходе
  'simulator', // отклонение от симулятора телеметрии
  'manual', // заведён вручную
]);
export type DefectSource = z.infer<typeof defectSourceSchema>;

/** Статус дефекта. */
export const defectStatusSchema = z.enum([
  'open',
  'in_progress',
  'resolved',
  'closed',
]);
export type DefectStatus = z.infer<typeof defectStatusSchema>;

/**
 * Дефект — порождается отклонением на обходе/симуляторе либо заводится вручную.
 */
export const defectSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  source: defectSourceSchema,
  severity: criticalityLevelSchema,
  status: defectStatusSchema,
  detectedAt: z.string(),
  /** Замер-источник (если дефект порождён обходом). */
  readingId: z.string().nullable(),
});
export type Defect = z.infer<typeof defectSchema>;

/** Уведомление — отражается в оболочке и на дашборде. */
export const notificationSchema = z.object({
  id: z.string().min(1),
  defectId: z.string().nullable(),
  assetId: z.string().nullable(),
  message: z.string().min(1),
  createdAt: z.string(),
  read: z.boolean().default(false),
});
export type Notification = z.infer<typeof notificationSchema>;
