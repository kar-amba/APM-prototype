import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import {
  assetSchema,
  assetStatusSchema,
  criticalityLevelSchema,
  type Asset,
  type Classification,
  type FunctionalLocation,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './AssetRegistry.module.css';

/** Схема формы актива — модель без поля `id` (генерируется при создании). */
const assetFormSchema = assetSchema.omit({ id: true });
type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  locations: FunctionalLocation[];
  classifications: Classification[];
  assets: Asset[];
  initial?: Asset;
  defaultLocationId?: string | null;
  onSubmit: (values: Omit<Asset, 'id'>) => void;
  onCancel: () => void;
}

export function AssetForm({
  locations,
  classifications,
  assets,
  initial,
  defaultLocationId,
  onSubmit,
  onCancel,
}: AssetFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      classification: initial?.classification ?? '',
      classificationId: initial?.classificationId,
      functionalLocationId:
        initial?.functionalLocationId ?? defaultLocationId ?? '',
      parentAssetId: initial?.parentAssetId ?? null,
      status: initial?.status ?? 'in_operation',
      criticality: initial?.criticality ?? 'medium',
      manufacturer: initial?.manufacturer ?? '',
      modelName: initial?.modelName ?? '',
      serialNumber: initial?.serialNumber ?? '',
      inventoryNumber: initial?.inventoryNumber ?? '',
      commissionedAt: initial?.commissionedAt ?? '',
      owner: initial?.owner ?? '',
      planner: initial?.planner ?? '',
    },
  });

  const parentCandidates = assets.filter((a) => a.id !== initial?.id);
  const err = (field: keyof AssetFormValues) =>
    errors[field]?.message as string | undefined;

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className="label label-required">{t('form.code')}</label>
          <input className="input" {...register('code')} />
          {err('code') && <span className="help-text error">{err('code')}</span>}
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.name')}</label>
          <input className="input" {...register('name')} />
          {err('name') && <span className="help-text error">{err('name')}</span>}
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.classification')}</label>
          <input className="input" {...register('classification')} />
          {err('classification') && (
            <span className="help-text error">{err('classification')}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.classificationRef')}</label>
          <select
            className="input"
            {...register('classificationId', {
              setValueAs: (v) => (v === '' ? undefined : v),
            })}
          >
            <option value="">—</option>
            {classifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.location')}</label>
          <select className="input" {...register('functionalLocationId')}>
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {err('functionalLocationId') && (
            <span className="help-text error">{err('functionalLocationId')}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.parentAsset')}</label>
          <select
            className="input"
            {...register('parentAssetId', {
              setValueAs: (v) => (v === '' || v == null ? null : v),
            })}
          >
            <option value="">{t('form.noParent')}</option>
            {parentCandidates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.status')}</label>
          <select className="input" {...register('status')}>
            {assetStatusSchema.options.map((s) => (
              <option key={s} value={s}>
                {t(`assetStatus.${s}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.criticality')}</label>
          <select className="input" {...register('criticality')}>
            {criticalityLevelSchema.options.map((c) => (
              <option key={c} value={c}>
                {t(`criticalityLevel.${c}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.manufacturer')}</label>
          <input className="input" {...register('manufacturer')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.model')}</label>
          <input className="input" {...register('modelName')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.serialNumber')}</label>
          <input className="input" {...register('serialNumber')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.inventoryNumber')}</label>
          <input className="input" {...register('inventoryNumber')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.commissionedAt')}</label>
          <input type="date" className="input" {...register('commissionedAt')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.owner')}</label>
          <input className="input" {...register('owner')} />
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.planner')}</label>
          <input className="input" {...register('planner')} />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  );
}
