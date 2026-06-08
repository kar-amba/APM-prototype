import type { Role } from '@/store/uiStore';

/** Стартовый раздел при выборе роли (демо-акцент, не ограничение доступа). */
export interface RoleHomeProfile {
  /** Путь маршрута стартового раздела. */
  homePath: string;
}

const HOME_BY_ROLE: Record<Role, RoleHomeProfile> = {
  reliabilityEngineer: { homePath: '/criticality' },
  maintenancePlanner: { homePath: '/assets' },
  operator: { homePath: '/rounds' },
  manager: { homePath: '/' },
};

/** Стартовый раздел для демонстрационной роли. */
export function getRoleHomeProfile(role: Role): RoleHomeProfile {
  return HOME_BY_ROLE[role];
}
