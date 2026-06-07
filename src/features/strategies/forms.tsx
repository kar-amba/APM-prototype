import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  maintenanceTaskKindSchema,
  strategySchema,
  strategyTypeSchema,
  type Asset,
  type Classification,
  type MaintenanceTask,
  type Strategy,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './Strategies.module.css';

function Actions({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.formActions}>
      <Button variant="secondary" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
      <Button type="submit">{t('common.save')}</Button>
    </div>
  );
}

/* === Стратегия === */
const strategyFormSchema = strategySchema.omit({ id: true });
type StrategyFormValues = z.infer<typeof strategyFormSchema>;

export function StrategyForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Strategy;
  onSubmit: (values: Omit<Strategy, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      type: initial?.type ?? 'preventive',
      description: initial?.description ?? '',
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
      noValidate
    >
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.code')}
          </label>
          <input className="input" {...register('code')} />
          {errors.code && (
            <span className="help-text error">{errors.code.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.type')}
          </label>
          <select className="input" {...register('type')}>
            {strategyTypeSchema.options.map((type) => (
              <option key={type} value={type}>
                {t(`strategyType.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.formField}>
        <label className="label label-required">
          {t('strategies.form.name')}
        </label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>
      <div className={styles.formField}>
        <label className="label">{t('strategies.form.description')}</label>
        <textarea
          className="input"
          rows={3}
          {...register('description', {
            setValueAs: (v) => (v === '' ? undefined : v),
          })}
        />
      </div>
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Мероприятие ТОиР === */
const taskFormSchema = z
  .object({
    strategyId: z.string().min(1),
    name: z.string().min(1),
    kind: maintenanceTaskKindSchema,
    intervalDays: z.number().int().positive(),
    bindingMode: z.enum(['asset', 'class']),
    assetId: z.string().optional(),
    classificationId: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.bindingMode === 'asset' && !v.assetId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['assetId'],
        message: 'required',
      });
    }
    if (v.bindingMode === 'class' && !v.classificationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['classificationId'],
        message: 'required',
      });
    }
  });
type TaskFormValues = z.infer<typeof taskFormSchema>;

export function MaintenanceTaskForm({
  initial,
  strategies,
  assets,
  classifications,
  defaultStrategyId,
  onSubmit,
  onCancel,
}: {
  initial?: MaintenanceTask;
  strategies: Strategy[];
  assets: Asset[];
  classifications: Classification[];
  defaultStrategyId?: string;
  onSubmit: (values: Omit<MaintenanceTask, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      strategyId: initial?.strategyId ?? defaultStrategyId ?? '',
      name: initial?.name ?? '',
      kind: initial?.kind ?? 'ppr',
      intervalDays: initial?.intervalDays ?? 90,
      bindingMode: initial?.assetId ? 'asset' : 'class',
      assetId: initial?.assetId ?? undefined,
      classificationId: initial?.classificationId ?? undefined,
    },
  });

  const bindingMode = useWatch({ control, name: 'bindingMode' });

  const submit = (v: TaskFormValues) => {
    onSubmit({
      strategyId: v.strategyId,
      name: v.name,
      kind: v.kind,
      intervalDays: v.intervalDays,
      assetId: v.bindingMode === 'asset' ? v.assetId ?? null : null,
      classificationId:
        v.bindingMode === 'class' ? v.classificationId ?? null : null,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <div className={styles.formField}>
        <label className="label label-required">
          {t('strategies.form.strategy')}
        </label>
        <select className="input" {...register('strategyId')}>
          <option value="">{t('strategies.form.selectStrategy')}</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.strategyId && (
          <span className="help-text error">{errors.strategyId.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label className="label label-required">
          {t('strategies.form.name')}
        </label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.kind')}
          </label>
          <select className="input" {...register('kind')}>
            {maintenanceTaskKindSchema.options.map((kind) => (
              <option key={kind} value={kind}>
                {t(`maintenanceTaskKind.${kind}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.intervalDays')}
          </label>
          <input
            type="number"
            min={1}
            step={1}
            className="input"
            {...register('intervalDays', { valueAsNumber: true })}
          />
          {errors.intervalDays && (
            <span className="help-text error">
              {errors.intervalDays.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.formField}>
        <label className="label">{t('strategies.form.bindingMode')}</label>
        <div className={styles.radioRow}>
          <label className={styles.radioOption}>
            <input type="radio" value="asset" {...register('bindingMode')} />
            {t('strategies.form.bindingAsset')}
          </label>
          <label className={styles.radioOption}>
            <input type="radio" value="class" {...register('bindingMode')} />
            {t('strategies.form.bindingClass')}
          </label>
        </div>
      </div>

      {bindingMode === 'asset' ? (
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.asset')}
          </label>
          <select
            className="input"
            {...register('assetId', {
              setValueAs: (v) => (v === '' ? undefined : v),
            })}
          >
            <option value="">{t('strategies.form.selectAsset')}</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.code}
              </option>
            ))}
          </select>
          {errors.assetId && (
            <span className="help-text error">{t('form.required')}</span>
          )}
        </div>
      ) : (
        <div className={styles.formField}>
          <label className="label label-required">
            {t('strategies.form.classification')}
          </label>
          <select
            className="input"
            {...register('classificationId', {
              setValueAs: (v) => (v === '' ? undefined : v),
            })}
          >
            <option value="">{t('strategies.form.selectClass')}</option>
            {classifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classificationId && (
            <span className="help-text error">{t('form.required')}</span>
          )}
        </div>
      )}

      <Actions onCancel={onCancel} />
    </form>
  );
}
