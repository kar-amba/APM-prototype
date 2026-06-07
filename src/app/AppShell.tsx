import { Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Settings } from 'lucide-react';
import { navSections } from './navigation';
import { ROLES, useUiStore, type Role } from '@/store/uiStore';
import { SettingsDialog } from '@/features/settings/SettingsDialog';
import styles from './AppShell.module.css';

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const role = useUiStore((s) => s.role);
  const setRole = useUiStore((s) => s.setRole);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeSection =
    navSections.find((s) =>
      s.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(s.path),
    ) ?? navSections[0];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>A</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{t('app.name')}</span>
            <span className={styles.brandTagline}>{t('app.tagline')}</span>
          </span>
        </div>

        <nav className={styles.menu}>
          {navSections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.path}
                to={section.path}
                end={section.path === '/'}
                className={({ isActive }) =>
                  [styles.menuItem, isActive && styles.menuItemActive]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                <Icon size={18} />
                <span>{t(`nav.${section.i18nKey}`)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          {t('app.name')} · прототип v0.1
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.crumbs}>
            <span className={styles.crumbMuted}>{t('app.name')}</span>
            <span className={styles.crumbMuted}>/</span>
            <span>{t(`nav.${activeSection.i18nKey}`)}</span>
          </div>

          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={`input ${styles.searchInput}`}
              placeholder={t('topbar.searchPlaceholder')}
              aria-label={t('topbar.searchPlaceholder')}
            />
          </div>

          <div className={styles.topbarRight}>
            <label className="text-xs text-muted" htmlFor="role-select">
              {t('topbar.role')}
            </label>
            <select
              id="role-select"
              className={styles.roleSelect}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.iconButton}
              title={t('topbar.settings')}
              aria-label={t('topbar.settings')}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Suspense
            fallback={<div className={styles.routeFallback}>{t('common.loading')}</div>}
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
