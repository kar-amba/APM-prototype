import type { Table } from 'dexie';
import type { z } from 'zod';
import type { Repository } from '../repository';
import type { Migrator } from '../migrations';

/**
 * Репозиторий поверх таблицы Dexie (IndexedDB). Все операции дожидаются `ready` —
 * промиса открытия БД и первичного сидирования (см. `createDexieAppRepository`).
 * На чтении записи прогоняются через адаптер миграции (если задан) и валидируются
 * Zod — записи старого формата мигрируются на лету.
 */
export class DexieRepository<T extends { id: string }>
  implements Repository<T>
{
  private readonly table: Table<T, string>;
  private readonly ready: Promise<void>;
  private readonly schema?: z.ZodType<T>;
  private readonly migrate?: Migrator;

  constructor(
    table: Table<T, string>,
    ready: Promise<void>,
    schema?: z.ZodType<T>,
    migrate?: Migrator,
  ) {
    this.table = table;
    this.ready = ready;
    this.schema = schema;
    this.migrate = migrate;
  }

  /** Применяет адаптер миграции и (если задана) Zod-схему к одной записи. */
  private coerce(raw: unknown): T {
    const migrated = this.migrate ? this.migrate(raw) : raw;
    return this.schema ? this.schema.parse(migrated) : (migrated as T);
  }

  async list(): Promise<T[]> {
    await this.ready;
    const rows = await this.table.toArray();
    return rows.map((row) => this.coerce(row));
  }

  async getById(id: string): Promise<T | undefined> {
    await this.ready;
    const row = await this.table.get(id);
    return row === undefined ? undefined : this.coerce(row);
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
