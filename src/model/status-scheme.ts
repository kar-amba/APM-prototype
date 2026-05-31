import { z } from 'zod';
import { statusEntityKindSchema, statusToneSchema } from './common';

/**
 * Статусная схема — настраиваемая модель состояний и переходов, применяемая к
 * сущностям (активы, анализы, стратегии, мероприятия, маршруты, обходы).
 * Полный конструктор — в разделе «Статусные схемы» (план 06).
 */
export const statusSchemeSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  entityKind: statusEntityKindSchema,
});
export type StatusScheme = z.infer<typeof statusSchemeSchema>;

/** Состояние в рамках статусной схемы. */
export const statusSchema = z.object({
  id: z.string().min(1),
  schemeId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  tone: statusToneSchema,
  /** Начальное состояние схемы. */
  isInitial: z.boolean().default(false),
  /** Конечное состояние (из него переходов нет). */
  isFinal: z.boolean().default(false),
});
export type Status = z.infer<typeof statusSchema>;

/** Разрешённый переход между состояниями схемы. */
export const transitionSchema = z.object({
  id: z.string().min(1),
  schemeId: z.string().min(1),
  fromStatusId: z.string().min(1),
  toStatusId: z.string().min(1),
});
export type Transition = z.infer<typeof transitionSchema>;
