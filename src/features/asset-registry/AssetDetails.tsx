import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PackageSearch } from 'lucide-react';
import type { Asset } from '@/model';
import { Badge, EmptyState, Tabs, type TabItem } from '@/shared/ui';
import { criticalityTone, statusTone } from './lib';
import styles from './AssetRegistry.module.css';

/** Строка атрибута класса актива (имя + отформатированное значение). */
export interface AttributeRow {
  id: string;
  name: string;
  valueText: string | undefined;
}

/** Разрешённые из текущего статуса переходы (по статусной схеме актива). */
export interface StatusAction {
  options: Array<{ code: string; name: string }>;
}

interface AssetDetailsProps {
  asset: Asset | undefined;
  locationNames: Map<string, string>;
  attributes: AttributeRow[];
  statusAction?: StatusAction;
  onChangeStatus: (code: string) => void;
}

const TAB_IDS = [
  'overview',
  'passport',
  'hierarchy',
  'strategy',
  'rounds',
  'history',
  'documents',
] as const;

export function AssetDetails({
  asset,
  locationNames,
  attributes,
  statusAction,
  onChangeStatus,
}: AssetDetailsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!asset) {
    return (
      <EmptyState
        title={t('registry.selectAssetTitle')}
        description={t('registry.selectAssetDescription')}
        icon={<PackageSearch size={26} />}
      />
    );
  }

  const tabs: TabItem[] = TAB_IDS.map((id) => ({
    id,
    label: t(`registry.tabs.${id}`),
  }));

  const fields: Array<{ label: string; value: string | undefined }> = [
    { label: t('registry.overview.class'), value: asset.classification },
    {
      label: t('registry.overview.location'),
      value: locationNames.get(asset.functionalLocationId),
    },
    { label: t('registry.overview.manufacturer'), value: asset.manufacturer },
    { label: t('registry.overview.model'), value: asset.modelName },
    { label: t('registry.overview.serialNumber'), value: asset.serialNumber },
    {
      label: t('registry.overview.inventoryNumber'),
      value: asset.inventoryNumber,
    },
    {
      label: t('registry.overview.commissionedAt'),
      value: asset.commissionedAt,
    },
    { label: t('registry.overview.owner'), value: asset.owner },
    { label: t('registry.overview.planner'), value: asset.planner },
  ];

  const hasTransitions = (statusAction?.options.length ?? 0) > 0;

  return (
    <>
      <div className={styles.detailsBody}>
        <div className={styles.detailsTitle}>{asset.name}</div>
        <div className="flex items-center gap-2 mt-4">
          <Badge tone={statusTone[asset.status]} dot>
            {t(`assetStatus.${asset.status}`)}
          </Badge>
          <Badge tone={criticalityTone[asset.criticality]}>
            {t(`criticalityLevel.${asset.criticality}`)}
          </Badge>
          <span className={styles.assetCode}>{asset.code}</span>
        </div>
        <div className={styles.statusChange}>
          <label className={styles.fieldLabel}>
            {t('registry.changeStatus')}
          </label>
          {hasTransitions ? (
            <select
              className="input"
              value=""
              onChange={(e) => {
                if (e.target.value) onChangeStatus(e.target.value);
              }}
            >
              <option value="">{t('registry.changeStatus')}…</option>
              {statusAction?.options.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="help-text">{t('registry.noTransitions')}</span>
          )}
        </div>
      </div>

      <div className={styles.detailsTabs}>
        <Tabs items={tabs} activeId={activeTab} onChange={setActiveTab} />
      </div>

      <div className={styles.detailsBody}>
        {activeTab === 'overview' && (
          <div className={styles.fieldList}>
            {fields
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label} className={styles.field}>
                  <span className={styles.fieldLabel}>{f.label}</span>
                  <span className={styles.fieldValue}>{f.value}</span>
                </div>
              ))}
          </div>
        )}
        {activeTab === 'passport' &&
          (!asset.classificationId ? (
            <p className="text-muted">{t('registry.passport.noClass')}</p>
          ) : attributes.length === 0 ? (
            <p className="text-muted">
              {t('registry.passport.noAttributes')}
            </p>
          ) : (
            <div className={styles.fieldList}>
              <div className={styles.fieldLabel}>
                {t('registry.passport.attributesTitle')}
              </div>
              {attributes.map((attr) => (
                <div key={attr.id} className={styles.field}>
                  <span className={styles.fieldLabel}>{attr.name}</span>
                  <span className={styles.fieldValue}>
                    {attr.valueText ?? (
                      <span className="text-muted">
                        {t('registry.passport.notFilled')}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ))}
        {activeTab !== 'overview' && activeTab !== 'passport' && (
          <p className="text-muted">{t('registry.tabPlaceholder')}</p>
        )}
      </div>
    </>
  );
}
