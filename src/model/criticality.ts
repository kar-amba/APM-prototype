import { z } from 'zod';
import { criticalityLevelSchema } from './common';

/**
 * Оценка критичности актива по матрице «последствия × вероятность» (RCM/FMECA).
 * Итоговый класс ранжирует оборудование и влияет на выбор стратегии.
 */
export const criticalityAssessmentSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  /** Тяжесть последствий отказа (1–5). */
  consequence: z.number().int().min(1).max(5),
  /** Вероятность отказа (1–5). */
  probability: z.number().int().min(1).max(5),
  /** Произведение (риск-балл) consequence × probability. */
  score: z.number().int().min(1).max(25),
  level: criticalityLevelSchema,
  assessedAt: z.string(),
  assessedById: z.string().optional(),
});
export type CriticalityAssessment = z.infer<typeof criticalityAssessmentSchema>;
