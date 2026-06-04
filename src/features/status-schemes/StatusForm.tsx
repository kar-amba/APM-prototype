import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import { statusSchema, statusToneSchema, type Status } from '@/model';
import { Button } from '@/shared/ui';
import styles from './StatusSchemes.module.css';

const statusFormSchema = statusSchema.omit({ id: true, schemeId: true });
// У `isInitial`/`isFinal` в схеме есть `.default(false)`, поэтому вход (значения
// формы) и выход (после парсинга) различаются — задаём оба дженерика отдельно.
type StatusFormInput = z.input<typeof statusFormSchema>;
type StatusFormOutput = z.output<typeof statusFormSchema>;

interface StatusFormProps {
  initial?: Status;
  onSubmit: (values: Omit<Status, 'id' | 'schemeId'>) => void;
  onCancel: () => void;
}

export function StatusForm({ initial, onSubmit, onCancel }: StatusFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormInput, unknown, StatusFormOutput>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      tone: initial?.tone ?? 'default',
      isInitial: initial?.isInitial ?? false,
      isFinal: initial?.isFinal ?? false,
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
        <label className="label label-required">{t('form.tone')}</label>
        <select className="input" {...register('tone')}>
          {statusToneSchema.options.map((tone) => (
            <option key={tone} value={tone}>
              {t(`statusTone.${tone}`)}
            </option>
          ))}
        </select>
      </div>
      <label className={styles.checkboxRow}>
        <input type="checkbox" {...register('isInitial')} />
        <span>{t('form.isInitial')}</span>
      </label>
      <label className={styles.checkboxRow}>
        <input type="checkbox" {...register('isFinal')} />
        <span>{t('form.isFinal')}</span>
      </label>
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  );
}
