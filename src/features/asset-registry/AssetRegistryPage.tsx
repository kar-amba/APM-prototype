import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Asset, Classification, FunctionalLocation } from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Button, Modal } from '@/shared/ui';
import { LocationTree } from './LocationTree';
import { AssetTable } from './AssetTable';
import { AssetDetails } from './AssetDetails';
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

  const [locations, setLocations] = useState<FunctionalLocation[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  const reload = useCallback(async () => {
    const [locs, ass, cls] = await Promise.all([
      repository.functionalLocations.list(),
      repository.assets.list(),
      repository.classifications.list(),
    ]);
    setLocations(locs);
    setAssets(ass);
    setClassifications(cls);
  }, [repository]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      repository.functionalLocations.list(),
      repository.assets.list(),
      repository.classifications.list(),
    ]).then(([locs, ass, cls]) => {
      if (!active) return;
      setLocations(locs);
      setAssets(ass);
      setClassifications(cls);
    });
    return () => {
      active = false;
    };
  }, [repository, revision]);

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
