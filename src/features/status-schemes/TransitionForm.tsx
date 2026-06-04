import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Status } from '@/model';
import { Button } from '@/shared/ui';
import styles from './StatusSchemes.module.css';

interface TransitionFormProps {
  statuses: Status[];
  /** Возвращает текст ошибки, если переход недопустим, иначе undefined. */
  validate: (fromStatusId: string, toStatusId: string) => string | undefined;
  onSubmit: (fromStatusId: string, toStatusId: string) => void;
  onCancel: () => void;
}

export function TransitionForm({
  statuses,
  validate,
  onSubmit,
  onCancel,
}: TransitionFormProps) {
  const { t } = useTranslation();
  const [fromStatusId, setFromStatusId] = useState(statuses[0]?.id ?? '');
  const [toStatusId, setToStatusId] = useState(statuses[1]?.id ?? '');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = () => {
    const message = validate(fromStatusId, toStatusId);
    if (message) {
      setError(message);
      return;
    }
    onSubmit(fromStatusId, toStatusId);
  };

  return (
    <div className={styles.form}>
      <div className={styles.formField}>
        <label className="label label-required">{t('form.fromStatus')}</label>
        <select
          className="input"
          value={fromStatusId}
          onChange={(e) => setFromStatusId(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formField}>
        <label className="label label-required">{t('form.toStatus')}</label>
        <select
          className="input"
          value={toStatusId}
          onChange={(e) => setToStatusId(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="help-text error">{error}</span>}
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit}>{t('common.save')}</Button>
      </div>
    </div>
  );
}
