import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useRoleProfile } from '@/hooks/useRoleProfile';

/**
 * Глобальный баннер акцента роли: поясняет фокус демонстрационной роли и ведёт
 * к её приоритетному разделу (без ограничения доступа к остальным разделам).
 */
export function RoleAccentBanner() {
  const { t } = useTranslation();
  const { role, profile } = useRoleProfile();

  return (
    <div className="card card-accent" data-role-accent-banner>
      <div>
        <span className="text-xs text-muted">{t('roles.profile.bannerLabel')}</span>
        <div className="text-sm" style={{ marginTop: 4 }}>
          <strong>{t(`roles.${role}`)}</strong>
          <span className="text-muted"> — {t(`roles.profile.${role}.focus`)}</span>
        </div>
      </div>
      <Link
        to={profile.homePath}
        className="btn btn-primary btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
      >
        <Sparkles size={14} />
        {t(`roles.profile.${role}.accentAction`)}
      </Link>
    </div>
  );
}
