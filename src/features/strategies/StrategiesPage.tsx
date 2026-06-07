import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type {
  Asset,
  Classification,
  CriticalityAssessment,
  MaintenanceTask,
  Strategy,
} from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Badge, Button, EmptyState, Modal, Tabs, type TabItem } from '@/shared/ui';
import {
  formatInterval,
  formatNextDue,
  strategyRecommendations,
  taskCountByStrategy,
} from '@/services/strategies';
import { criticalityTone } from '@/features/asset-registry/lib';
import { MaintenanceTaskForm, StrategyForm } from './forms';
import styles from './Strategies.module.css';

const TAB_IDS = ['strategies', 'tasks'] as const;
type TabId = (typeof TAB_IDS)[number];

type ModalState =
  | { kind: 'strategy'; record?: Strategy }
  | { kind: 'task'; record?: MaintenanceTask }
  | null;

export function StrategiesPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [tab, setTab] = useState<TabId>('strategies');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [assessments, setAssessments] = useState<CriticalityAssessment[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.strategies.list(),
        repository.maintenanceTasks.list(),
        repository.assets.list(),
        repository.classifications.list(),
        repository.criticalityAssessments.list(),
      ]),
    [repository],
  );

  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof loadAll>>) => {
      const [str, tsk, ass, cls, ca] = data;
      setStrategies(str);
      setTasks(tsk);
      setAssets(ass);
      setClassifications(cls);
      setAssessments(ca);
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

  const strategyNames = useMemo(
    () => new Map(strategies.map((s) => [s.id, s.name])),
    [strategies],
  );
  const assetNames = useMemo(
    () => new Map(assets.map((a) => [a.id, a.name])),
    [assets],
  );
  const classNames = useMemo(
    () => new Map(classifications.map((c) => [c.id, c.name])),
    [classifications],
  );
  const taskCounts = useMemo(() => taskCountByStrategy(tasks), [tasks]);
  const recommendations = useMemo(
    () => strategyRecommendations(assessments),
    [assessments],
  );

  const saveStrategy = async (values: Omit<Strategy, 'id'>) => {
    if (modal?.kind === 'strategy' && modal.record) {
      await repository.strategies.update(modal.record.id, values);
    } else {
      await repository.strategies.create({ id: `str-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const deleteStrategy = async (strategy: Strategy) => {
    if (!window.confirm(t('strategies.deleteStrategyConfirm'))) return;
    const relatedTasks = tasks.filter((task) => task.strategyId === strategy.id);
    await Promise.all(
      relatedTasks.map((task) => repository.maintenanceTasks.remove(task.id)),
    );
    await repository.strategies.remove(strategy.id);
    await afterMutation();
  };

  const saveTask = async (values: Omit<MaintenanceTask, 'id'>) => {
    if (modal?.kind === 'task' && modal.record) {
      await repository.maintenanceTasks.update(modal.record.id, values);
    } else {
      await repository.maintenanceTasks.create({ id: `mt-${nanoid(8)}`, ...values });
    }
    await afterMutation();
  };

  const deleteTask = async (task: MaintenanceTask) => {
    if (!window.confirm(t('strategies.deleteTaskConfirm'))) return;
    await repository.maintenanceTasks.remove(task.id);
    await afterMutation();
  };

  const taskBinding = (task: MaintenanceTask): string => {
    if (task.assetId) {
      return t('strategies.bindingAsset', {
        name: assetNames.get(task.assetId) ?? task.assetId,
      });
    }
    if (task.classificationId) {
      return t('strategies.bindingClass', {
        name: classNames.get(task.classificationId) ?? task.classificationId,
      });
    }
    return t('strategies.bindingNone');
  };

  const tabs: TabItem[] = TAB_IDS.map((id) => ({
    id,
    label: t(`strategies.tabs.${id}`),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h4>{t('strategies.title')}</h4>
          <p className={styles.subtitle}>{t('strategies.subtitle')}</p>
        </div>
        {tab === 'strategies' ? (
          <Button onClick={() => setModal({ kind: 'strategy' })}>
            <Plus size={15} />
            {t('strategies.addStrategy')}
          </Button>
        ) : (
          <Button onClick={() => setModal({ kind: 'task' })}>
            <Plus size={15} />
            {t('strategies.addTask')}
          </Button>
        )}
      </div>

      <div className={styles.tabsRow}>
        <Tabs items={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} />
      </div>

      <div className={styles.content}>
        {tab === 'strategies' && (
          <div className={styles.layout}>
            <section className={styles.pane}>
              <header className={styles.paneHeader}>
                <span>{t('strategies.tabs.strategies')}</span>
                <span className="text-xs text-muted">{strategies.length}</span>
              </header>
              <div className={styles.paneBody}>
                {strategies.length === 0 ? (
                  <EmptyState title={t('strategies.empty')} />
                ) : (
                  <div className={styles.tableScroll}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>{t('strategies.columns.name')}</th>
                          <th>{t('strategies.columns.type')}</th>
                          <th>{t('strategies.columns.tasks')}</th>
                          <th aria-label="actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map((strategy) => (
                          <tr key={strategy.id}>
                            <td>
                              <div className={styles.primaryCell}>
                                <span className={styles.primaryName}>
                                  {strategy.name}
                                </span>
                                <span className={styles.code}>{strategy.code}</span>
                              </div>
                            </td>
                            <td>
                              <Badge tone="accent">
                                {t(`strategyType.${strategy.type}`)}
                              </Badge>
                            </td>
                            <td>{taskCounts.get(strategy.id) ?? 0}</td>
                            <td className={styles.rowActions}>
                              <Button
                                size="sm"
                                variant="ghost"
                                title={t('common.edit')}
                                aria-label={t('common.edit')}
                                onClick={() =>
                                  setModal({ kind: 'strategy', record: strategy })
                                }
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title={t('common.delete')}
                                aria-label={t('common.delete')}
                                onClick={() => deleteStrategy(strategy)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.pane}>
              <header className={styles.paneHeader}>
                <span>{t('strategies.recommendationsTitle')}</span>
              </header>
              <div className={styles.recommendations}>
                <p className={styles.recHint}>
                  {t('strategies.recommendationsHint')}
                </p>
                {recommendations.map((rec) => (
                  <div key={rec.level} className={styles.recItem}>
                    <div className={styles.recLeft}>
                      <Badge tone={criticalityTone[rec.level]}>
                        {t(`criticalityLevel.${rec.level}`)}
                      </Badge>
                      <span className={styles.recCount}>
                        {t('strategies.recommendationAssets', {
                          count: rec.assetCount,
                        })}
                      </span>
                    </div>
                    <ArrowRight size={16} className={styles.recArrow} />
                    <Badge tone="default">
                      {t(`strategyType.${rec.recommendedType}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'tasks' && (
          <section className={styles.pane}>
            <header className={styles.paneHeader}>
              <span>{t('strategies.tabs.tasks')}</span>
              <span className="text-xs text-muted">{tasks.length}</span>
            </header>
            <div className={styles.paneBody}>
              {tasks.length === 0 ? (
                <EmptyState title={t('strategies.tasksEmpty')} />
              ) : (
                <div className={styles.tableScroll}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>{t('strategies.columns.task')}</th>
                        <th>{t('strategies.columns.kind')}</th>
                        <th>{t('strategies.columns.strategy')}</th>
                        <th>{t('strategies.columns.interval')}</th>
                        <th>{t('strategies.columns.binding')}</th>
                        <th>{t('strategies.columns.nextDue')}</th>
                        <th aria-label="actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <span className={styles.primaryName}>{task.name}</span>
                          </td>
                          <td>
                            <Badge tone="default">
                              {t(`maintenanceTaskKind.${task.kind}`)}
                            </Badge>
                          </td>
                          <td className="text-secondary">
                            {strategyNames.get(task.strategyId) ?? '—'}
                          </td>
                          <td>{formatInterval(task.intervalDays)}</td>
                          <td className="text-secondary">{taskBinding(task)}</td>
                          <td className="text-muted">
                            {formatNextDue(task.intervalDays)}
                          </td>
                          <td className={styles.rowActions}>
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t('common.edit')}
                              aria-label={t('common.edit')}
                              onClick={() => setModal({ kind: 'task', record: task })}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t('common.delete')}
                              aria-label={t('common.delete')}
                              onClick={() => deleteTask(task)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={modal?.kind === 'strategy'}
        title={
          modal?.kind === 'strategy' && modal.record
            ? t('strategies.editStrategyTitle')
            : t('strategies.addStrategyTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'strategy' && (
          <StrategyForm
            initial={modal.record}
            onSubmit={saveStrategy}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal?.kind === 'task'}
        title={
          modal?.kind === 'task' && modal.record
            ? t('strategies.editTaskTitle')
            : t('strategies.addTaskTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal?.kind === 'task' && (
          <MaintenanceTaskForm
            initial={modal.record}
            strategies={strategies}
            assets={assets}
            classifications={classifications}
            onSubmit={saveTask}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
