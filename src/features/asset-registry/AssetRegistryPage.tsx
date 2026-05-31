import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { appRepository } from '@/data';
import type { Asset, FunctionalLocation } from '@/model';
import { LocationTree } from './LocationTree';
import { AssetTable } from './AssetTable';
import { AssetDetails } from './AssetDetails';
import { buildLocationTree, filterAssetsByLocation } from './lib';
import styles from './AssetRegistry.module.css';

export function AssetRegistryPage() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<FunctionalLocation[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      appRepository.functionalLocations.list(),
      appRepository.assets.list(),
    ]).then(([locs, ass]) => {
      if (!active) return;
      setLocations(locs);
      setAssets(ass);
    });
    return () => {
      active = false;
    };
  }, []);

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

  return (
    <div className={styles.layout}>
      <section className={styles.pane}>
        <header className={styles.paneHeader}>{t('registry.treeTitle')}</header>
        <LocationTree
          data={tree}
          selectedId={selectedLocationId}
          onSelect={setSelectedLocationId}
        />
      </section>

      <section className={styles.pane}>
        <header className={styles.paneHeader}>
          <span>{t('registry.title')}</span>
          <span className="text-xs text-muted">{filteredAssets.length}</span>
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
          {t('registry.tabs.overview')}
        </header>
        <div className={styles.paneBody}>
          <AssetDetails
            key={selectedAsset?.id ?? 'none'}
            asset={selectedAsset}
            locationNames={locationNames}
          />
        </div>
      </section>
    </div>
  );
}
