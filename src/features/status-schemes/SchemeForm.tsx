import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import {
  statusEntityKindSchema,
  statusSchemeSchema,
  type StatusScheme,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './StatusSchemes.module.css';

const schemeFormSchema = statusSchemeSchema.omit({ id: true });
type SchemeFormValues = z.infer<typeof schemeFormSchema>;

interface SchemeFormProps {
  initial?: StatusScheme;
  onSubmit: (values: Omit<StatusScheme, 'id'>) => void;
  onCancel: () => void;
}

export function SchemeForm({ initial, onSubmit, onCancel }: SchemeFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      entityKind: initial?.entityKind ?? 'asset',
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => onSubmit(values))}
      noValidate
    >
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
        <label className="label label-required">{t('form.entityKind')}</label>
        <select className="input" {...register('entityKind')}>
          {statusEntityKindSchema.options.map((kind) => (
            <option key={kind} value={kind}>
              {t(`statusEntityKind.${kind}`)}
            </option>
          ))}
        </select>
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
