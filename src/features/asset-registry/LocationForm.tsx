import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import {
  functionalLocationLevelSchema,
  functionalLocationSchema,
  type FunctionalLocation,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './AssetRegistry.module.css';

/** Схема формы функционального места — без поля `id`. */
const locationFormSchema = functionalLocationSchema.omit({ id: true });
type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  locations: FunctionalLocation[];
  initial?: FunctionalLocation;
  defaultParentId?: string | null;
  onSubmit: (values: Omit<FunctionalLocation, 'id'>) => void;
  onCancel: () => void;
}

export function LocationForm({
  locations,
  initial,
  defaultParentId,
  onSubmit,
  onCancel,
}: LocationFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      level: initial?.level ?? 'area',
      parentId: initial?.parentId ?? defaultParentId ?? null,
    },
  });

  const parentCandidates = locations.filter((l) => l.id !== initial?.id);

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
          {errors.code && (
            <span className="help-text error">{errors.code.message}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.name')}</label>
          <input className="input" {...register('name')} />
          {errors.name && (
            <span className="help-text error">{errors.name.message}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className="label label-required">{t('form.level')}</label>
          <select className="input" {...register('level')}>
            {functionalLocationLevelSchema.options.map((lvl) => (
              <option key={lvl} value={lvl}>
                {t(`flLevel.${lvl}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label className="label">{t('form.parentLocation')}</label>
          <select
            className="input"
            {...register('parentId', {
              setValueAs: (v) => (v === '' || v == null ? null : v),
            })}
          >
            <option value="">{t('form.noParent')}</option>
            {parentCandidates.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
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
