import type {
  Asset,
  AssetAttributeValue,
  AttributeDefinition,
  FunctionalLocation,
} from '@/model';
import { collectDescendantIds } from '@/features/asset-registry/lib';

export type AttributeOperator = 'gte' | 'lte' | 'eq';

/** Фильтр по значению атрибута классификации (напр. «подача ≥ 100»). */
export interface AttributeFilter {
  attributeId: string;
  operator: AttributeOperator;
  value: string;
}

/** Полный набор фильтров поиска активов. Пустая строка = «без ограничения». */
export interface AssetFilters {
  query: string;
  classificationId: string;
  locationId: string;
  status: string;
  criticality: string;
  manufacturer: string;
  owner: string;
  planner: string;
  attribute: AttributeFilter;
}

export const emptyFilters: AssetFilters = {
  query: '',
  classificationId: '',
  locationId: '',
  status: '',
  criticality: '',
  manufacturer: '',
  owner: '',
  planner: '',
  attribute: { attributeId: '', operator: 'gte', value: '' },
};

interface FilterContext {
  locations: FunctionalLocation[];
  attributeValues: AssetAttributeValue[];
  attributeDefs: AttributeDefinition[];
}

function matchesQuery(asset: Asset, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    asset.code,
    asset.name,
    asset.inventoryNumber,
    asset.serialNumber,
  ].some((field) => field?.toLowerCase().includes(q));
}

function matchesAttribute(
  asset: Asset,
  filter: AttributeFilter,
  ctx: FilterContext,
): boolean {
  if (!filter.attributeId || filter.value.trim() === '') return true;
  const def = ctx.attributeDefs.find((d) => d.id === filter.attributeId);
  const valueRecord = ctx.attributeValues.find(
    (v) => v.assetId === asset.id && v.attributeId === filter.attributeId,
  );
  if (!valueRecord) return false;

  if (def?.valueType === 'number') {
    const actual = Number(valueRecord.value);
    const target = Number(filter.value);
    if (Number.isNaN(actual) || Number.isNaN(target)) return false;
    if (filter.operator === 'gte') return actual >= target;
    if (filter.operator === 'lte') return actual <= target;
    return actual === target;
  }

  return String(valueRecord.value).toLowerCase() === filter.value.trim().toLowerCase();
}

/** Применяет все фильтры к списку активов. */
export function applyFilters(
  assets: Asset[],
  filters: AssetFilters,
  ctx: FilterContext,
): Asset[] {
  const locationIds = filters.locationId
    ? collectDescendantIds(filters.locationId, ctx.locations)
    : null;

  return assets.filter((asset) => {
    if (!matchesQuery(asset, filters.query)) return false;
    if (
      filters.classificationId &&
      asset.classificationId !== filters.classificationId
    )
      return false;
    if (locationIds && !locationIds.has(asset.functionalLocationId))
      return false;
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.criticality && asset.criticality !== filters.criticality)
      return false;
    if (filters.manufacturer && asset.manufacturer !== filters.manufacturer)
      return false;
    if (filters.owner && asset.owner !== filters.owner) return false;
    if (filters.planner && asset.planner !== filters.planner) return false;
    if (!matchesAttribute(asset, filters.attribute, ctx)) return false;
    return true;
  });
}

/** Признак, что задан хотя бы один фильтр (для отображения счётчика/сброса). */
export function hasActiveFilters(filters: AssetFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.classificationId !== '' ||
    filters.locationId !== '' ||
    filters.status !== '' ||
    filters.criticality !== '' ||
    filters.manufacturer !== '' ||
    filters.owner !== '' ||
    filters.planner !== '' ||
    (filters.attribute.attributeId !== '' &&
      filters.attribute.value.trim() !== '')
  );
}
