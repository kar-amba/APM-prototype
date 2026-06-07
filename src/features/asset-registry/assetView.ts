import type { Asset, AssetAttributeValue, AttributeDefinition } from '@/model';
import type { AttributeRow } from './AssetDetails';

/**
 * Собирает строки атрибутов класса актива с подтянутыми значениями. Вынесено из
 * `AssetRegistryPage`, чтобы переиспользовать на полной карточке (`AssetCardPage`).
 */
export function buildAttributeRows(
  asset: Asset,
  attributeDefs: AttributeDefinition[],
  attributeValues: AssetAttributeValue[],
  unitCodes: Map<string, string>,
  labels: { yes: string; no: string },
): AttributeRow[] {
  if (!asset.classificationId) return [];
  const defs = attributeDefs.filter(
    (d) => d.classificationId === asset.classificationId,
  );
  const valueByAttr = new Map(
    attributeValues
      .filter((v) => v.assetId === asset.id)
      .map((v) => [v.attributeId, v.value]),
  );
  return defs.map((def) => {
    const raw = valueByAttr.get(def.id);
    let valueText: string | undefined;
    if (typeof raw === 'boolean') {
      valueText = raw ? labels.yes : labels.no;
    } else if (raw !== undefined) {
      const unit = def.unitId ? unitCodes.get(def.unitId) : undefined;
      valueText = unit ? `${raw} ${unit}` : String(raw);
    }
    return { id: def.id, name: def.name, valueText };
  });
}
