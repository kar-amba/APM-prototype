import { z } from 'zod';
import type { Repository } from '../repository';
import type { Migrator } from '../migrations';

/**
 * Репозиторий поверх localStorage. Данные сохраняются между сессиями; при первом
 * обращении (пустой ключ) загружаются сиды. Каждое чтение прогоняется через
 * адаптер миграции (если задан) и валидируется Zod — повреждённые данные не
 * попадают в приложение, а записи старого формата мигрируются на лету.
 */
export class LocalStorageRepository<T extends { id: string }>
  implements Repository<T>
{
  private readonly storageKey: string;
  private readonly schema: z.ZodType<T>;
  private readonly migrate?: Migrator;

  constructor(
    storageKey: string,
    seed: readonly T[],
    schema: z.ZodType<T>,
    migrate?: Migrator,
  ) {
    this.storageKey = storageKey;
    this.schema = schema;
    this.migrate = migrate;
    if (localStorage.getItem(storageKey) === null) {
      this.writeAll(seed.map((item) => schema.parse(item)));
    }
  }

  private readAll(): T[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [];
      const migrated = this.migrate ? items.map(this.migrate) : items;
      return z.array(this.schema).parse(migrated);
    } catch {
      return [];
    }
  }

  private writeAll(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async list(): Promise<T[]> {
    return this.readAll();
  }

  async getById(id: string): Promise<T | undefined> {
    return this.readAll().find((item) => item.id === id);
  }

  async create(entity: T): Promise<T> {
    const parsed = this.schema.parse(entity);
    const items = this.readAll().filter((item) => item.id !== parsed.id);
    items.push(parsed);
    this.writeAll(items);
    return parsed;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const items = this.readAll();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error(`Entity with id "${id}" not found`);
    }
    const updated = this.schema.parse({ ...items[index], ...patch });
    items[index] = updated;
    this.writeAll(items);
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((item) => item.id !== id));
  }
}
