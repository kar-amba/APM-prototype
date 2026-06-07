import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import type {
  Asset,
  AssetAttributeValue,
  AttributeDefinition,
  Classification,
  CriticalityAssessment,
  Defect,
  FunctionalLocation,
  MaintenanceTask,
  Manufacturer,
  OrgUnit,
  Person,
  Reading,
  RoundExecution,
  RoutePoint,
  Status,
  StatusScheme,
  Strategy,
  Transition,
  UnitOfMeasure,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Button, EmptyState, Modal } from '@/shared/ui';
import { resolveAssetStatus } from '@/services/status-flow';
import { AssetDetails, type StatusAction } from './AssetDetails';
import { AssetForm } from './AssetForm';
import { AssetRelatedWidgets } from './AssetRelatedWidgets';
import { buildAttributeRows } from './assetView';
import styles from './AssetCard.module.css';

export function AssetCardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assetId } = useParams<{ assetId: string }>();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [loaded, setLoaded] = useState(false);
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<FunctionalLocation[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [attributeDefs, setAttributeDefs] = useState<AttributeDefinition[]>([]);
  const [attributeValues, setAttributeValues] = useState<AssetAttributeValue[]>(
    [],
  );
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [schemes, setSchemes] = useState<StatusScheme[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    [],
  );
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [roundExecutions, setRoundExecutions] = useState<RoundExecution[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [criticalityAssessments, setCriticalityAssessments] = useState<
    CriticalityAssessment[]
  >([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [editing, setEditing] = useState(false);

  const loadAll = useCallback(async () => {
    const [
      ass,
      locs,
      cls,
      defs,
      vals,
      uoms,
      mfs,
      orgs,
      prs,
      sch,
      sts,
      trs,
      strs,
      tasks,
      rps,
      res,
      rds,
      cas,
      dfs,
    ] = await Promise.all([
      repository.assets.list(),
      repository.functionalLocations.list(),
      repository.classifications.list(),
      repository.attributeDefinitions.list(),
      repository.assetAttributeValues.list(),
      repository.unitsOfMeasure.list(),
      repository.manufacturers.list(),
      repository.orgUnits.list(),
      repository.persons.list(),
      repository.statusSchemes.list(),
      repository.statuses.list(),
      repository.transitions.list(),
      repository.strategies.list(),
      repository.maintenanceTasks.list(),
      repository.routePoints.list(),
      repository.roundExecutions.list(),
      repository.readings.list(),
      repository.criticalityAssessments.list(),
      repository.defects.list(),
    ]);
    return {
      ass,
      locs,
      cls,
      defs,
      vals,
      uoms,
      mfs,
      orgs,
      prs,
      sch,
      sts,
      trs,
      strs,
      tasks,
      rps,
      res,
      rds,
      cas,
      dfs,
    };
  }, [repository]);

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof loadAll>>) => {
      setAssets(data.ass);
      setAsset(data.ass.find((a) => a.id === assetId));
      setLocations(data.locs);
      setClassifications(data.cls);
      setAttributeDefs(data.defs);
      setAttributeValues(data.vals);
      setUnits(data.uoms);
      setManufacturers(data.mfs);
      setOrgUnits(data.orgs);
      setPersons(data.prs);
      setSchemes(data.sch);
      setStatuses(data.sts);
      setTransitions(data.trs);
      setStrategies(data.strs);
      setMaintenanceTasks(data.tasks);
      setRoutePoints(data.rps);
      setRoundExecutions(data.res);
      setReadings(data.rds);
      setCriticalityAssessments(data.cas);
      setDefects(data.dfs);
      setLoaded(true);
    },
    [assetId],
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

  const locationNames = useMemo(
    () => new Map(locations.map((l) => [l.id, l.name])),
    [locations],
  );
  const unitCodes = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );
  const orgUnitNames = useMemo(
    () => new Map(orgUnits.map((o) => [o.id, o.name])),
    [orgUnits],
  );
  const personNames = useMemo(
    () => new Map(persons.map((p) => [p.id, p.name])),
    [persons],
  );

  const statusContext = useMemo(
    () =>
      asset
        ? resolveAssetStatus(asset.statusId, schemes, statuses, transitions)
        : undefined,
    [asset, schemes, statuses, transitions],
  );

  const assetSchemeStatuses = useMemo(
    () =>
      resolveAssetStatus(undefined, schemes, statuses, transitions)?.statuses ??
      [],
    [schemes, statuses, transitions],
  );

  const statusAction = useMemo<StatusAction | undefined>(() => {
    if (!statusContext) return undefined;
    return {
      options: statusContext.next.map((s) => ({ id: s.id, name: s.name })),
    };
  }, [statusContext]);

  const attributes = useMemo(
    () =>
      asset
        ? buildAttributeRows(asset, attributeDefs, attributeValues, unitCodes, {
            yes: t('common.yes'),
            no: t('common.no'),
          })
        : [],
    [asset, attributeDefs, attributeValues, unitCodes, t],
  );

  const handleChangeStatus = async (statusId: string) => {
    if (!asset || !statusContext) return;
    if (!statusContext.next.some((s) => s.id === statusId)) return;
    await repository.assets.update(asset.id, { statusId });
    await reload();
    bumpRevision();
  };

  const handleUpdateAsset = async (values: Omit<Asset, 'id'>) => {
    if (!asset) return;
    await repository.assets.update(asset.id, values);
    setEditing(false);
    await reload();
    bumpRevision();
  };

  const handleDeleteAsset = async () => {
    if (!asset) return;
    if (!window.confirm(t('registry.deleteAssetConfirm'))) return;
    await repository.assets.remove(asset.id);
    bumpRevision();
    navigate('/assets');
  };

  if (loaded && !asset) {
    return (
      <EmptyState
        title={t('assetCard.notFound')}
        description={t('assetCard.notFoundHint')}
        action={
          <Link to="/assets" className="btn btn-secondary btn-sm">
            <ArrowLeft size={15} />
            {t('assetCard.backToRegistry')}
          </Link>
        }
      />
    );
  }

  if (!asset) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link to="/assets" className={styles.backLink}>
            <ArrowLeft size={15} />
            {t('nav.assets')}
          </Link>
          <span>/</span>
          <span className={styles.crumbCurrent}>
            {asset.code} · {asset.name}
          </span>
        </div>
        <div className={styles.headerActions}>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} />
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDeleteAsset}>
            <Trash2 size={15} />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className={styles.cardPane}>
        <AssetDetails
          asset={asset}
          locationNames={locationNames}
          currentStatus={statusContext?.current}
          ownerName={asset.ownerId ? orgUnitNames.get(asset.ownerId) : undefined}
          plannerName={
            asset.plannerId ? personNames.get(asset.plannerId) : undefined
          }
          attributes={attributes}
          statusAction={statusAction}
          onChangeStatus={handleChangeStatus}
          relatedWidgets={
            <AssetRelatedWidgets
              asset={asset}
              strategies={strategies}
              maintenanceTasks={maintenanceTasks}
              routePoints={routePoints}
              roundExecutions={roundExecutions}
              readings={readings}
              criticalityAssessments={criticalityAssessments}
              defects={defects}
            />
          }
        />
      </div>

      <Modal
        open={editing}
        title={t('registry.editAssetTitle')}
        onClose={() => setEditing(false)}
        size="lg"
      >
        <AssetForm
          locations={locations}
          classifications={classifications}
          assets={assets}
          manufacturers={manufacturers}
          orgUnits={orgUnits}
          persons={persons}
          statuses={assetSchemeStatuses}
          initial={asset}
          onSubmit={handleUpdateAsset}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
