import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { emptyFilters, type AssetFilters } from './lib';

/** Сохранённое представление — именованный набор фильтров. */
export interface SavedView {
  id: string;
  name: string;
  filters: AssetFilters;
}

interface SearchState {
  /** Текущие фильтры (в памяти, не персистятся). */
  filters: AssetFilters;
  /** Сохранённые представления (персистятся между сессиями). */
  savedViews: SavedView[];
  setFilters: (patch: Partial<AssetFilters>) => void;
  setAttribute: (patch: Partial<AssetFilters['attribute']>) => void;
  resetFilters: () => void;
  saveView: (name: string) => void;
  loadView: (id: string) => void;
  deleteView: (id: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      filters: emptyFilters,
      savedViews: [],
      setFilters: (patch) =>
        set((s) => ({ filters: { ...s.filters, ...patch } })),
      setAttribute: (patch) =>
        set((s) => ({
          filters: { ...s.filters, attribute: { ...s.filters.attribute, ...patch } },
        })),
      resetFilters: () => set({ filters: emptyFilters }),
      saveView: (name) =>
        set((s) => ({
          savedViews: [
            ...s.savedViews,
            { id: `view-${nanoid(8)}`, name, filters: s.filters },
          ],
        })),
      loadView: (id) => {
        const view = get().savedViews.find((v) => v.id === id);
        if (view) set({ filters: view.filters });
      },
      deleteView: (id) =>
        set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),
    }),
    {
      name: 'apm:search-views',
      partialize: (s) => ({ savedViews: s.savedViews }),
    },
  ),
);
