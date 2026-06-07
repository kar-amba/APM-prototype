import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import type { Asset, Status } from '@/model';
import { Badge, Button } from '@/shared/ui';
import { assetPath, criticalityTone } from './lib';
import styles from './AssetRegistry.module.css';

interface AssetPreviewCardProps {
  asset: Asset;
  status?: Status;
  locationName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Краткая карточка выбранного актива под реестром (уровень обзора). Полная
 * карточка открывается по ссылке «Открыть карточку» в той же вкладке.
 */
export function AssetPreviewCard({
  asset,
  status,
  locationName,
  onEdit,
  onDelete,
}: AssetPreviewCardProps) {
  const { t } = useTranslation();

  const fields: Array<{ label: string; value: string | undefined }> = [
    { label: t('registry.overview.class'), value: asset.classification },
    { label: t('registry.overview.location'), value: locationName },
    { label: t('registry.overview.manufacturer'), value: asset.manufacturer },
    { label: t('registry.overview.model'), value: asset.modelName },
  ];

  return (
    <div className={styles.preview}>
      <div className={styles.previewMain}>
        <div className={styles.previewHeader}>
          <div>
            <Link to={assetPath(asset.id)} className={styles.previewTitle}>
              {asset.name}
            </Link>
            <span className={styles.assetCode}>{asset.code}</span>
          </div>
          <div className="flex items-center gap-2">
            {status && (
              <Badge tone={status.tone} dot>
                {status.name}
              </Badge>
            )}
            <Badge tone={criticalityTone[asset.criticality]}>
              {t(`criticalityLevel.${asset.criticality}`)}
            </Badge>
          </div>
        </div>

        <div className={styles.previewFields}>
          {fields
            .filter((f) => f.value)
            .map((f) => (
              <div key={f.label} className={styles.field}>
                <span className={styles.fieldLabel}>{f.label}</span>
                <span className={styles.fieldValue}>{f.value}</span>
              </div>
            ))}
        </div>
      </div>

      <div className={styles.previewActions}>
        <Link to={assetPath(asset.id)} className="btn btn-primary btn-sm">
          {t('registry.openCard')}
          <ArrowRight size={15} />
        </Link>
        <Button
          size="sm"
          variant="secondary"
          onClick={onEdit}
          title={t('common.edit')}
          aria-label={t('common.edit')}
        >
          <Pencil size={15} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          title={t('common.delete')}
          aria-label={t('common.delete')}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}
