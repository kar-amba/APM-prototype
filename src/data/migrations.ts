import { orgUnitSeed, personSeed, statusSeed } from './mock';

/**
 * Адаптеры миграции данных на границе хранилища. Применяются к «сырым» записям
 * перед валидацией Zod при чтении из localStorage/Dexie, чтобы записи в старом
 * формате (созданные до фазы 1.1) не терялись и не ломали приложение.
 *
 * Для актива (фаза 1.1): прежний enum `status` → `statusId` (ссылка на состояние
 * схемы `ss-asset`); строковые `owner`/`planner` → `ownerId` (`OrgUnit`) и
 * `plannerId` (`Person`).
 */

/** Сигнатура одноразового адаптера записи на чтении из хранилища. */
export type Migrator = (raw: unknown) => unknown;

const assetStatusIdByCode = new Map(
  statusSeed.filter((s) => s.schemeId === 'ss-asset').map((s) => [s.code, s.id]),
);
const orgUnitIdByCode = new Map(orgUnitSeed.map((o) => [o.code, o.id]));
const personIdByName = new Map(personSeed.map((p) => [p.name, p.id]));

const FALLBACK_STATUS_ID = assetStatusIdByCode.get('in_operation');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Миграция записи актива из формата до фазы 1.1 к ссылочной модели. */
export const migrateAsset: Migrator = (raw) => {
  if (!isRecord(raw)) return raw;
  const next = { ...raw };

  if (next.statusId === undefined && typeof next.status === 'string') {
    next.statusId = assetStatusIdByCode.get(next.status) ?? FALLBACK_STATUS_ID;
  }
  delete next.status;

  if (next.ownerId === undefined && typeof next.owner === 'string') {
    const mapped = orgUnitIdByCode.get(next.owner);
    if (mapped) next.ownerId = mapped;
  }
  delete next.owner;

  if (next.plannerId === undefined && typeof next.planner === 'string') {
    const mapped = personIdByName.get(next.planner);
    if (mapped) next.plannerId = mapped;
  }
  delete next.planner;

  return next;
};
