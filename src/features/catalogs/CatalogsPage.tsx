import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import type {
  AttributeDefinition,
  Classification,
  Manufacturer,
  OrgUnit,
  Person,
  UnitOfMeasure,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Modal, Tabs, type TabItem } from '@/shared/ui';
import { ClassifierPanel } from './ClassifierPanel';
import { CatalogTable, type Column } from './CatalogTable';
import {
  AttributeForm,
  ClassForm,
  ManufacturerForm,
  OrgUnitForm,
  PersonForm,
  UnitForm,
  type AttributeFormResult,
} from './forms';
import styles from './Catalogs.module.css';

const TAB_IDS = [
  'classifier',
  'manufacturers',
  'orgUnits',
  'persons',
  'units',
] as const;
type TabId = (typeof TAB_IDS)[number];

type ModalState =
  | { kind: 'manufacturer'; record?: Manufacturer }
  | { kind: 'unit'; record?: UnitOfMeasure }
  | { kind: 'orgUnit'; record?: OrgUnit }
  | { kind: 'person'; record?: Person }
  | { kind: 'class'; record?: Classification }
  | { kind: 'attribute'; record?: AttributeDefinition }
  | null;

export function CatalogsPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [tab, setTab] = useState<TabId>('classifier');
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [attributeDefs, setAttributeDefs] = useState<AttributeDefinition[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.classifications.list(),
        repository.attributeDefinitions.list(),
        repository.unitsOfMeasure.list(),
        repository.manufacturers.list(),
        repository.orgUnits.list(),
        repository.persons.list(),
      ]),
    [repository],
  );

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof loadAll>>) => {
      const [cls, defs, uoms, mfs, orgs, prs] = data;
      setClassifications(cls);
      setAttributeDefs(defs);
      setUnits(uoms);
      setManufacturers(mfs);
      setOrgUnits(orgs);
      setPersons(prs);
    },
    [],
  );

  const reload = useCallback(async () => {
    applyData(await loadAll());
  }, [loadAll, applyData]);

  useEffect(() => {
    let active = true;
    void loadAll().then((data) => {
      if (active) applyData(data);
    });
    return () => {
      active = false;
    };
  }, [loadAll, applyData, revision]);

  const afterMutation = async () => {
    setModal(null);
    await reload();
    bumpRevision();
  };

  const orgUnitNames = useMemo(
    () => new Map(orgUnits.map((o) => [o.id, o.name])),
    [orgUnits],
  );

  /* === Mutations: simple catalogs === */
  const saveManufacturer = async (values: Omit<Manufacturer, 'id'>) => {
    if (modal?.kind === 'manufacturer' && modal.record) {
      await repository.manufacturers.update(modal.record.id, values);
    } else {
      await repository.manufacturers.create({ id: `mf-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const saveUnit = async (values: Omit<UnitOfMeasure, 'id'>) => {
    if (modal?.kind === 'unit' && modal.record) {
      await repository.unitsOfMeasure.update(modal.record.id, values);
    } else {
      await repository.unitsOfMeasure.create({ id: `uom-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const saveOrgUnit = async (values: Omit<OrgUnit, 'id'>) => {
    if (modal?.kind === 'orgUnit' && modal.record) {
      await repository.orgUnits.update(modal.record.id, values);
    } else {
      await repository.orgUnits.create({ id: `org-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const savePerson = async (values: Omit<Person, 'id'>) => {
    if (modal?.kind === 'person' && modal.record) {
      await repository.persons.update(modal.record.id, values);
    } else {
      await repository.persons.create({ id: `pr-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const deleteRecord = async (
    remove: (id: string) => Promise<void>,
    id: string,
  ) => {
    if (!window.confirm(t('catalogs.deleteRecordConfirm'))) return;
    await remove(id);
    await afterMutation();
  };

  /* === Mutations: classifier === */
  const saveClass = async (values: Omit<Classification, 'id'>) => {
    if (modal?.kind === 'class' && modal.record) {
      await repository.classifications.update(modal.record.id, values);
    } else {
      const created = await repository.classifications.create({
        id: `cl-${nanoid(8)}`,
        ...values,
      });
      setSelectedClassId(created.id);
    }
    await afterMutation();
  };

  const deleteClass = async (cls: Classification) => {
    const hasChildren = classifications.some((c) => c.parentId === cls.id);
    const hasAttributes = attributeDefs.some(
      (d) => d.classificationId === cls.id,
    );
    if (hasChildren || hasAttributes) {
      window.alert(t('catalogs.classifier.deleteClassBlocked'));
      return;
    }
    if (!window.confirm(t('catalogs.classifier.deleteClassConfirm'))) return;
    await repository.classifications.remove(cls.id);
    if (selectedClassId === cls.id) setSelectedClassId(null);
    await afterMutation();
  };

  const saveAttribute = async (values: AttributeFormResult) => {
    if (modal?.kind === 'attribute' && modal.record) {
      await repository.attributeDefinitions.update(modal.record.id, values);
    } else if (selectedClassId) {
      await repository.attributeDefinitions.create({
        id: `ad-${nanoid(8)}`,
        classificationId: selectedClassId,
        ...values,
      });
    }
    await afterMutation();
  };

  const tabs: TabItem[] = TAB_IDS.map((id) => ({
    id,
    label: t(`catalogs.tabs.${id}`),
  }));

  const manufacturerColumns: Column<Manufacturer>[] = [
    { key: 'name', label: t('catalogs.columns.name'), render: (r) => r.name },
    {
      key: 'country',
      label: t('catalogs.columns.country'),
      render: (r) => r.country ?? '—',
    },
  ];
  const unitColumns: Column<UnitOfMeasure>[] = [
    { key: 'code', label: t('catalogs.columns.code'), render: (r) => r.code },
    { key: 'name', label: t('catalogs.columns.name'), render: (r) => r.name },
  ];
  const orgUnitColumns: Column<OrgUnit>[] = [
    { key: 'code', label: t('catalogs.columns.code'), render: (r) => r.code },
    { key: 'name', label: t('catalogs.columns.name'), render: (r) => r.name },
    {
      key: 'kind',
      label: t('catalogs.columns.kind'),
      render: (r) => t(`orgUnitKind.${r.kind}`),
    },
    {
      key: 'parent',
      label: t('catalogs.columns.parent'),
      render: (r) => (r.parentId ? orgUnitNames.get(r.parentId) ?? '—' : '—'),
    },
  ];
  const personColumns: Column<Person>[] = [
    { key: 'name', label: t('catalogs.columns.name'), render: (r) => r.name },
    {
      key: 'position',
      label: t('catalogs.columns.position'),
      render: (r) => r.position ?? '—',
    },
    {
      key: 'orgUnit',
      label: t('catalogs.columns.orgUnit'),
      render: (r) => (r.orgUnitId ? orgUnitNames.get(r.orgUnitId) ?? '—' : '—'),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.tabsRow}>
        <Tabs items={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      </div>

      <div className={styles.content}>
        {tab === 'classifier' && (
          <ClassifierPanel
            classifications={classifications}
            attributeDefs={attributeDefs}
            units={units}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            onAddClass={() => setModal({ kind: 'class' })}
            onEditClass={(record) => setModal({ kind: 'class', record })}
            onDeleteClass={deleteClass}
            onAddAttribute={() => setModal({ kind: 'attribute' })}
            onEditAttribute={(record) => setModal({ kind: 'attribute', record })}
            onDeleteAttribute={(attr) =>
              deleteRecord(
                (id) => repository.attributeDefinitions.remove(id),
                attr.id,
              )
            }
          />
        )}
        {tab === 'manufacturers' && (
          <CatalogTable
            records={manufacturers}
            columns={manufacturerColumns}
            addLabel={t('catalogs.addRecord')}
            onAdd={() => setModal({ kind: 'manufacturer' })}
            onEdit={(record) => setModal({ kind: 'manufacturer', record })}
            onDelete={(r) =>
              deleteRecord((id) => repository.manufacturers.remove(id), r.id)
            }
          />
        )}
        {tab === 'orgUnits' && (
          <CatalogTable
            records={orgUnits}
            columns={orgUnitColumns}
            addLabel={t('catalogs.addRecord')}
            onAdd={() => setModal({ kind: 'orgUnit' })}
            onEdit={(record) => setModal({ kind: 'orgUnit', record })}
            onDelete={(r) =>
              deleteRecord((id) => repository.orgUnits.remove(id), r.id)
            }
          />
        )}
        {tab === 'persons' && (
          <CatalogTable
            records={persons}
            columns={personColumns}
            addLabel={t('catalogs.addRecord')}
            onAdd={() => setModal({ kind: 'person' })}
            onEdit={(record) => setModal({ kind: 'person', record })}
            onDelete={(r) =>
              deleteRecord((id) => repository.persons.remove(id), r.id)
            }
          />
        )}
        {tab === 'units' && (
          <CatalogTable
            records={units}
            columns={unitColumns}
            addLabel={t('catalogs.addRecord')}
            onAdd={() => setModal({ kind: 'unit' })}
            onEdit={(record) => setModal({ kind: 'unit', record })}
            onDelete={(r) =>
              deleteRecord((id) => repository.unitsOfMeasure.remove(id), r.id)
            }
          />
        )}
      </div>

      <Modal
        open={modal?.kind === 'manufacturer'}
        title={
          modal?.kind === 'manufacturer' && modal.record
            ? t('catalogs.manufacturers.editTitle')
            : t('catalogs.manufacturers.addTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'manufacturer' && (
          <ManufacturerForm
            initial={modal.record}
            onSubmit={saveManufacturer}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'unit'}
        title={
          modal?.kind === 'unit' && modal.record
            ? t('catalogs.units.editTitle')
            : t('catalogs.units.addTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'unit' && (
          <UnitForm
            initial={modal.record}
            onSubmit={saveUnit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'orgUnit'}
        title={
          modal?.kind === 'orgUnit' && modal.record
            ? t('catalogs.orgUnits.editTitle')
            : t('catalogs.orgUnits.addTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'orgUnit' && (
          <OrgUnitForm
            initial={modal.record}
            orgUnits={orgUnits}
            onSubmit={saveOrgUnit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'person'}
        title={
          modal?.kind === 'person' && modal.record
            ? t('catalogs.persons.editTitle')
            : t('catalogs.persons.addTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'person' && (
          <PersonForm
            initial={modal.record}
            orgUnits={orgUnits}
            onSubmit={savePerson}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'class'}
        title={
          modal?.kind === 'class' && modal.record
            ? t('catalogs.classifier.editClassTitle')
            : t('catalogs.classifier.addClassTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'class' && (
          <ClassForm
            initial={modal.record}
            classifications={classifications}
            defaultParentId={selectedClassId}
            onSubmit={saveClass}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'attribute'}
        title={
          modal?.kind === 'attribute' && modal.record
            ? t('catalogs.classifier.editAttributeTitle')
            : t('catalogs.classifier.addAttributeTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'attribute' && (
          <AttributeForm
            initial={modal.record}
            units={units}
            onSubmit={saveAttribute}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
