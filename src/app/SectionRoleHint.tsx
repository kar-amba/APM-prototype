import { useTranslation } from 'react-i18next';
import { hasSectionHint, type SectionAccentKey } from '@/services/role-profiles';
import { useUiStore } from '@/store/uiStore';
import styles from './SectionRoleHint.module.css';

interface SectionRoleHintProps {
  /** Раздел, для которого показываем контекстную подсказку роли. */
  section: SectionAccentKey;
}

/** Контекстная подсказка акцента роли внутри раздела (демо, без блокировки UI). */
export function SectionRoleHint({ section }: SectionRoleHintProps) {
  const { t } = useTranslation();
  const role = useUiStore((s) => s.role);

  if (!hasSectionHint(role, section)) return null;

  return (
    <p className={styles.hint} role="note">
      {t(`roles.profile.sectionHint.${role}.${section}`)}
    </p>
  );
}
