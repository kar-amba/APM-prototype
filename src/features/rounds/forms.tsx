import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  routePointKindSchema,
  routeSchema,
  type Asset,
  type Route,
  type RoutePoint,
  type UnitOfMeasure,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './Rounds.module.css';

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

/* === Маршрут === */
const routeFormSchema = routeSchema.omit({ id: true });
type RouteFormValues = z.infer<typeof routeFormSchema>;

export function RouteForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Route;
  onSubmit: (values: Omit<Route, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
      noValidate
    >
      <div className={styles.formField}>
        <label className="label label-required">{t('rounds.form.code')}</label>
        <input className="input" {...register('code')} />
        {errors.code && (
          <span className="help-text error">{errors.code.message}</span>
        )}
      </div>
      <div className={styles.formField}>
        <label className="label label-required">{t('rounds.form.name')}</label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>
      <div className={styles.formField}>
        <label className="label">{t('rounds.form.description')}</label>
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

/* === Точка контроля === */
const pointFormSchema = z.object({
  name: z.string().min(1),
  assetId: z.string().min(1),
  kind: routePointKindSchema,
  order: z.number().int().nonnegative(),
  unitId: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
type PointFormValues = z.infer<typeof pointFormSchema>;

export type RoutePointFormResult = Omit<RoutePoint, 'id' | 'routeId'>;

export function RoutePointForm({
  initial,
  assets,
  units,
  nextOrder,
  onSubmit,
  onCancel,
}: {
  initial?: RoutePoint;
  assets: Asset[];
  units: UnitOfMeasure[];
  nextOrder: number;
  onSubmit: (values: RoutePointFormResult) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PointFormValues>({
    resolver: zodResolver(pointFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      assetId: initial?.assetId ?? '',
      kind: initial?.kind ?? 'measurement',
      order: initial?.order ?? nextOrder,
      unitId: initial?.unitId,
      min: initial?.min,
      max: initial?.max,
    },
  });

  const kind = useWatch({ control, name: 'kind' });

  const submit = (v: PointFormValues) => {
    const result: RoutePointFormResult = {
      name: v.name,
      assetId: v.assetId,
      kind: v.kind,
      order: v.order,
    };
    if (v.kind === 'measurement') {
      result.unitId = v.unitId || undefined;
      if (v.min !== undefined && !Number.isNaN(v.min)) result.min = v.min;
      if (v.max !== undefined && !Number.isNaN(v.max)) result.max = v.max;
    }
    onSubmit(result);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <div className={styles.formField}>
        <label className="label label-required">{t('rounds.form.name')}</label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>

      <div className={styles.formField}>
        <label className="label label-required">{t('rounds.form.asset')}</label>
        <select className="input" {...register('assetId')}>
          <option value="">{t('rounds.form.selectAsset')}</option>
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

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className="label label-required">{t('rounds.form.kind')}</label>
          <select className="input" {...register('kind')}>
            {routePointKindSchema.options.map((k) => (
              <option key={k} value={k}>
                {t(`routePointKind.${k}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label className="label label-required">{t('rounds.form.order')}</label>
          <input
            type="number"
            min={0}
            step={1}
            className="input"
            {...register('order', { valueAsNumber: true })}
          />
        </div>
      </div>

      {kind === 'measurement' && (
        <>
          <div className={styles.formField}>
            <label className="label">{t('rounds.form.unit')}</label>
            <select
              className="input"
              {...register('unitId', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
            >
              <option value="">{t('common.none')}</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className="label">{t('rounds.form.min')}</label>
              <input
                type="number"
                step="any"
                className="input"
                {...register('min', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
              />
            </div>
            <div className={styles.formField}>
              <label className="label">{t('rounds.form.max')}</label>
              <input
                type="number"
                step="any"
                className="input"
                {...register('max', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
              />
            </div>
          </div>
        </>
      )}

      <Actions onCancel={onCancel} />
    </form>
  );
}
