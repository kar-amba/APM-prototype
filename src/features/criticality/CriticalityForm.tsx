import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Asset, CriticalityAssessment, Person } from '@/model';
import { Badge, Button } from '@/shared/ui';
import {
  CRITICALITY_SCALE,
  criticalityLevelFromScore,
  recommendedStrategyType,
  riskScore,
} from '@/services/criticality';
import { criticalityTone } from '@/features/asset-registry/lib';
import styles from './Criticality.module.css';

/**
 * Схема формы оценки критичности. Числовые оси приходят из `<select>` уже
 * приведёнными к числу (`valueAsNumber`), поэтому валидируем как `number`.
 */
const criticalityFormSchema = z.object({
  assetId: z.string().min(1),
  consequence: z.number().int().min(1).max(5),
  probability: z.number().int().min(1).max(5),
  assessedById: z.string().optional(),
});

export type CriticalityFormValues = z.infer<typeof criticalityFormSchema>;

interface CriticalityFormProps {
  assets: Asset[];
  persons: Person[];
  /** Предзаполненная оценка при переоценке актива. */
  initial?: CriticalityAssessment;
  /** Предвыбранный актив (при оценке из строки таблицы). */
  defaultAssetId?: string;
  /** Запретить смену актива (режим переоценки конкретного актива). */
  lockAsset?: boolean;
  onSubmit: (values: CriticalityFormValues) => void;
  onCancel: () => void;
}

export function CriticalityForm({
  assets,
  persons,
  initial,
  defaultAssetId,
  lockAsset = false,
  onSubmit,
  onCancel,
}: CriticalityFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CriticalityFormValues>({
    resolver: zodResolver(criticalityFormSchema),
    defaultValues: {
      assetId: initial?.assetId ?? defaultAssetId ?? '',
      consequence: initial?.consequence ?? 3,
      probability: initial?.probability ?? 3,
      assessedById: initial?.assessedById,
    },
  });

  const consequence = useWatch({ control, name: 'consequence' });
  const probability = useWatch({ control, name: 'probability' });
  const score = riskScore(Number(consequence) || 0, Number(probability) || 0);
  const level = criticalityLevelFromScore(score);

  const err = (field: keyof CriticalityFormValues) =>
    errors[field]?.message as string | undefined;

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
      <div className={styles.formGrid}>
        <div className={`${styles.formField} ${styles.formFieldWide}`}>
          <label className="label label-required">
            {t('criticality.form.asset')}
          </label>
          <select className="input" disabled={lockAsset} {...register('assetId')}>
            <option value="">{t('criticality.form.selectAsset')}</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} · {asset.code}
              </option>
            ))}
          </select>
          {err('assetId') && (
            <span className="help-text error">{err('assetId')}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className="label label-required">
            {t('criticality.form.consequence')}
          </label>
          <select
            className="input"
            {...register('consequence', { valueAsNumber: true })}
          >
            {CRITICALITY_SCALE.map((n) => (
              <option key={n} value={n}>
                {t(`criticality.consequenceScale.${n}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label label-required">
            {t('criticality.form.probability')}
          </label>
          <select
            className="input"
            {...register('probability', { valueAsNumber: true })}
          >
            {CRITICALITY_SCALE.map((n) => (
              <option key={n} value={n}>
                {t(`criticality.probabilityScale.${n}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.formField} ${styles.formFieldWide}`}>
          <label className="label">{t('criticality.form.assessedBy')}</label>
          <select
            className="input"
            {...register('assessedById', {
              setValueAs: (v) => (v === '' ? undefined : v),
            })}
          >
            <option value="">{t('criticality.form.notSpecified')}</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
                {person.position ? ` — ${person.position}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.preview}>
        <div>
          <div className={styles.previewLabel}>{t('criticality.score')}</div>
          <div className={styles.previewScore}>{score}</div>
        </div>
        <div className={styles.previewDivider} />
        <div>
          <div className={styles.previewLabel}>{t('criticality.level')}</div>
          <Badge tone={criticalityTone[level]}>
            {t(`criticalityLevel.${level}`)}
          </Badge>
        </div>
        <div className={styles.previewDivider} />
        <div>
          <div className={styles.previewLabel}>
            {t('criticality.recommendedStrategy')}
          </div>
          <Badge tone="accent">
            {t(`strategyType.${recommendedStrategyType[level]}`)}
          </Badge>
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
