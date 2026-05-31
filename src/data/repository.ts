import type { Asset, FunctionalLocation } from '@/model';

/**
 * Слой доступа к данным. Остальной код зависит только от этого интерфейса,
 * а не от конкретного хранилища (in-memory / localStorage / Dexie / БД).
 *
 * В v1 реализован режим in-memory (сиды). create/update/delete — заготовки
 * под интерактивный CRUD на следующих шагах.
 */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface AppRepository {
  functionalLocations: Repository<FunctionalLocation>;
  assets: Repository<Asset>;
}
