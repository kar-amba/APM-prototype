import type { Table } from 'dexie';
import type { Repository } from '../repository';

/**
 * Репозиторий поверх таблицы Dexie (IndexedDB). Все операции дожидаются `ready` —
 * промиса открытия БД и первичного сидирования (см. `createDexieAppRepository`).
 */
export class DexieRepository<T extends { id: string }>
  implements Repository<T>
{
  private readonly table: Table<T, string>;
  private readonly ready: Promise<void>;

  constructor(table: Table<T, string>, ready: Promise<void>) {
    this.table = table;
    this.ready = ready;
  }

  async list(): Promise<T[]> {
    await this.ready;
    return this.table.toArray();
  }

  async getById(id: string): Promise<T | undefined> {
    await this.ready;
    return this.table.get(id);
  }

  async create(entity: T): Promise<T> {
    await this.ready;
    await this.table.put(entity);
    return entity;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    await this.ready;
    const existing = await this.table.get(id);
    if (!existing) {
      throw new Error(`Entity with id "${id}" not found`);
    }
    const updated = { ...existing, ...patch } as T;
    await this.table.put(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.ready;
    await this.table.delete(id);
  }
}
