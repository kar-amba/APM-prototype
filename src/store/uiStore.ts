import { create } from 'zustand';

/** Демонстрационные роли (акценты интерфейса, не реальная система прав). */
export const ROLES = [
  'reliabilityEngineer',
  'maintenancePlanner',
  'operator',
  'manager',
] as const;

export type Role = (typeof ROLES)[number];

interface UiState {
  /** Текущая выбранная роль. */
  role: Role;
  setRole: (role: Role) => void;
}

export const useUiStore = create<UiState>((set) => ({
  role: 'reliabilityEngineer',
  setRole: (role) => set({ role }),
}));
