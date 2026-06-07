import { useTranslation } from 'react-i18next';
import type { Asset, MaintenanceTask, Strategy } from '@/model';
import { Badge } from '@/shared/ui';
import { assetMaintenanceTasks } from '@/services/asset-related';
import { formatInterval, formatNextDue } from '@/services/strategies';
import styles from './AssetCard.module.css';

interface AssetStrategyTabProps {
  asset: Asset;
  strategies: Strategy[];
  maintenanceTasks: MaintenanceTask[];
}

/** Вкладка «Стратегия и мероприятия» карточки актива: назначенные задачи ТОиР. */
export function AssetStrategyTab({
  asset,
  strategies,
  maintenanceTasks,
}: AssetStrategyTabProps) {
  const { t } = useTranslation();

  const tasks = assetMaintenanceTasks(
    asset.id,
    asset.classificationId,
    maintenanceTasks,
  );
  const strategyById = new Map(strategies.map((s) => [s.id, s]));

  if (tasks.length === 0) {
    return <p className="text-muted">{t('assetCard.strategyTab.empty')}</p>;
  }

  return (
    <div className={styles.tabSection}>
      <div className={styles.tabSectionTitle}>
        {t('assetCard.strategyTab.tasksTitle')}
      </div>
      <table className={styles.tabTable}>
        <thead>
          <tr>
            <th>{t('strategies.columns.task')}</th>
            <th>{t('assetCard.strategyTab.strategy')}</th>
            <th>{t('assetCard.strategyTab.interval')}</th>
            <th>{t('assetCard.strategyTab.nextDue')}</th>
            <th>{t('assetCard.strategyTab.binding')}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task: MaintenanceTask) => {
            const strategy = strategyById.get(task.strategyId);
            return (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>
                  {strategy ? (
                    <Badge tone="accent">
                      {t(`strategyType.${strategy.type}`)}
                    </Badge>
                  ) : (
                    '—'
                  )}
                  <div className={styles.tabMono}>{strategy?.name ?? ''}</div>
                </td>
                <td>{formatInterval(task.intervalDays)}</td>
                <td className="text-muted">{formatNextDue(task.intervalDays)}</td>
                <td className="text-secondary">
                  {task.assetId
                    ? t('assetCard.strategyTab.bindingDirect')
                    : t('assetCard.strategyTab.bindingClass')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
