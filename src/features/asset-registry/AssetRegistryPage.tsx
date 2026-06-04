import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  assetStatusSchema,
  type Asset,
  type AssetAttributeValue,
  type AttributeDefinition,
  type Classification,
  type FunctionalLocation,
  type Manufacturer,
  type Status,
  type StatusScheme,
  type Transition,
  type UnitOfMeasure,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { useUiStore } from '@/store/uiStore';
import { Button, Modal } from '@/shared/ui';
import {
  allowedNextStatuses,
  findSchemeForEntity,
  statusesOfScheme,
  transitionsOfScheme,
} from '@/services/status-flow';
import { LocationTree } from './LocationTree';
import { AssetTable } from './AssetTable';
import { AssetDetails, type AttributeRow, type StatusAction } from './AssetDetails';
import { AssetForm } from './AssetForm';
import { LocationForm } from './LocationForm';
import { buildLocationTree, filterAssetsByLocation } from './lib';
import styles from './AssetRegistry.module.css';

type ModalKind =
  | 'asset-create'
  | 'asset-edit'
  | 'location-create'
  | 'location-edit'
  | null;

export function AssetRegistryPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);
  const focusedAssetId = useUiStore((s) => s.focusedAssetId);
  const focusAsset = useUiStore((s) => s.focusAsset);

  const [locations, setLocations] = useState<FunctionalLocation[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [attributeDefs, setAttributeDefs] = useState<AttributeDefinition[]>([]);
  const [attributeValues, setAttributeValues] = useState<
    AssetAttributeValue[]
  >([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [schemes, setSchemes] = useState<StatusScheme[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    () => useUiStore.getState().focusedAssetId,
  );
  const [modal, setModal] = useState<ModalKind>(null);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.functionalLocations.list(),
        repository.assets.list(),
        repository.classifications.list(),
        repository.attributeDefinitions.list(),
        repository.assetAttributeValues.list(),
        repository.unitsOfMeasure.list(),
        repository.manufacturers.list(),
        repository.statusSchemes.list(),
        repository.statuses.list(),
        repository.transitions.list(),
      ]),
    [repository],
  );

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof loadAll>>) => {
      const [locs, ass, cls, defs, vals, uoms, mfs, sch, sts, trs] = data;
      setLocations(locs);
      setAssets(ass);
      setClassifications(cls);
      setAttributeDefs(defs);
      setAttributeValues(vals);
      setUnits(uoms);
      setManufacturers(mfs);
      setSchemes(sch);
      setStatuses(sts);
      setTransitions(trs);
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

  // Фокус из поиска применяется лениво при монтировании (см. useState выше);
  // здесь лишь сбрасываем внешний сигнал, чтобы он не сработал повторно.
  useEffect(() => {
    if (focusedAssetId) focusAsset(null);
  }, [focusedAssetId, focusAsset]);

  const tree = useMemo(() => buildLocationTree(locations), [locations]);

  const locationNames = useMemo(
    () => new Map(locations.map((l) => [l.id, l.name])),
    [locations],
  );

  const filteredAssets = useMemo(
    () => filterAssetsByLocation(assets, selectedLocationId, locations),
    [assets, selectedLocationId, locations],
  );

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId),
    [assets, selectedAssetId],
  );

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId],
  );

  const unitCodes = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );

  /** Атрибуты класса выбранного актива с подтянутыми значениями. */
  const selectedAttributes = useMemo<AttributeRow[]>(() => {
    if (!selectedAsset?.classificationId) return [];
    const defs = attributeDefs.filter(
      (d) => d.classificationId === selectedAsset.classificationId,
    );
    const valueByAttr = new Map(
      attributeValues
        .filter((v) => v.assetId === selectedAsset.id)
        .map((v) => [v.attributeId, v.value]),
    );
    return defs.map((def) => {
      const raw = valueByAttr.get(def.id);
      let valueText: string | undefined;
      if (typeof raw === 'boolean') {
        valueText = raw ? t('common.yes') : t('common.no');
      } else if (raw !== undefined) {
        const unit = def.unitId ? unitCodes.get(def.unitId) : undefined;
        valueText = unit ? `${raw} ${unit}` : String(raw);
      }
      return { id: def.id, name: def.name, valueText };
    });
  }, [selectedAsset, attributeDefs, attributeValues, unitCodes, t]);

  /** Схема жизненного цикла актива и разрешённые из текущего статуса переходы. */
  const statusAction = useMemo<StatusAction | undefined>(() => {
    if (!selectedAsset) return undefined;
    const scheme = findSchemeForEntity('asset', schemes);
    if (!scheme) return undefined;
    const schemeStatuses = statusesOfScheme(scheme.id, statuses);
    const current = schemeStatuses.find((s) => s.code === selectedAsset.status);
    if (!current) return undefined;
    const validCodes = new Set<string>(assetStatusSchema.options);
    const next = allowedNextStatuses(
      current.id,
      schemeStatuses,
      transitionsOfScheme(scheme.id, transitions),
    ).filter((s) => validCodes.has(s.code));
    return {
      options: next.map((s) => ({ code: s.code, name: s.name })),
    };
  }, [selectedAsset, schemes, statuses, transitions]);

  const afterMutation = async () => {
    setModal(null);
    await reload();
    bumpRevision();
  };

  const handleCreateAsset = async (values: Omit<Asset, 'id'>) => {
    const created = await repository.assets.create({
      id: `as-${nanoid(8)}`,
      ...values,
    });
    setSelectedAssetId(created.id);
    await afterMutation();
  };

  const handleUpdateAsset = async (values: Omit<Asset, 'id'>) => {
    if (!selectedAsset) return;
    await repository.assets.update(selectedAsset.id, values);
    await afterMutation();
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    if (!window.confirm(t('registry.deleteAssetConfirm'))) return;
    await repository.assets.remove(selectedAsset.id);
    setSelectedAssetId(null);
    await afterMutation();
  };

  const handleChangeStatus = async (code: string) => {
    if (!selectedAsset) return;
    const parsed = assetStatusSchema.safeParse(code);
    if (!parsed.success) return;
    await repository.assets.update(selectedAsset.id, { status: parsed.data });
    await reload();
    bumpRevision();
  };

  const handleCreateLocation = async (
    values: Omit<FunctionalLocation, 'id'>,
  ) => {
    await repository.functionalLocations.create({
      id: `fl-${nanoid(8)}`,
      ...values,
    });
    await afterMutation();
  };

  const handleUpdateLocation = async (
    values: Omit<FunctionalLocation, 'id'>,
  ) => {
    if (!selectedLocation) return;
    await repository.functionalLocations.update(selectedLocation.id, values);
    await afterMutation();
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    const hasChildren = locations.some(
      (l) => l.parentId === selectedLocation.id,
    );
    const hasAssets = assets.some(
      (a) => a.functionalLocationId === selectedLocation.id,
    );
    if (hasChildren || hasAssets) {
      window.alert(t('registry.deleteLocationBlocked'));
      return;
    }
    if (!window.confirm(t('registry.deleteLocationConfirm'))) return;
    await repository.functionalLocations.remove(selectedLocation.id);
    setSelectedLocationId(null);
    await afterMutation();
  };

  return (
    <div className={styles.layout}>
      <section className={styles.pane}>
        <header className={styles.paneHeader}>
          <span>{t('registry.treeTitle')}</span>
          <span className={styles.paneActions}>
            {selectedLocation && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.edit')}
                  aria-label={t('common.edit')}
                  onClick={() => setModal('location-edit')}
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.delete')}
                  aria-label={t('common.delete')}
                  onClick={handleDeleteLocation}
                >
                  <Trash2 size={15} />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              title={t('registry.addLocation')}
              aria-label={t('registry.addLocation')}
              onClick={() => setModal('location-create')}
            >
              <Plus size={16} />
            </Button>
          </span>
        </header>
        <LocationTree
          data={tree}
          selectedId={selectedLocationId}
          onSelect={setSelectedLocationId}
        />
      </section>

      <section className={styles.pane}>
        <header className={styles.paneHeader}>
          <span className="flex items-center gap-2">
            <span>{t('registry.title')}</span>
            <span className="text-xs text-muted">{filteredAssets.length}</span>
          </span>
          <Button size="sm" onClick={() => setModal('asset-create')}>
            <Plus size={15} />
            {t('registry.addAsset')}
          </Button>
        </header>
        <div className={styles.paneBody}>
          <AssetTable
            assets={filteredAssets}
            locationNames={locationNames}
            selectedAssetId={selectedAssetId}
            onSelectAsset={setSelectedAssetId}
          />
        </div>
      </section>

      <section className={styles.pane}>
        <header className={styles.paneHeader}>
          <span>{t('registry.cardTitle')}</span>
          {selectedAsset && (
            <span className={styles.paneActions}>
              <Button
                size="sm"
                variant="ghost"
                title={t('common.edit')}
                aria-label={t('common.edit')}
                onClick={() => setModal('asset-edit')}
              >
                <Pencil size={15} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title={t('common.delete')}
                aria-label={t('common.delete')}
                onClick={handleDeleteAsset}
              >
                <Trash2 size={15} />
              </Button>
            </span>
          )}
        </header>
        <div className={styles.paneBody}>
          <AssetDetails
            key={selectedAsset?.id ?? 'none'}
            asset={selectedAsset}
            locationNames={locationNames}
            attributes={selectedAttributes}
            statusAction={statusAction}
            onChangeStatus={handleChangeStatus}
          />
        </div>
      </section>

      <Modal
        open={modal === 'asset-create' || modal === 'asset-edit'}
        title={
          modal === 'asset-edit'
            ? t('registry.editAssetTitle')
            : t('registry.addAssetTitle')
        }
        onClose={() => setModal(null)}
        size="lg"
      >
        <AssetForm
          locations={locations}
          classifications={classifications}
          assets={assets}
          manufacturers={manufacturers}
          initial={modal === 'asset-edit' ? selectedAsset : undefined}
          defaultLocationId={selectedLocationId}
          onSubmit={
            modal === 'asset-edit' ? handleUpdateAsset : handleCreateAsset
          }
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal === 'location-create' || modal === 'location-edit'}
        title={
          modal === 'location-edit'
            ? t('registry.editLocationTitle')
            : t('registry.addLocationTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        <LocationForm
          locations={locations}
          initial={modal === 'location-edit' ? selectedLocation : undefined}
          defaultParentId={selectedLocationId}
          onSubmit={
            modal === 'location-edit'
              ? handleUpdateLocation
              : handleCreateLocation
          }
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
