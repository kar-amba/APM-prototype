import { useTranslation } from 'react-i18next';
import { Card, EmptyState } from '@/shared/ui';

interface PlaceholderPageProps {
  /** Ключ i18n в namespace nav (заголовок раздела). */
  navKey: string;
}

/** Заглушка для разделов, которые появятся на следующих шагах прототипа. */
export function PlaceholderPage({ navKey }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2">{t(`nav.${navKey}`)}</h4>
        <p className="text-muted">{t('common.comingSoon')}</p>
      </div>
      <Card>
        <EmptyState
          title={t('common.comingSoon')}
          description={t('common.comingSoonDescription')}
        />
      </Card>
    </div>
  );
}
