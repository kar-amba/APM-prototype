import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { Pencil, Play, Plus, Trash2 } from 'lucide-react';
import type {
  Asset,
  Defect,
  Notification,
  Person,
  Reading,
  Route,
  RoundExecution,
  RoutePoint,
  ScalarValue,
  UnitOfMeasure,
} from '@/model';
import { SectionRoleHint } from '@/app/SectionRoleHint';
import { getRoundsDefaultTab, type RoundsTabId } from '@/services/role-profiles';
import { useDataStore, useRepository } from '@/store/dataStore';
import { useUiStore } from '@/store/uiStore';
import { Badge, Button, EmptyState, Modal, Tabs, type TabItem } from '@/shared/ui';
import {
  buildDeviationDefect,
  buildDeviationNotification,
  isReadingDeviation,
  pointsForRoute,
  rangeLabel,
} from '@/services/rounds';
import { RouteForm, RoutePointForm, type RoutePointFormResult } from './forms';
import { RoundExecutionPanel } from './RoundExecutionPanel';
import styles from './Rounds.module.css';

const TAB_IDS: readonly RoundsTabId[] = ['routes', 'execution', 'log'];
type TabId = RoundsTabId;

type ModalState =
  | { kind: 'route'; record?: Route }
  | { kind: 'point'; record?: RoutePoint }
  | null;

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('ru-RU');
}

