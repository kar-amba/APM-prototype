import { z } from 'zod';
import { criticalityLevelSchema } from './common';

/**
 * Актив (оборудование) — «что» физически установлено.
 * Привязан к функциональному месту или к родительскому активу (без «сирот»).
 */
export const assetSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  /** Класс по классификатору (напр. «Насос центробежный»). */
  classification: z.string().min(1),
  /** Ссылка на класс в классификаторе (задел под динамические атрибуты). */
  classificationId: z.string().optional(),
  /** Функциональное место установки. */
  functionalLocationId: z.string().min(1),
  /** Родительский актив (узел/единица), если это узел или компонент. */
  parentAssetId: z.string().nullable(),
  /**
   * Текущий статус — ссылка на состояние (`Status.id`) статусной схемы актива
   * (`entityKind='asset'`). Заменяет прежний enum `status`; переходы валидируются
   * по схеме через сервис `status-flow`.
   */
  statusId: z.string().min(1),
  criticality: criticalityLevelSchema,
  manufacturer: z.string().optional(),
  modelName: z.string().optional(),
  serialNumber: z.string().optional(),
  inventoryNumber: z.string().optional(),
  /** ISO-дата ввода в эксплуатацию. */
  commissionedAt: z.string().optional(),
  /** Владелец-подразделение — ссылка на `OrgUnit`. */
  ownerId: z.string().optional(),
  /** Ответственный планировщик — ссылка на `Person`. */
  plannerId: z.string().optional(),
});

export type Asset = z.infer<typeof assetSchema>;
