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

/** Идентификаторы KPI-плиток дашборда. */
export type DashboardKpiId = 'assets' | 'operational' | 'defects' | 'deviations';

/** Идентификаторы графиков дашборда. */
export type DashboardChartId = 'defectsTrend' | 'distribution';

/** Идентификаторы виджетов дашборда (таблицы и списки). */
export type DashboardWidgetId =
  | 'topCritical'
  | 'deviations'
  | 'defects'
  | 'rounds';

export interface RoleDashboardProfile {
  /** KPI-плитки, видимые для роли. */
  kpis: DashboardKpiId[];
  /** KPI-плитки, выделяемые акцентом (подмножество kpis). */
  accentKpis: DashboardKpiId[];
  /** Графики, видимые для роли. */
  charts: DashboardChartId[];
  /** Виджеты, видимые для роли. */
  widgets: DashboardWidgetId[];
  /** Виджеты с акцентной рамкой (подмножество widgets). */
  accentWidgets: DashboardWidgetId[];
}

const DASHBOARD_BY_ROLE: Record<Role, RoleDashboardProfile> = {
  reliabilityEngineer: {
    kpis: ['assets', 'defects', 'deviations'],
    accentKpis: ['defects'],
    charts: ['defectsTrend', 'distribution'],
    widgets: ['topCritical', 'defects', 'deviations'],
    accentWidgets: ['topCritical', 'defects'],
  },
  maintenancePlanner: {
    kpis: ['assets', 'operational', 'defects'],
    accentKpis: ['assets', 'operational'],
    charts: ['defectsTrend'],
    widgets: ['defects', 'rounds'],
    accentWidgets: ['rounds'],
  },
  operator: {
    kpis: ['deviations'],
    accentKpis: ['deviations'],
    charts: [],
    widgets: ['deviations', 'rounds'],
    accentWidgets: ['rounds', 'deviations'],
  },
  manager: {
    kpis: ['assets', 'operational', 'defects', 'deviations'],
    accentKpis: ['assets', 'operational', 'defects', 'deviations'],
    charts: ['defectsTrend', 'distribution'],
    widgets: ['topCritical', 'deviations', 'defects', 'rounds'],
    accentWidgets: ['topCritical', 'defects', 'rounds'],
  },
};

/** Состав виджетов дашборда для демонстрационной роли. */
export function getRoleDashboardProfile(role: Role): RoleDashboardProfile {
  return DASHBOARD_BY_ROLE[role];
}

export function isKpiVisibleForRole(role: Role, kpiId: DashboardKpiId): boolean {
  return DASHBOARD_BY_ROLE[role].kpis.includes(kpiId);
}

export function isKpiAccentForRole(role: Role, kpiId: DashboardKpiId): boolean {
  return DASHBOARD_BY_ROLE[role].accentKpis.includes(kpiId);
}

export function isChartVisibleForRole(
  role: Role,
  chartId: DashboardChartId,
): boolean {
  return DASHBOARD_BY_ROLE[role].charts.includes(chartId);
}

export function isWidgetVisibleForRole(
  role: Role,
  widgetId: DashboardWidgetId,
): boolean {
  return DASHBOARD_BY_ROLE[role].widgets.includes(widgetId);
}

export function isWidgetAccentForRole(
  role: Role,
  widgetId: DashboardWidgetId,
): boolean {
  return DASHBOARD_BY_ROLE[role].accentWidgets.includes(widgetId);
}
