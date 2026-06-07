import { useTranslation } from 'react-i18next';
import { AlertTriangle, ClipboardList, Gauge, Route } from 'lucide-react';
import type {
  Asset,
  CriticalityAssessment,
  Defect,
  MaintenanceTask,
  Reading,
  RoundExecution,
  RoutePoint,
  Strategy,
} from '@/model';
import { Badge } from '@/shared/ui';
import {
  assetMaintenanceTasks,
  assetOpenDefects,
  assetRoundsSummary,
  latestCriticality,
} from '@/services/asset-related';
import { criticalityTone } from './lib';
import styles from './AssetCard.module.css';

interface AssetRelatedWidgetsProps {
  asset: Asset;
  strategies: Strategy[];
  maintenanceTasks: MaintenanceTask[];
  routePoints: RoutePoint[];
  roundExecutions: RoundExecution[];
  readings: Reading[];
  criticalityAssessments: CriticalityAssessment[];
  defects: Defect[];
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('ru-RU');
}

/**
 * Блок виджетов связанных с активом сущностей на вкладке «Обзор» полной карточки.
 * Данные приходят через репозиторий (загружает страница), здесь — только выбор и
 * сводка через селекторы `services/asset-related`.
 */
export function AssetRelatedWidgets({
  asset,
  strategies,
  maintenanceTasks,
  routePoints,
  roundExecutions,
  readings,
  criticalityAssessments,
  defects,
}: AssetRelatedWidgetsProps) {
  const { t } = useTranslation();

  const tasks = assetMaintenanceTasks(
    asset.id,
    asset.classificationId,
    maintenanceTasks,
  );
  const strategyNameById = new Map(strategies.map((s) => [s.id, s.name]));
  const rounds = assetRoundsSummary(
    asset.id,
    routePoints,
    roundExecutions,
    readings,
  );
  const criticality = latestCriticality(asset.id, criticalityAssessments);
  const openDefects = assetOpenDefects(asset.id, defects);

  return (
    <div className={styles.widgets}>
      <div className={styles.widgetsTitle}>{t('assetCard.related')}</div>
      <div className={styles.widgetGrid}>
        {/* Стратегии и мероприятия */}
        <div className={styles.widget}>
          <div className={styles.widgetHead}>
            <ClipboardList size={16} />
            <span>{t('assetCard.widgets.strategy')}</span>
            <span className={styles.widgetCount}>{tasks.length}</span>
          </div>
          {tasks.length === 0 ? (
            <p className={styles.widgetEmpty}>{t('assetCard.noData')}</p>
          ) : (
            <ul className={styles.widgetList}>
              {tasks.slice(0, 3).map((task) => (
                <li key={task.id} className={styles.widgetItem}>
                  <span>{task.name}</span>
                  <span className={styles.widgetMeta}>
                    {strategyNameById.get(task.strategyId) ??
                      t('assetCard.noData')}{' '}
                    · {t('assetCard.everyDays', { count: task.intervalDays })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Обходы и замеры */}
        <div className={styles.widget}>
          <div className={styles.widgetHead}>
            <Route size={16} />
            <span>{t('assetCard.widgets.rounds')}</span>
            <span className={styles.widgetCount}>{rounds.pointCount}</span>
          </div>
          {rounds.pointCount === 0 ? (
            <p className={styles.widgetEmpty}>{t('assetCard.noData')}</p>
          ) : (
            <ul className={styles.widgetList}>
              <li className={styles.widgetItem}>
                <span>{t('assetCard.lastRound')}</span>
                <span className={styles.widgetMeta}>
                  {formatDate(rounds.lastRoundAt)}
                </span>
              </li>
              <li className={styles.widgetItem}>
                <span>{t('assetCard.deviations')}</span>
                <span className={styles.widgetMeta}>
                  {rounds.deviationCount > 0 ? (
                    <Badge tone="warning">{rounds.deviationCount}</Badge>
                  ) : (
                    rounds.deviationCount
                  )}
                </span>
              </li>
            </ul>
          )}
        </div>

        {/* Критичность */}
        <div className={styles.widget}>
          <div className={styles.widgetHead}>
            <Gauge size={16} />
            <span>{t('assetCard.widgets.criticality')}</span>
          </div>
          {!criticality ? (
            <p className={styles.widgetEmpty}>{t('assetCard.noData')}</p>
          ) : (
            <ul className={styles.widgetList}>
              <li className={styles.widgetItem}>
                <Badge tone={criticalityTone[criticality.level]}>
                  {t(`criticalityLevel.${criticality.level}`)}
                </Badge>
                <span className={styles.widgetMeta}>
                  {t('assetCard.riskScore', { score: criticality.score })}
                </span>
              </li>
              <li className={styles.widgetItem}>
                <span>{t('assetCard.assessedAt')}</span>
                <span className={styles.widgetMeta}>
                  {formatDate(criticality.assessedAt)}
                </span>
              </li>
            </ul>
          )}
        </div>

        {/* Дефекты и уведомления */}
        <div className={styles.widget}>
          <div className={styles.widgetHead}>
            <AlertTriangle size={16} />
            <span>{t('assetCard.widgets.defects')}</span>
            <span className={styles.widgetCount}>{openDefects.length}</span>
          </div>
          {openDefects.length === 0 ? (
            <p className={styles.widgetEmpty}>{t('assetCard.noOpenDefects')}</p>
          ) : (
            <ul className={styles.widgetList}>
              {openDefects.slice(0, 3).map((defect) => (
                <li key={defect.id} className={styles.widgetItem}>
                  <span>{defect.title}</span>
                  <span className={styles.widgetMeta}>
                    <Badge tone={criticalityTone[defect.severity]}>
                      {t(`criticalityLevel.${defect.severity}`)}
                    </Badge>
                    {' · '}
                    {formatDate(defect.detectedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
