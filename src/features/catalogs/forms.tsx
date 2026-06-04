import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  attributeValueTypeSchema,
  classificationSchema,
  manufacturerSchema,
  orgUnitKindSchema,
  orgUnitSchema,
  personSchema,
  unitOfMeasureSchema,
  type AttributeDefinition,
  type Classification,
  type Manufacturer,
  type OrgUnit,
  type Person,
  type UnitOfMeasure,
} from '@/model';
import { Button } from '@/shared/ui';
import styles from './Catalogs.module.css';

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

/* === Производитель === */
const manufacturerFormSchema = manufacturerSchema.omit({ id: true });
type ManufacturerFormValues = z.infer<typeof manufacturerFormSchema>;

export function ManufacturerForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Manufacturer;
  onSubmit: (values: Omit<Manufacturer, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerFormSchema),
    defaultValues: { name: initial?.name ?? '', country: initial?.country ?? '' },
  });
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
      noValidate
    >
      <div className={styles.formField}>
        <label className="label label-required">{t('form.name')}</label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>
      <div className={styles.formField}>
        <label className="label">{t('form.country')}</label>
        <input className="input" {...register('country')} />
      </div>
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Единица измерения === */
const unitFormSchema = unitOfMeasureSchema.omit({ id: true });
type UnitFormValues = z.infer<typeof unitFormSchema>;

export function UnitForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: UnitOfMeasure;
  onSubmit: (values: Omit<UnitOfMeasure, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: { code: initial?.code ?? '', name: initial?.name ?? '' },
  });
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
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
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Организационная единица === */
const orgUnitFormSchema = orgUnitSchema.omit({ id: true });
type OrgUnitFormValues = z.infer<typeof orgUnitFormSchema>;

export function OrgUnitForm({
  initial,
  orgUnits,
  onSubmit,
  onCancel,
}: {
  initial?: OrgUnit;
  orgUnits: OrgUnit[];
  onSubmit: (values: Omit<OrgUnit, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgUnitFormValues>({
    resolver: zodResolver(orgUnitFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      kind: initial?.kind ?? 'shop',
      parentId: initial?.parentId ?? null,
    },
  });
  const parents = orgUnits.filter((o) => o.id !== initial?.id);
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
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
        <label className="label label-required">{t('form.orgUnitKind')}</label>
        <select className="input" {...register('kind')}>
          {orgUnitKindSchema.options.map((k) => (
            <option key={k} value={k}>
              {t(`orgUnitKind.${k}`)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formField}>
        <label className="label">{t('form.orgUnit')}</label>
        <select
          className="input"
          {...register('parentId', {
            setValueAs: (v) => (v === '' || v == null ? null : v),
          })}
        >
          <option value="">{t('common.none')}</option>
          {parents.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Сотрудник === */
const personFormSchema = personSchema.omit({ id: true });
type PersonFormValues = z.infer<typeof personFormSchema>;

export function PersonForm({
  initial,
  orgUnits,
  onSubmit,
  onCancel,
}: {
  initial?: Person;
  orgUnits: OrgUnit[];
  onSubmit: (values: Omit<Person, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      position: initial?.position ?? '',
      orgUnitId: initial?.orgUnitId,
    },
  });
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
      noValidate
    >
      <div className={styles.formField}>
        <label className="label label-required">{t('form.name')}</label>
        <input className="input" {...register('name')} />
        {errors.name && (
          <span className="help-text error">{errors.name.message}</span>
        )}
      </div>
      <div className={styles.formField}>
        <label className="label">{t('form.position')}</label>
        <input className="input" {...register('position')} />
      </div>
      <div className={styles.formField}>
        <label className="label">{t('form.orgUnit')}</label>
        <select
          className="input"
          {...register('orgUnitId', {
            setValueAs: (v) => (v === '' ? undefined : v),
          })}
        >
          <option value="">{t('common.none')}</option>
          {orgUnits.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Класс классификатора === */
const classFormSchema = classificationSchema.omit({ id: true });
type ClassFormValues = z.infer<typeof classFormSchema>;

export function ClassForm({
  initial,
  classifications,
  defaultParentId,
  onSubmit,
  onCancel,
}: {
  initial?: Classification;
  classifications: Classification[];
  defaultParentId?: string | null;
  onSubmit: (values: Omit<Classification, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      parentId: initial?.parentId ?? defaultParentId ?? null,
    },
  });
  const parents = classifications.filter((c) => c.id !== initial?.id);
  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((v) => onSubmit(v))}
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
        <label className="label">{t('form.parentClass')}</label>
        <select
          className="input"
          {...register('parentId', {
            setValueAs: (v) => (v === '' || v == null ? null : v),
          })}
        >
          <option value="">{t('catalogs.classifier.rootClass')}</option>
          {parents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Actions onCancel={onCancel} />
    </form>
  );
}

/* === Атрибут класса === */
const attributeFormSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  valueType: attributeValueTypeSchema,
  unitId: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  optionsText: z.string().optional(),
});
type AttributeFormValues = z.infer<typeof attributeFormSchema>;

export type AttributeFormResult = Omit<
  AttributeDefinition,
  'id' | 'classificationId'
>;

export function AttributeForm({
  initial,
  units,
  onSubmit,
  onCancel,
}: {
  initial?: AttributeDefinition;
  units: UnitOfMeasure[];
  onSubmit: (values: AttributeFormResult) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      code: initial?.code ?? '',
      name: initial?.name ?? '',
      valueType: initial?.valueType ?? 'number',
      unitId: initial?.unitId,
      min: initial?.min,
      max: initial?.max,
      optionsText: initial?.options?.join(', ') ?? '',
    },
  });

  const valueType = watch('valueType');

  const submit = (v: AttributeFormValues) => {
    const result: AttributeFormResult = {
      code: v.code,
      name: v.name,
      valueType: v.valueType,
    };
    if (v.valueType === 'number') {
      result.unitId = v.unitId || undefined;
      if (v.min !== undefined && !Number.isNaN(v.min)) result.min = v.min;
      if (v.max !== undefined && !Number.isNaN(v.max)) result.max = v.max;
    }
    if (v.valueType === 'enum') {
      const options = (v.optionsText ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (options.length > 0) result.options = options;
    }
    onSubmit(result);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
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
        <label className="label label-required">{t('form.valueType')}</label>
        <select className="input" {...register('valueType')}>
          {attributeValueTypeSchema.options.map((vt) => (
            <option key={vt} value={vt}>
              {t(`attributeType.${vt}`)}
            </option>
          ))}
        </select>
      </div>
      {valueType === 'number' && (
        <>
          <div className={styles.formField}>
            <label className="label">{t('form.unit')}</label>
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
              <label className="label">{t('form.min')}</label>
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
              <label className="label">{t('form.max')}</label>
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
      {valueType === 'enum' && (
        <div className={styles.formField}>
          <label className="label">{t('form.options')}</label>
          <input className="input" {...register('optionsText')} />
        </div>
      )}
      <Actions onCancel={onCancel} />
    </form>
  );
}
