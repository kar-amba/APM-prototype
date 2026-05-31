import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAppRepository,
  resetAppRepository,
  type StorageMode,
} from '@/data';
import type { AppRepository } from '@/data';

interface DataState {
  /** Текущий режим хранения (персистится между сессиями). */
  storageMode: StorageMode;
  /**
   * Счётчик ревизий данных. Увеличивается при смене режима, сбросе и после
   * CRUD-операций — разделы используют его как зависимость для перезагрузки.
   */
  revision: number;
  setStorageMode: (mode: StorageMode) => void;
  /** Сброс данных текущего режима к исходным сидам. */
  resetData: () => Promise<void>;
  /** Сигнал «данные изменились» — заставить разделы перечитать репозиторий. */
  bumpRevision: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      storageMode: 'seeds',
      revision: 0,
      setStorageMode: (mode) =>
        set((s) => ({ storageMode: mode, revision: s.revision + 1 })),
      resetData: async () => {
        await resetAppRepository(get().storageMode);
        set((s) => ({ revision: s.revision + 1 }));
      },
      bumpRevision: () => set((s) => ({ revision: s.revision + 1 })),
    }),
    {
      name: 'apm:settings',
      partialize: (s) => ({ storageMode: s.storageMode }),
    },
  ),
);

/** Текущий репозиторий приложения по выбранному режиму хранения. */
export function useRepository(): AppRepository {
  const mode = useDataStore((s) => s.storageMode);
  return getAppRepository(mode);
}
