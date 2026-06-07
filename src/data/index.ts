import Dexie from 'dexie';
import type { AppRepository, Repository } from './repository';
import { InMemoryRepository } from './in-memory/InMemoryRepository';
import { LocalStorageRepository } from './local-storage/LocalStorageRepository';
import { DexieRepository } from './dexie/DexieRepository';
import { DATASETS, type Entity, type EntityDescriptor } from './datasets';

/**
 * Режим хранения данных (системная настройка прототипа):
 * - `seeds` — данные в памяти из сидов, сброс при перезагрузке (по умолчанию);
 * - `local` — localStorage, изменения сохраняются между сессиями;
 * - `dexie` — IndexedDB через Dexie, изменения сохраняются между сессиями;
 * - `database` — заготовка под реальный бэкенд, в v1 не реализуется.
 */
export type StorageMode = 'seeds' | 'local' | 'dexie' | 'database';

export const STORAGE_MODES: StorageMode[] = ['seeds', 'local', 'dexie', 'database'];

const LS_PREFIX = 'apm:data:';
const DEXIE_DB_NAME = 'apm-glowbyte';

/** Собирает `AppRepository`, создавая репозиторий на каждый датасет. */
function buildRepository(
  make: (descriptor: EntityDescriptor) => Repository<Entity>,
): AppRepository {
  const repositories: Record<string, Repository<Entity>> = {};
  for (const descriptor of DATASETS) {
    repositories[descriptor.key] = make(descriptor);
  }
  return repositories as unknown as AppRepository;
}

function createInMemory(): AppRepository {
  return buildRepository(
    (d) => new InMemoryRepository(d.seed, d.schema, d.migrate),
  );
}

function createLocalStorage(): AppRepository {
  return buildRepository(
    (d) =>
      new LocalStorageRepository(
        `${LS_PREFIX}${d.key}`,
        d.seed,
        d.schema,
        d.migrate,
      ),
  );
}

function createDexie(): AppRepository {
  const db = new Dexie(DEXIE_DB_NAME);
  db.version(1).stores(
    Object.fromEntries(DATASETS.map((d) => [d.key, 'id'])),
  );

  // Открываем БД и при пустых таблицах загружаем сиды (валидируя Zod).
  const ready = (async () => {
    await db.open();
    for (const d of DATASETS) {
      const table = db.table(d.key);
      if (d.seed.length > 0 && (await table.count()) === 0) {
        await table.bulkPut(d.seed.map((item) => d.schema.parse(item)));
      }
    }
  })();

  return buildRepository(
    (d) =>
      new DexieRepository(
        db.table<Entity, string>(d.key),
        ready,
        d.schema,
        d.migrate,
      ),
  );
}

function createForMode(mode: StorageMode): AppRepository {
  switch (mode) {
    case 'seeds':
      return createInMemory();
    case 'local':
      return createLocalStorage();
    case 'dexie':
      return createDexie();
    case 'database':
      throw new Error(
        'Режим «База данных» — заготовка и не реализуется в v1 прототипа.',
      );
  }
}

/** Кэш экземпляров по режиму — один репозиторий на режим. */
const cache: Partial<Record<StorageMode, AppRepository>> = {};

/** Возвращает (создавая при необходимости) репозиторий для режима хранения. */
export function getAppRepository(mode: StorageMode): AppRepository {
  if (!cache[mode]) {
    cache[mode] = createForMode(mode);
  }
  return cache[mode]!;
}

/** Очищает персистентное хранилище режима (для сброса к исходным сидам). */
async function clearPersistent(mode: StorageMode): Promise<void> {
  if (mode === 'local') {
    for (const d of DATASETS) {
      localStorage.removeItem(`${LS_PREFIX}${d.key}`);
    }
  } else if (mode === 'dexie') {
    await Dexie.delete(DEXIE_DB_NAME);
  }
}

/** Сбрасывает данные режима к исходным сидам и возвращает свежий репозиторий. */
export async function resetAppRepository(
  mode: StorageMode,
): Promise<AppRepository> {
  await clearPersistent(mode);
  cache[mode] = createForMode(mode);
  return cache[mode]!;
}

/** Репозиторий по умолчанию (режим сидов) — для кода вне стора данных. */
export const appRepository = getAppRepository('seeds');

export type { AppRepository, Repository } from './repository';
