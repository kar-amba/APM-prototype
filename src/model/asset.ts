import { z } from 'zod';
import { assetStatusSchema, criticalityLevelSchema } from './common';

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
  /** Функциональное место установки. */
  functionalLocationId: z.string().min(1),
  /** Родительский актив (узел/единица), если это узел или компонент. */
  parentAssetId: z.string().nullable(),
  status: assetStatusSchema,
  criticality: criticalityLevelSchema,
  manufacturer: z.string().optional(),
  modelName: z.string().optional(),
  serialNumber: z.string().optional(),
  inventoryNumber: z.string().optional(),
  /** ISO-дата ввода в эксплуатацию. */
  commissionedAt: z.string().optional(),
  owner: z.string().optional(),
  planner: z.string().optional(),
});

export type Asset = z.infer<typeof assetSchema>;