export function RoundsPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);
  const role = useUiStore((s) => s.role);

  const [tab, setTab] = useState<TabId>(() => getRoundsDefaultTab(useUiStore.getState().role));
  const [routes, setRoutes] = useState<Route[]>([]);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [executions, setExecutions] = useState<RoundExecution[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [startRouteId, setStartRouteId] = useState<string>('');
  const [startPerformerId, setStartPerformerId] = useState<string>('');
  const [modal, setModal] = useState<ModalState>(null);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.routes.list(),
        repository.routePoints.list(),
        repository.roundExecutions.list(),
        repository.readings.list(),
        repository.assets.list(),
        repository.unitsOfMeasure.list(),
        repository.persons.list(),
      ]),
    [repository],
  );

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof loadAll>>) => {
      const [rts, pts, exs, rds, ass, uoms, prs] = data;
      setRoutes(rts);
      setPoints(pts);
      setExecutions(exs);
      setReadings(rds);
      setAssets(ass);
      setUnits(uoms);
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

  useEffect(() => {
    setTab(getRoundsDefaultTab(role));
  }, [role]);

  // Эффективный маршрут: явно выбранный либо первый в списке (без setState в эффекте).
  const activeRouteId = selectedRouteId ?? routes[0]?.id ?? null;

  const afterMutation = async () => {
    setModal(null);
    await reload();
    bumpRevision();
  };

  const unitCodes = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );
  const assetNames = useMemo(
    () => new Map(assets.map((a) => [a.id, a.name])),
    [assets],
  );
  const routeNames = useMemo(
    () => new Map(routes.map((r) => [r.id, r.name])),
    [routes],
  );
  const pointById = useMemo(
    () => new Map(points.map((p) => [p.id, p])),
    [points],
  );

  const selectedPoints = useMemo(
    () => (activeRouteId ? pointsForRoute(activeRouteId, points) : []),
    [activeRouteId, points],
  );

  const activeExecutions = useMemo(
    () =>
      executions
        .filter((e) => e.status === 'in_progress')
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [executions],
  );

  // Журнал — только ручные замеры обходов (с привязкой к выполнению). Поток
  // симулятора телеметрии сюда не попадает (он питает тренды и дашборд).
  const sortedReadings = useMemo(
    () =>
      readings
        .filter((r) => r.roundExecutionId !== undefined)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [readings],
  );

  /* === Routes & points === */
  const saveRoute = async (values: Omit<Route, 'id'>) => {
    if (modal?.kind === 'route' && modal.record) {
      await repository.routes.update(modal.record.id, values);
    } else {
      const created = await repository.routes.create({
        id: `rt-${nanoid(8)}`,
        ...values,
      });
      setSelectedRouteId(created.id);
    }
    await afterMutation();
  };

  const deleteRoute = async (route: Route) => {
    if (!window.confirm(t('rounds.deleteRouteConfirm'))) return;
    const routePoints = points.filter((p) => p.routeId === route.id);
    await Promise.all(
      routePoints.map((p) => repository.routePoints.remove(p.id)),
    );
    await repository.routes.remove(route.id);
    if (activeRouteId === route.id) setSelectedRouteId(null);
    await afterMutation();
  };

  const savePoint = async (values: RoutePointFormResult) => {
    if (modal?.kind === 'point' && modal.record) {
      await repository.routePoints.update(modal.record.id, values);
    } else if (activeRouteId) {
      await repository.routePoints.create({
        id: `rp-${nanoid(8)}`,
        routeId: activeRouteId,
        ...values,
      });
    }
    await afterMutation();
  };

  const deletePoint = async (point: RoutePoint) => {
    if (!window.confirm(t('rounds.deletePointConfirm'))) return;
    await repository.routePoints.remove(point.id);
    await afterMutation();
  };

  /* === Execution === */
  const startRound = async () => {
    if (!startRouteId) return;
    await repository.roundExecutions.create({
      id: `re-${nanoid(8)}`,
      routeId: startRouteId,
      performedById: startPerformerId || undefined,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    });
    setStartRouteId('');
    setStartPerformerId('');
    await reload();
    bumpRevision();
  };

  const saveReading = async (
    execution: RoundExecution,
    point: RoutePoint,
    value: ScalarValue,
  ) => {
    const deviation = isReadingDeviation(point, value);
    const reading: Reading = {
      id: `rd-${nanoid(8)}`,
      roundExecutionId: execution.id,
      routePointId: point.id,
      recordedAt: new Date().toISOString(),
      value,
      isDeviation: deviation,
    };
    await repository.readings.create(reading);

    if (deviation) {
      const asset = assets.find((a) => a.id === point.assetId);
      const defect: Defect = buildDeviationDefect({
        assetId: point.assetId,
        reading,
        point,
        title: t('rounds.deviationDefectTitle', { point: point.name }),
        description: t('rounds.deviationDefectDescription', {
          point: point.name,
          value: String(value),
        }),
        severity: asset?.criticality,
      });
      await repository.defects.create(defect);
      const notification: Notification = buildDeviationNotification({
        defect,
        message: t('rounds.deviationNotification', {
          point: point.name,
          asset: assetNames.get(point.assetId) ?? point.assetId,
        }),
      });
      await repository.notifications.create(notification);
    }

    await reload();
    bumpRevision();
  };

  const finishRound = async (execution: RoundExecution) => {
    await repository.roundExecutions.update(execution.id, {
      status: 'done',
      finishedAt: new Date().toISOString(),
    });
    await reload();
    bumpRevision();
  };

  const tabs: TabItem[] = TAB_IDS.map((id) => ({
    id,
    label: t(`rounds.tabs.${id}`),
  }));

  const selectedRoute = routes.find((r) => r.id === activeRouteId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h4>{t('rounds.title')}</h4>
          <p className={styles.subtitle}>{t('rounds.subtitle')}</p>
        </div>
        {tab === 'routes' && (
          <Button onClick={() => setModal({ kind: 'route' })}>
            <Plus size={15} />
            {t('rounds.addRoute')}
          </Button>
        )}
      </div>

      <SectionRoleHint section="rounds" />

      <div className={styles.tabsRow}>
        <Tabs items={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      </div>

      <div className={styles.content}>
        {tab === 'routes' && (
          <div className={styles.routesLayout}>
            <section className={styles.pane}>
              <header className={styles.paneHeader}>
                <span>{t('rounds.tabs.routes')}</span>
                <span className="text-xs text-muted">{routes.length}</span>
              </header>
              <div className={styles.paneBody}>
                {routes.length === 0 ? (
                  <EmptyState title={t('rounds.routesEmpty')} />
                ) : (
                  <ul className={styles.routeList}>
                    {routes.map((route) => (
                      <li key={route.id}>
                        <button
                          type="button"
                          className={[
                            styles.routeItem,
                            route.id === activeRouteId &&
                              styles.routeItemActive,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => setSelectedRouteId(route.id)}
                        >
                          <span className={styles.routeItemName}>
                            {route.name}
                          </span>
                          <span className={styles.routeItemCode}>
                            {route.code}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className={styles.pane}>
              {!selectedRoute ? (
                <EmptyState
                  title={t('rounds.selectRoute')}
                  description={t('rounds.selectRouteHint')}
                />
              ) : (
                <>
                  <header className={styles.paneHeader}>
                    <span>
                      {t('rounds.pointsTitle')} · {selectedRoute.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        title={t('rounds.editRouteTitle')}
                        aria-label={t('rounds.editRouteTitle')}
                        onClick={() =>
                          setModal({ kind: 'route', record: selectedRoute })
                        }
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        onClick={() => deleteRoute(selectedRoute)}
                      >
                        <Trash2 size={14} />
                      </Button>
                      <Button size="sm" onClick={() => setModal({ kind: 'point' })}>
                        <Plus size={14} />
                        {t('rounds.addPoint')}
                      </Button>
                    </div>
                  </header>
                  <div className={styles.paneBody}>
                    {selectedPoints.length === 0 ? (
                      <EmptyState title={t('rounds.pointsEmpty')} />
                    ) : (
                      <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                          <thead>
                            <tr>
                              <th>{t('rounds.order')}</th>
                              <th>{t('rounds.form.name')}</th>
                              <th>{t('rounds.form.asset')}</th>
                              <th>{t('rounds.form.kind')}</th>
                              <th>{t('rounds.range')}</th>
                              <th aria-label="actions" />
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPoints.map((point) => {
                              const unitCode = point.unitId
                                ? unitCodes.get(point.unitId)
                                : undefined;
                              return (
                                <tr key={point.id}>
                                  <td className={styles.mono}>{point.order}</td>
                                  <td className={styles.primaryName}>
                                    {point.name}
                                  </td>
                                  <td className="text-secondary">
                                    {assetNames.get(point.assetId) ??
                                      point.assetId}
                                  </td>
                                  <td>
                                    <Badge tone="default">
                                      {t(`routePointKind.${point.kind}`)}
                                    </Badge>
                                  </td>
                                  <td className={styles.mono}>
                                    {rangeLabel(point, unitCode)}
                                  </td>
                                  <td className={styles.rowActions}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      title={t('common.edit')}
                                      aria-label={t('common.edit')}
                                      onClick={() =>
                                        setModal({ kind: 'point', record: point })
                                      }
                                    >
                                      <Pencil size={14} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      title={t('common.delete')}
                                      aria-label={t('common.delete')}
                                      onClick={() => deletePoint(point)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {tab === 'execution' && (
          <div
            className={[
              styles.executionLayout,
              role === 'operator' && styles.executionLayoutAccent,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.startBar}>
              <div className={styles.startField}>
                <label className="label">
                  {t('rounds.execution.selectRoute')}
                </label>
                <select
                  className="input"
                  value={startRouteId}
                  onChange={(e) => setStartRouteId(e.target.value)}
                >
                  <option value="">
                    {t('rounds.execution.selectRoutePlaceholder')}
                  </option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.startField}>
                <label className="label">{t('rounds.execution.performer')}</label>
                <select
                  className="input"
                  value={startPerformerId}
                  onChange={(e) => setStartPerformerId(e.target.value)}
                >
                  <option value="">{t('common.none')}</option>
                  {persons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={startRound} disabled={!startRouteId}>
                <Play size={15} />
                {t('rounds.execution.start')}
              </Button>
            </div>

            {activeExecutions.length === 0 ? (
              <EmptyState
                title={t('rounds.execution.noActive')}
                description={t('rounds.execution.noActiveHint')}
              />
            ) : (
              activeExecutions.map((execution) => (
                <RoundExecutionPanel
                  key={execution.id}
                  execution={execution}
                  routeName={routeNames.get(execution.routeId) ?? execution.routeId}
                  points={points}
                  readings={readings}
                  unitCodes={unitCodes}
                  assetNames={assetNames}
                  onSaveReading={(point, value) =>
                    saveReading(execution, point, value)
                  }
                  onFinish={() => finishRound(execution)}
                />
              ))
            )}
          </div>
        )}

        {tab === 'log' && (
          <section className={styles.pane}>
            <header className={styles.paneHeader}>
              <span>{t('rounds.tabs.log')}</span>
              <span className="text-xs text-muted">{sortedReadings.length}</span>
            </header>
            <div className={styles.paneBody}>
              {sortedReadings.length === 0 ? (
                <EmptyState title={t('rounds.log.empty')} />
              ) : (
                <div className={styles.tableScroll}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>{t('rounds.log.columns.recordedAt')}</th>
                        <th>{t('rounds.log.columns.route')}</th>
                        <th>{t('rounds.log.columns.point')}</th>
                        <th>{t('rounds.log.columns.value')}</th>
                        <th>{t('rounds.log.columns.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedReadings.map((reading) => {
                        const point = pointById.get(reading.routePointId);
                        const unitCode = point?.unitId
                          ? unitCodes.get(point.unitId)
                          : undefined;
                        const valueText =
                          typeof reading.value === 'boolean'
                            ? reading.value
                              ? t('rounds.execution.checklistOk')
                              : t('rounds.execution.checklistFail')
                            : `${reading.value}${unitCode ? ` ${unitCode}` : ''}`;
                        return (
                          <tr key={reading.id}>
                            <td className="text-muted">
                              {formatDateTime(reading.recordedAt)}
                            </td>
                            <td className="text-secondary">
                              {point ? routeNames.get(point.routeId) ?? '—' : '—'}
                            </td>
                            <td>{point?.name ?? reading.routePointId}</td>
                            <td className={styles.mono}>{valueText}</td>
                            <td>
                              {reading.isDeviation ? (
                                <Badge tone="warning">
                                  {t('rounds.execution.deviation')}
                                </Badge>
                              ) : (
                                <Badge tone="success">{t('rounds.log.normal')}</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={modal?.kind === 'route'}
        title={
          modal?.kind === 'route' && modal.record
            ? t('rounds.editRouteTitle')
            : t('rounds.addRouteTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'route' && (
          <RouteForm
            initial={modal.record}
            onSubmit={saveRoute}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'point'}
        title={
          modal?.kind === 'point' && modal.record
            ? t('rounds.editPointTitle')
            : t('rounds.addPointTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'point' && (
          <RoutePointForm
            initial={modal.record}
            assets={assets}
            units={units}
            nextOrder={selectedPoints.length + 1}
            onSubmit={savePoint}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
