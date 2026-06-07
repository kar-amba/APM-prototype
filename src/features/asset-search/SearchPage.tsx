import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type {
  Asset,
  AssetAttributeValue,
  AttributeDefinition,
  Classification,
  FunctionalLocation,
  OrgUnit,
  Person,
  Status,
  StatusScheme,
  Transition,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { useUiStore } from '@/store/uiStore';
import { resolveAssetStatus } from '@/services/status-flow';
import { FilterPanel } from './FilterPanel';
import { ResultsTable } from './ResultsTable';
import { useSearchStore } from './searchStore';
import { applyFilters } from './lib';
import styles from './Search.module.css';

/** Уникальные непустые значения поля по списку активов (для выпадающих списков). */
function distinct(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort(
    (a, b) => a.localeCompare(b, 'ru'),
  );
}

export function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const focusAsset = useUiStore((s) => s.focusAsset);
  const filters = useSearchStore((s) => s.filters);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<FunctionalLocation[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [attributeDefs, setAttributeDefs] = useState<AttributeDefinition[]>([]);
  const [attributeValues, setAttributeValues] = useState<
    AssetAttributeValue[]
  >([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [schemes, setSchemes] = useState<StatusScheme[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.assets.list(),
        repository.functionalLocations.list(),
        repository.classifications.list(),
        repository.attributeDefinitions.list(),
        repository.assetAttributeValues.list(),
        repository.orgUnits.list(),
        repository.persons.list(),
        repository.statusSchemes.list(),
        repository.statuses.list(),
        repository.transitions.list(),
      ]),
    [repository],
  );

  useEffect(() => {
    let active = true;
    void loadAll().then(
      ([ass, locs, cls, defs, vals, orgs, prs, sch, sts, trs]) => {
        if (!active) return;
        setAssets(ass);
        setLocations(locs);
        setClassifications(cls);
        setAttributeDefs(defs);
        setAttributeValues(vals);
        setOrgUnits(orgs);
        setPersons(prs);
        setSchemes(sch);
        setStatuses(sts);
        setTransitions(trs);
      },
    );
    return () => {
      active = false;
    };
  }, [loadAll, revision]);

  const locationNames = useMemo(
    () => new Map(locations.map((l) => [l.id, l.name])),
    [locations],
  );

  const statusById = useMemo(
    () => new Map(statuses.map((s) => [s.id, s])),
    [statuses],
  );

  const assetSchemeStatuses = useMemo(
    () =>
      resolveAssetStatus(undefined, schemes, statuses, transitions)?.statuses ??
      [],
    [schemes, statuses, transitions],
  );

  const manufacturers = useMemo(
    () => distinct(assets.map((a) => a.manufacturer)),
    [assets],
  );

  const results = useMemo(
    () =>
      applyFilters(assets, filters, {
        locations,
        attributeValues,
        attributeDefs,
      }),
    [assets, filters, locations, attributeValues, attributeDefs],
  );

  const handleSelect = (id: string) => {
    focusAsset(id);
    navigate('/assets');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>{t('search.filtersTitle')}</header>
        <FilterPanel
          classifications={classifications}
          locations={locations}
          attributeDefs={attributeDefs}
          manufacturers={manufacturers}
          statuses={assetSchemeStatuses}
          owners={orgUnits}
          planners={persons}
        />
      </aside>

      <section className={styles.results}>
        <header className={styles.resultsHeader}>
          <span>{t('search.resultsTitle')}</span>
          <span className="text-sm text-muted">
            {t('search.found', { count: results.length })}
          </span>
        </header>
        <div className={styles.resultsBody}>
          <ResultsTable
            assets={results}
            locationNames={locationNames}
            statusById={statusById}
            onSelect={handleSelect}
          />
        </div>
      </section>
    </div>
  );
}
