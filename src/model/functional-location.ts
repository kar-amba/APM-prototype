import { z } from 'zod';
import { functionalLocationLevelSchema } from './common';

/**
 * Функциональное место — «где» выполняется функция.
 * Стабильный скелет иерархии: Предприятие → Цех → Участок → Тех. позиция.
 */
export const functionalLocationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  level: functionalLocationLevelSchema,
  parentId: z.string().nullable(),
});

export type FunctionalLocation = z.infer<typeof functionalLocationSchema>;
