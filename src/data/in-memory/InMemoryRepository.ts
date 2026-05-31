import type { z } from 'zod';
import type { Repository } from '../repository';

/**
 * Универсальный in-memory репозиторий. Данные валидируются Zod-схемой на
 * границе (при загрузке сидов) — никаких «угаданных» форм.
 */
export class InMemoryRepository<T extends { id: string }>
  implements Repository<T>
{
  private items: Map<string, T>;

  constructor(seed: readonly T[], schema: z.ZodType<T>) {
    const validated = seed.map((item) => schema.parse(item));
    this.items = new Map(validated.map((item) => [item.id, item]));
  }

  async list(): Promise<T[]> {
    return [...this.items.values()];
  }

  async getById(id: string): Promise<T | undefined> {
    return this.items.get(id);
  }

  async create(entity: T): Promise<T> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Entity with id "${id}" not found`);
    }
    const updated = { ...existing, ...patch };
    this.items.set(id, updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.items.delete(id);
  }
}
