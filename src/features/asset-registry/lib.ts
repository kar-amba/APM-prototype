import type { BadgeTone } from '@/shared/ui';
import type {
  Asset,
  AssetStatus,
  CriticalityLevel,
  FunctionalLocation,
} from '@/model';

export interface LocationNode extends FunctionalLocation {
  children: LocationNode[];
}

/** Сворачивает плоский список функциональных мест в дерево по parentId. */
export function buildLocationTree(
  locations: FunctionalLocation[],
): LocationNode[] {
  const byId = new Map<string, LocationNode>();
  for (const loc of locations) {
    byId.set(loc.id, { ...loc, children: [] });
  }

  const roots: LocationNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Все id функционального места и его потомков (включительно). */
export function collectDescendantIds(
  rootId: string,
  locations: FunctionalLocation[],
): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const loc of locations) {
    if (loc.parentId) {
      const list = childrenByParent.get(loc.parentId) ?? [];
      list.push(loc.id);
      childrenByParent.set(loc.parentId, list);
    }
  }

  const result = new Set<string>();
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      stack.push(childId);
    }
  }
  return result;
}

/** Активы, относящиеся к выбранной ветке функциональных мест. */
export function filterAssetsByLocation(
  assets: Asset[],
  selectedLocationId: string | null,
  locations: FunctionalLocation[],
): Asset[] {
  if (!selectedLocationId) return assets;
  const ids = collectDescendantIds(selectedLocationId, locations);
  return assets.filter((a) => ids.has(a.functionalLocationId));
}

export const statusTone: Record<AssetStatus, BadgeTone> = {
  in_operation: 'success',
  standby: 'info',
  maintenance: 'warning',
  fault: 'error',
  decommissioned: 'default',
};

export const criticalityTone: Record<CriticalityLevel, BadgeTone> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};
