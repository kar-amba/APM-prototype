import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Network,
  Route,
  Search,
  Workflow,
} from 'lucide-react';

export interface NavSection {
  /** Путь маршрута. */
  path: string;
  /** Ключ i18n в namespace nav. */
  i18nKey: string;
  icon: LucideIcon;
}

/** Разделы приложения (порядок = порядок в sidebar). */
export const navSections: NavSection[] = [
  { path: '/', i18nKey: 'dashboard', icon: LayoutDashboard },
  { path: '/assets', i18nKey: 'assets', icon: Network },
  { path: '/search', i18nKey: 'search', icon: Search },
  { path: '/strategies', i18nKey: 'strategies', icon: ClipboardList },
  { path: '/rounds', i18nKey: 'rounds', icon: Route },
  { path: '/criticality', i18nKey: 'criticality', icon: AlertTriangle },
  { path: '/status-schemes', i18nKey: 'statusSchemes', icon: Workflow },
  { path: '/catalogs', i18nKey: 'catalogs', icon: BookOpen },
];
