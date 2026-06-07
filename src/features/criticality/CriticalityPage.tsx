import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import type { Asset, CriticalityAssessment, Person } from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Badge, Button, EmptyState, Modal } from '@/shared/ui';
import {
  cellKey,
  criticalityLevelFromScore,
  latestAssessmentByAsset,
  riskScore,
} from '@/services/criticality';
import { assetPath, criticalityTone } from '@/features/asset-registry/lib';
import { CriticalityMatrix } from './CriticalityMatrix';
import { CriticalityForm, type CriticalityFormValues } from './CriticalityForm';
import styles from './Criticality.module.css';

interface ModalState {
  assetId?: string;
  assessment?: CriticalityAssessment;
  lockAsset: boolean;
}

type SortKey = 'name' | 'score';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('ru-RU');
}

export function CriticalityPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assessments, setAssessments] = useState<CriticalityAssessment[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  const [selectedCell, setSelectedCell] = useState<{
    consequence: number;
    probability: number;
  } | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [modal, setModal] = useState<ModalState | null>(null);

  const loadAll = useCallback(
    () =>
      Promise.all([
        repository.assets.list(),
        repository.criticalityAssessments.list(),
        repository.persons.list(),
      ]),
    [repository],
  );

  useEffect(() => {
    let active = true;
    void loadAll().then(([as, ca, pr]) => {
      if (!active) return;
      setAssets(as);
      setAssessments(ca);
      setPersons(pr);
    });
    return () => {
      active = false;
    };
  }, [loadAll, revision]);

  const latestByAsset = useMemo(
    () => latestAssessmentByAsset(assessments),
    [assessments],
  );

  const countByCell = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assessment of latestByAsset.values()) {
      const key = cellKey(assessment.consequence, assessment.probability);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [latestByAsset]);

  const rows = useMemo(() => {
    const list = assets.map((asset) => {
      const assessment = latestByAsset.get(asset.id);
      return { asset, assessment };
    });

    const filtered = selectedCell
      ? list.filter(
          ({ assessment }) =>
            assessment?.consequence === selectedCell.consequence &&
            assessment?.probability === selectedCell.probability,
        )
      : list;

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') {
        return a.asset.name.localeCompare(b.asset.name) * dir;
      }
      const sa = a.assessment?.score ?? -1;
      const sb = b.assessment?.score ?? -1;
      return (sa - sb) * dir;
    });
  }, [assets, latestByAsset, selectedCell, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className={styles.sortIndicator} />
    ) : (
      <ChevronDown size={12} className={styles.sortIndicator} />
    );
  };

  const handleSubmit = async (values: CriticalityFormValues) => {
    const score = riskScore(values.consequence, values.probability);
    const level = criticalityLevelFromScore(score);
    const assessedAt = new Date().toISOString().slice(0, 10);
    const existing = latestByAsset.get(values.assetId);

    if (existing) {
      await repository.criticalityAssessments.update(existing.id, {
        consequence: values.consequence,
        probability: values.probability,
        score,
        level,
        assessedAt,
        assessedById: values.assessedById,
      });
    } else {
      await repository.criticalityAssessments.create({
        id: `ca-${nanoid(8)}`,
        assetId: values.assetId,
        consequence: values.consequence,
        probability: values.probability,
        score,
        level,
        assessedAt,
        assessedById: values.assessedById,
      });
    }

    // Класс критичности отражается в реестре активов.
    await repository.assets.update(values.assetId, { criticality: level });

    setModal(null);
    const [as, ca] = await Promise.all([
      repository.assets.list(),
      repository.criticalityAssessments.list(),
    ]);
    setAssets(as);
    setAssessments(ca);
    bumpRevision();
  };

  const assessedCount = latestByAsset.size;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h4>{t('criticality.title')}</h4>
          <p className={styles.subtitle}>{t('criticality.subtitle')}</p>
        </div>
        <Button onClick={() => setModal({ lockAsset: false })}>
          <Plus size={15} />
          {t('criticality.assessAsset')}
        </Button>
      </div>

      <div className={styles.layout}>
        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('criticality.matrixTitle')}</span>
          </header>
          <div className={styles.paneBody}>
            <CriticalityMatrix
              countByCell={countByCell}
              selectedCell={selectedCell}
              onSelectCell={(consequence, probability) =>
                setSelectedCell((prev) =>
                  prev?.consequence === consequence &&
                  prev?.probability === probability
                    ? null
                    : { consequence, probability },
                )
              }
            />
            <p className="text-muted" style={{ marginTop: 'var(--space-3)' }}>
              {t('criticality.matrixHint')}
            </p>
          </div>
        </section>

        <section className={styles.pane}>
          <header className={styles.paneHeader}>
            <span>{t('criticality.rankingTitle')}</span>
            {selectedCell ? (
              <span className={styles.filterChip}>
                {t('criticality.filteredByCell', {
                  consequence: selectedCell.consequence,
                  probability: selectedCell.probability,
                })}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCell(null)}
                >
                  <X size={14} />
                  {t('criticality.clearCellFilter')}
                </Button>
              </span>
            ) : (
              <span className="text-muted">
                {t('criticality.assessedCount', {
                  assessed: assessedCount,
                  total: assets.length,
                })}
              </span>
            )}
          </header>
          <div className={styles.tableBody}>
            {rows.length === 0 ? (
              <EmptyState title={t('criticality.tableEmpty')} />
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th
                        className={styles.sortable}
                        onClick={() => toggleSort('name')}
                      >
                        {t('criticality.columns.asset')}
                        {sortIcon('name')}
                      </th>
                      <th>{t('criticality.columns.factual')}</th>
                      <th>{t('criticality.columns.computed')}</th>
                      <th>{t('criticality.columns.matrix')}</th>
                      <th
                        className={styles.sortable}
                        onClick={() => toggleSort('score')}
                      >
                        {t('criticality.columns.score')}
                        {sortIcon('score')}
                      </th>
                      <th>{t('criticality.columns.assessedAt')}</th>
                      <th>{t('criticality.columns.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ asset, assessment }) => (
                      <tr key={asset.id}>
                        <td>
                          <Link to={assetPath(asset.id)} className={styles.assetLink}>
                            {asset.name}
                          </Link>
                          <div className={styles.assetCode}>{asset.code}</div>
                        </td>
                        <td>
                          <Badge tone={criticalityTone[asset.criticality]}>
                            {t(`criticalityLevel.${asset.criticality}`)}
                          </Badge>
                        </td>
                        <td>
                          {assessment ? (
                            <Badge tone={criticalityTone[assessment.level]}>
                              {t(`criticalityLevel.${assessment.level}`)}
                            </Badge>
                          ) : (
                            <span className={styles.muted}>
                              {t('criticality.notAssessed')}
                            </span>
                          )}
                        </td>
                        <td className={styles.mono}>
                          {assessment
                            ? `${assessment.consequence} × ${assessment.probability}`
                            : '—'}
                        </td>
                        <td>
                          {assessment ? (
                            <span className={styles.scoreValue}>
                              {assessment.score}
                            </span>
                          ) : (
                            <span className={styles.muted}>—</span>
                          )}
                        </td>
                        <td className="text-muted">
                          {formatDate(assessment?.assessedAt)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setModal({
                                assetId: asset.id,
                                assessment,
                                lockAsset: true,
                              })
                            }
                          >
                            {assessment
                              ? t('criticality.reassess')
                              : t('criticality.assess')}
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
      </div>

      <Modal
        open={modal !== null}
        title={
          modal?.assessment
            ? t('criticality.reassess')
            : t('criticality.assessAsset')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        {modal && (
          <CriticalityForm
            assets={assets}
            persons={persons}
            initial={modal.assessment}
            defaultAssetId={modal.assetId}
            lockAsset={modal.lockAsset}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
