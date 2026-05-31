import { z } from 'zod';

/** Производитель оборудования. */
export const manufacturerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z.string().optional(),
});
export type Manufacturer = z.infer<typeof manufacturerSchema>;

/** Тип организационной единицы. */
export const orgUnitKindSchema = z.enum(['shop', 'area']);
export type OrgUnitKind = z.infer<typeof orgUnitKindSchema>;

/** Организационная единица (цех / участок) — оргструктура предприятия. */
export const orgUnitSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  kind: orgUnitKindSchema,
  parentId: z.string().nullable(),
});
export type OrgUnit = z.infer<typeof orgUnitSchema>;

/** Сотрудник (владелец/планировщик/исполнитель обходов). */
export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.string().optional(),
  orgUnitId: z.string().optional(),
});
export type Person = z.infer<typeof personSchema>;

/** Единица измерения. */
export const unitOfMeasureSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
});
export type UnitOfMeasure = z.infer<typeof unitOfMeasureSchema>;

/** Тип документа актива. */
export const documentKindSchema = z.enum([
  'passport',
  'photo',
  'scheme',
  'manual',
]);
export type DocumentKind = z.infer<typeof documentKindSchema>;

/** Документ, привязанный к активу (паспорт, фото, схема). */
export const documentSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  title: z.string().min(1),
  kind: documentKindSchema,
  url: z.string().optional(),
});
export type AppDocument = z.infer<typeof documentSchema>;
