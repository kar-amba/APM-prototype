import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  Boxes,
  CircleAlert,
  Gauge,
  Route as RouteIcon,
  TriangleAlert,
} from 'lucide-react';
import type {
  Asset,
  CriticalityAssessment,
  Defect,
  Reading,
  RoundExecution,
  Route,
  RoutePoint,
  ScalarValue,
  Status,
  UnitOfMeasure,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Badge, EmptyState } from '@/shared/ui';
import { assetPath, criticalityTone } from '@/features/asset-registry/lib';
import {
  computeKpis,
  criticalityDistribution,
  defectsByDay,
  openDefectsList,
  recentDeviations,
  roundsCompletion,
  roundsSummary,
  topCriticalAssets,
} from '@/services/dashboard';
import { DefectsTrendChart } from './DefectsTrendChart';
import { CriticalityDistributionChart } from './CriticalityDistributionChart';
import styles from './Dashboard.module.css';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('ru-RU');
}

function formatReadingValue(
  value: ScalarValue,
  unitCode: string | undefined,
  fail: string,
  ok: string,
): string {
  if (typeof value === 'boolean') return value ? ok : fail;
  return `${value}${unitCode ? ` ${unitCode}` : ''}`;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [assessments, setAssessments] = useState<CriticalityAssessment[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [executions, setExecutions] = useState<RoundExecution[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.assets.list(),
        repository.statuses.list(),
        repository.defects.list(),
        repository.readings.list(),
        repository.criticalityAssessments.list(),
        repository.routePoints.list(),
        repository.roundExecutions.list(),
        repository.routes.list(),
        repository.unitsOfMeasure.list(),
      ]),
    [repository],
  );

  useEffect(() => {
    let active = true;
    void loadAll().then((data) => {
      if (!active) return;
      const [as, st, df, rd, ca, rp, ex, rt, uo] = data;
      setAssets(as);
      setStatuses(st);
      setDefects(df);
      setReadings(rd);
      setAssessments(ca);
      setRoutePoints(rp);
      setExecutions(ex);
      setRoutes(rt);
      setUnits(uo);
    });
    return () => {
      active = false;
    };
  }, [loadAll, revision]);

  const assetById = useMemo(
    () => new Map(assets.map((a) => [a.id, a])),
    [assets],
  );
  const routeNames = useMemo(
    () => new Map(routes.map((r) => [r.id, r.name])),
    [routes],
  );
  const unitCodeById = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );

  const kpis = useMemo(
    () => computeKpis(assets, statuses, defects, readings),
    [assets, statuses, defects, readings],
  );
  const trend = useMemo(() => defectsByDay(defects, 14), [defects]);
  const distribution = useMemo(
    () => criticalityDistribution(assets),
    [assets],
  );
  const topAssets = useMemo(
    () => topCriticalAssets(assets, assessments, defects, 6),
    [assets, assessments, defects],
  );
  const deviations = useMemo(
    () => recentDeviations(readings, routePoints, 6),
    [readings, routePoints],
  );
  const openDefects = useMemo(() => openDefectsList(defects, 6), [defects]);
  const rounds = useMemo(
    () => roundsCompletion(executions, routePoints, readings, 5),
    [executions, routePoints, readings],
  );
  const roundsTotals = useMemo(() => roundsSummary(executions), [executions]);

  const kpiTiles = [
    {
      key: 'assets',
      icon: <Boxes size={18} />,
      label: t('dashboard.kpi.totalAssets'),
      value: kpis.totalAssets,
      hint: t('dashboard.kpi.criticalHint', { count: kpis.criticalAssets }),
      tone: 'accent' as const,
    },
    {
      key: 'operational',
      icon: <Gauge size={18} />,
      label: t('dashboard.kpi.operationalRate'),
      value: `${kpis.operationalRate}%`,
      hint: t('dashboard.kpi.operationalHint', {
        inOperation: kpis.inOperation,
        total: kpis.totalAssets,
      }),
      tone: 'success' as const,
    },
    {
      key: 'defects',
      icon: <CircleAlert size={18} />,
      label: t('dashboard.kpi.openDefects'),
      value: kpis.openDefects,
      hint: t('dashboard.kpi.criticalDefectsHint', {
        count: kpis.criticalOpenDefects,
      }),
      tone: 'warning' as const,
    },
    {
      key: 'deviations',
      icon: <Activity size={18} />,
      label: t('dashboard.kpi.deviations'),
      value: kpis.deviations,
      hint: t('dashboard.kpi.roundsHint', {
        done: roundsTotals.done,
        total: roundsTotals.total,
      }),
      tone: 'error' as const,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h4>{t('dashboard.title')}</h4>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {kpiTiles.map((tile) => (
          <div key={tile.key} className={styles.kpiCard}>
            <span
              className={[styles.kpiIcon, styles[`kpiIcon_${tile.tone}`]]
                .filter(Boolean)
                .join(' ')}
            >
              {tile.icon}
            </span>
            <div className={styles.kpiBody}>
              <span className={styles.kpiLabel}>{tile.label}</span>
              <span className={styles.kpiValue}>{tile.value}</span>
              <span className={styles.kpiHint}>{tile.hint}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.charts.defectsTitle')}</span>
            <span className="text-xs text-muted">
              {t('dashboard.charts.defectsPeriod')}
            </span>
          </header>
          <div className={styles.paneBodyChart}>
            <DefectsTrendChart data={trend} />
          </div>
        </section>

        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.charts.distributionTitle')}</span>
          </header>
          <div className={styles.paneBodyChart}>
            <CriticalityDistributionChart data={distribution} />
          </div>
        </section>
      </div>

      <div className={styles.widgetsGrid}>
        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.topCritical.title')}</span>
          </header>
          <div className={styles.paneBody}>
            {topAssets.length === 0 ? (
              <EmptyState title={t('dashboard.topCritical.empty')} />
            ) : (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t('dashboard.topCritical.asset')}</th>
                    <th>{t('dashboard.topCritical.criticality')}</th>
                    <th className={styles.right}>
                      {t('dashboard.topCritical.score')}
                    </th>
                    <th className={styles.right}>
                      {t('dashboard.topCritical.openDefects')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topAssets.map((row) => (
                    <tr key={row.asset.id}>
                      <td>
                        <Link
                          to={assetPath(row.asset.id)}
                          className={styles.assetLink}
                        >
                          {row.asset.name}
                        </Link>
                        <div className={styles.assetCode}>{row.asset.code}</div>
                      </td>
                      <td>
                        <Badge tone={criticalityTone[row.level]}>
                          {t(`criticalityLevel.${row.level}`)}
                        </Badge>
                      </td>
                      <td className={[styles.right, styles.mono].join(' ')}>
                        {row.score ?? '—'}
                      </td>
                      <td className={[styles.right, styles.mono].join(' ')}>
                        {row.openDefects > 0 ? (
                          <span className={styles.defectCount}>
                            {row.openDefects}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.deviations.title')}</span>
          </header>
          <div className={styles.paneBody}>
            {deviations.length === 0 ? (
              <EmptyState title={t('dashboard.deviations.empty')} />
            ) : (
              <ul className={styles.list}>
                {deviations.map((item) => {
                  const asset = item.assetId
                    ? assetById.get(item.assetId)
                    : undefined;
                  const unitCode = item.point?.unitId
                    ? unitCodeById.get(item.point.unitId)
                    : undefined;
                  return (
                    <li key={item.reading.id} className={styles.listItem}>
                      <span className={styles.listDot} data-tone="warning" />
                      <div className={styles.listBody}>
                        <div className={styles.listTitle}>
                          {item.point?.name ?? item.reading.routePointId}
                          <span className={styles.listValue}>
                            {formatReadingValue(
                              item.reading.value,
                              unitCode,
                              t('dashboard.deviations.fail'),
                              t('dashboard.deviations.ok'),
                            )}
                          </span>
                        </div>
                        <div className={styles.listMeta}>
                          {asset ? (
                            <Link
                              to={assetPath(asset.id)}
                              className={styles.metaLink}
                            >
                              {asset.name}
                            </Link>
                          ) : (
                            <span>{item.assetId ?? '—'}</span>
                          )}
                          <span className={styles.metaTime}>
                            {formatDateTime(item.reading.recordedAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.defects.title')}</span>
          </header>
          <div className={styles.paneBody}>
            {openDefects.length === 0 ? (
              <EmptyState title={t('dashboard.defects.empty')} />
            ) : (
              <ul className={styles.list}>
                {openDefects.map((defect) => {
                  const asset = assetById.get(defect.assetId);
                  return (
                    <li key={defect.id} className={styles.listItem}>
                      <TriangleAlert
                        size={16}
                        className={styles.defectIcon}
                        data-severity={defect.severity}
                      />
                      <div className={styles.listBody}>
                        <div className={styles.listTitle}>{defect.title}</div>
                        <div className={styles.listMeta}>
                          {asset ? (
                            <Link
                              to={assetPath(asset.id)}
                              className={styles.metaLink}
                            >
                              {asset.name}
                            </Link>
                          ) : (
                            <span>{defect.assetId}</span>
                          )}
                          <Badge tone={criticalityTone[defect.severity]}>
                            {t(`criticalityLevel.${defect.severity}`)}
                          </Badge>
                          <Badge tone="default">
                            {t(`defectSource.${defect.source}`)}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('dashboard.rounds.title')}</span>
            <span className="text-xs text-muted">
              {t('dashboard.rounds.doneRate', { rate: roundsTotals.doneRate })}
            </span>
          </header>
          <div className={styles.paneBody}>
            {rounds.length === 0 ? (
              <EmptyState
                title={t('dashboard.rounds.empty')}
                icon={<RouteIcon size={26} />}
              />
            ) : (
              <ul className={styles.roundList}>
                {rounds.map((round) => (
                  <li key={round.execution.id} className={styles.roundItem}>
                    <div className={styles.roundHead}>
                      <span className={styles.roundName}>
                        {routeNames.get(round.execution.routeId) ??
                          round.execution.routeId}
                      </span>
                      {round.execution.status === 'in_progress' ? (
                        <Badge tone="info">
                          {t('dashboard.rounds.inProgress')}
                        </Badge>
                      ) : (
                        <Badge tone="success">{t('dashboard.rounds.done')}</Badge>
                      )}
                    </div>
                    <div className={styles.progress}>
                      <div
                        className={[
                          styles.progressBar,
                          round.done && styles.progressBarDone,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ width: `${round.percent}%` }}
                      />
                    </div>
                    <div className={styles.roundMeta}>
                      <span>
                        {t('dashboard.rounds.progress', {
                          recorded: round.recorded,
                          total: round.total,
                        })}
                      </span>
                      {round.deviations > 0 && (
                        <span className={styles.roundDeviations}>
                          <AlertTriangle size={12} />
                          {t('dashboard.rounds.deviations', {
                            count: round.deviations,
                          })}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
