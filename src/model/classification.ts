import { z } from 'zod';
import { attributeValueTypeSchema, scalarValueSchema } from './common';

/**
 * Класс оборудования по классификатору (напр. Насос → Центробежный → Консольный).
 * Дерево классов: `parentId` ссылается на родительский класс.
 */
export const classificationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().nullable(),
});
export type Classification = z.infer<typeof classificationSchema>;

/**
 * Определение атрибута класса. Подтягивается в карточку актива только для
 * релевантного класса (для насоса — подача/напор; для двигателя — об/мин и т.д.).
 */
export const attributeDefinitionSchema = z.object({
  id: z.string().min(1),
  classificationId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  valueType: attributeValueTypeSchema,
  /** Код единицы измерения (для числовых атрибутов). */
  unitId: z.string().optional(),
  /** Допустимый диапазон для числовых атрибутов. */
  min: z.number().optional(),
  max: z.number().optional(),
  /** Варианты значений для enum-атрибутов. */
  options: z.array(z.string()).optional(),
});
export type AttributeDefinition = z.infer<typeof attributeDefinitionSchema>;

/** Значение атрибута класса для конкретного актива. */
export const assetAttributeValueSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().min(1),
  attributeId: z.string().min(1),
  value: scalarValueSchema,
});
export type AssetAttributeValue = z.infer<typeof assetAttributeValueSchema>;
