import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useRoleProfile } from '@/hooks/useRoleProfile';
import styles from './RoleAccentBanner.module.css';

/**
 * Глобальный баннер акцента роли: поясняет фокус демонстрационной роли и ведёт
 * к её приоритетному разделу (без ограничения доступа к остальным разделам).
 */
export function RoleAccentBanner() {
  const { t } = useTranslation();
  const { role, profile } = useRoleProfile();

  return (
    <div className={styles.banner} data-role-accent-banner>
      <div className={styles.body}>
        <span className={styles.label}>{t('roles.profile.bannerLabel')}</span>
        <p className={styles.focus}>
          <span className={styles.roleName}>{t(`roles.${role}`)}</span>
          <span className={styles.focusMuted}>
            {' '}
            — {t(`roles.profile.${role}.focus`)}
          </span>
        </p>
      </div>
      <Link to={profile.homePath} className={`btn btn-primary btn-sm ${styles.action}`}>
        <Sparkles size={14} />
        {t(`roles.profile.${role}.accentAction`)}
      </Link>
    </div>
  );
}
