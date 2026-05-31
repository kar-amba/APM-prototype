import { assetSchema, functionalLocationSchema } from '@/model';
import type { AppRepository } from './repository';
import { InMemoryRepository } from './in-memory/InMemoryRepository';
import { assetSeed, functionalLocationSeed } from './mock/seed';

/**
 * Фабрика репозитория. В v1 — режим in-memory (сиды). Другие режимы хранения
 * (localStorage / Dexie / БД) подключаются здесь, не затрагивая остальной код.
 */
export function createAppRepository(): AppRepository {
  return {
    functionalLocations: new InMemoryRepository(
      functionalLocationSeed,
      functionalLocationSchema,
    ),
    assets: new InMemoryRepository(assetSeed, assetSchema),
  };
}

/** Единый экземпляр репозитория для приложения. */
export const appRepository = createAppRepository();

export type { AppRepository, Repository } from './repository';
