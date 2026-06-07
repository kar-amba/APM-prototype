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

/**
 * Статус актива (исторический enum-набор).
 *
 * @deprecated Статус актива хранится как ссылка `Asset.statusId` на состояние
 * статусной схемы (`entityKind='asset'`). Эти коды совпадают с `Status.code`
 * базовой схемы `ss-asset` и используются только для миграции старых записей
 * (см. `data/migrations.ts`). Новый код не должен опираться на этот enum.
 */
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

/**
 * Семантический тон состояния/бейджа (соответствует `BadgeTone` в `shared/ui`).
 * Используется статусными схемами для окраски состояний.
 */
export const statusToneSchema = z.enum([
  'default',
  'info',
  'success',
  'warning',
  'error',
]);
export type StatusTone = z.infer<typeof statusToneSchema>;

/** Тип значения атрибута классификации. */
export const attributeValueTypeSchema = z.enum([
  'number', // числовой (с единицей измерения и диапазоном)
  'text', // строковый
  'boolean', // да/нет
  'enum', // выбор из списка
]);
export type AttributeValueType = z.infer<typeof attributeValueTypeSchema>;

/**
 * Сущности, к которым применима статусная схема (см. продукт, раздел 4 п.7).
 */
export const statusEntityKindSchema = z.enum([
  'asset', // активы
  'analysis', // анализы (критичность)
  'strategy', // стратегии
  'task', // мероприятия
  'route', // маршруты
  'round', // обходы
]);
export type StatusEntityKind = z.infer<typeof statusEntityKindSchema>;

/** Значение замера/атрибута: число, строка или булево. */
export const scalarValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
]);
export type ScalarValue = z.infer<typeof scalarValueSchema>;

/** Тип идентификатора сущности (для читаемости сигнатур). */
export type Id = string;
