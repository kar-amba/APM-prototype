import { useMemo } from 'react';
import {
  getRoleAccentProfile,
  getRoleDashboardProfile,
  getRoleHomeProfile,
  getRoleProfile,
  type RoleProfile,
} from '@/services/role-profiles';
import { useUiStore, type Role } from '@/store/uiStore';

/** Текущая демонстрационная роль и её профиль акцентов. */
export function useRoleProfile(): { role: Role; profile: RoleProfile } {
  const role = useUiStore((s) => s.role);
  const profile = useMemo(() => getRoleProfile(role), [role]);
  return { role, profile };
}

/** Только профиль дашборда для текущей роли. */
export function useRoleDashboardProfile() {
  const role = useUiStore((s) => s.role);
  return useMemo(() => getRoleDashboardProfile(role), [role]);
}

/** Стартовый раздел и акценты навигации для текущей роли. */
export function useRoleAccentProfile() {
  const role = useUiStore((s) => s.role);
  return useMemo(
    () => ({
      home: getRoleHomeProfile(role),
      accent: getRoleAccentProfile(role),
    }),
    [role],
  );
}
