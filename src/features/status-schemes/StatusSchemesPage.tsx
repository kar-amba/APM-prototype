import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Status, StatusScheme, Transition } from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import { Badge, Button, EmptyState, Modal } from '@/shared/ui';
import { statusesOfScheme, transitionsOfScheme } from '@/services/status-flow';
import { SchemeForm } from './SchemeForm';
import { StatusForm } from './StatusForm';
import { TransitionForm } from './TransitionForm';
import styles from './StatusSchemes.module.css';

type ModalKind =
  | 'scheme-create'
  | 'scheme-edit'
  | 'status-create'
  | 'status-edit'
  | 'transition-create'
  | null;

export function StatusSchemesPage() {
  const { t } = useTranslation();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [schemes, setSchemes] = useState<StatusScheme[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  const reload = useCallback(async () => {
    const [sch, sts, trs] = await Promise.all([
      repository.statusSchemes.list(),
      repository.statuses.list(),
      repository.transitions.list(),
    ]);
    setSchemes(sch);
    setStatuses(sts);
    setTransitions(trs);
  }, [repository]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      repository.statusSchemes.list(),
      repository.statuses.list(),
      repository.transitions.list(),
    ]).then(([sch, sts, trs]) => {
      if (!active) return;
      setSchemes(sch);
      setStatuses(sts);
      setTransitions(trs);
    });
    return () => {
      active = false;
    };
  }, [repository, revision]);

  const selectedScheme = useMemo(
    () => schemes.find((s) => s.id === selectedSchemeId),
    [schemes, selectedSchemeId],
  );
  const selectedStatus = useMemo(
    () => statuses.find((s) => s.id === selectedStatusId),
    [statuses, selectedStatusId],
  );

  const schemeStatuses = useMemo(
    () => (selectedScheme ? statusesOfScheme(selectedScheme.id, statuses) : []),
    [selectedScheme, statuses],
  );
  const schemeTransitions = useMemo(
    () =>
      selectedScheme ? transitionsOfScheme(selectedScheme.id, transitions) : [],
    [selectedScheme, transitions],
  );
  const statusName = useMemo(
    () => new Map(statuses.map((s) => [s.id, s.name])),
    [statuses],
  );

  const afterMutation = async () => {
    setModal(null);
    await reload();
    bumpRevision();
  };

  const handleCreateScheme = async (values: Omit<StatusScheme, 'id'>) => {
    const created = await repository.statusSchemes.create({
      id: `ss-${nanoid(8)}`,
      ...values,
    });
    setSelectedSchemeId(created.id);
    await afterMutation();
  };

  const handleUpdateScheme = async (values: Omit<StatusScheme, 'id'>) => {
    if (!selectedScheme) return;
    await repository.statusSchemes.update(selectedScheme.id, values);
    await afterMutation();
  };

  const handleCopyScheme = async () => {
    if (!selectedScheme) return;
    const newSchemeId = `ss-${nanoid(8)}`;
    await repository.statusSchemes.create({
      id: newSchemeId,
      code: `${selectedScheme.code}-COPY`,
      name: `${selectedScheme.name} ${t('statusSchemes.copySuffix')}`,
      entityKind: selectedScheme.entityKind,
    });
    const idMap = new Map<string, string>();
    for (const status of schemeStatuses) {
      const newId = `st-${nanoid(8)}`;
      idMap.set(status.id, newId);
      await repository.statuses.create({
        ...status,
        id: newId,
        schemeId: newSchemeId,
      });
    }
    for (const tr of schemeTransitions) {
      await repository.transitions.create({
        id: `tr-${nanoid(8)}`,
        schemeId: newSchemeId,
        fromStatusId: idMap.get(tr.fromStatusId) ?? tr.fromStatusId,
        toStatusId: idMap.get(tr.toStatusId) ?? tr.toStatusId,
      });
    }
    setSelectedSchemeId(newSchemeId);
    await afterMutation();
  };

  const handleDeleteScheme = async () => {
    if (!selectedScheme) return;
    if (!window.confirm(t('statusSchemes.deleteSchemeConfirm'))) return;
    for (const tr of schemeTransitions) {
      await repository.transitions.remove(tr.id);
    }
    for (const status of schemeStatuses) {
      await repository.statuses.remove(status.id);
    }
    await repository.statusSchemes.remove(selectedScheme.id);
    setSelectedSchemeId(null);
    await afterMutation();
  };

  const handleCreateStatus = async (
    values: Omit<Status, 'id' | 'schemeId'>,
  ) => {
    if (!selectedScheme) return;
    await repository.statuses.create({
      id: `st-${nanoid(8)}`,
      schemeId: selectedScheme.id,
      ...values,
    });
    await afterMutation();
  };

  const handleUpdateStatus = async (
    values: Omit<Status, 'id' | 'schemeId'>,
  ) => {
    if (!selectedStatus) return;
    await repository.statuses.update(selectedStatus.id, values);
    await afterMutation();
  };

  const handleDeleteStatus = async (status: Status) => {
    if (!window.confirm(t('statusSchemes.deleteStateConfirm'))) return;
    const related = schemeTransitions.filter(
      (tr) => tr.fromStatusId === status.id || tr.toStatusId === status.id,
    );
    for (const tr of related) {
      await repository.transitions.remove(tr.id);
    }
    await repository.statuses.remove(status.id);
    if (selectedStatusId === status.id) setSelectedStatusId(null);
    await afterMutation();
  };

  const validateTransition = (fromStatusId: string, toStatusId: string) => {
    if (fromStatusId === toStatusId) return t('form.toStatus');
    const exists = schemeTransitions.some(
      (tr) => tr.fromStatusId === fromStatusId && tr.toStatusId === toStatusId,
    );
    return exists ? t('statusSchemes.transitionExists') : undefined;
  };

  const handleCreateTransition = async (
    fromStatusId: string,
    toStatusId: string,
  ) => {
    if (!selectedScheme) return;
    await repository.transitions.create({
      id: `tr-${nanoid(8)}`,
      schemeId: selectedScheme.id,
      fromStatusId,
      toStatusId,
    });
    await afterMutation();
  };

  const handleDeleteTransition = async (tr: Transition) => {
    if (!window.confirm(t('statusSchemes.deleteTransitionConfirm'))) return;
    await repository.transitions.remove(tr.id);
    await afterMutation();
  };

  return (
    <div className={styles.layout}>
      <section className={styles.listPane}>
        <header className={styles.paneHeader}>
          <span>{t('statusSchemes.listTitle')}</span>
          <Button size="sm" onClick={() => setModal('scheme-create')}>
            <Plus size={15} />
            {t('statusSchemes.addScheme')}
          </Button>
        </header>
        <div className={styles.paneBody}>
          <ul className={styles.schemeList}>
            {schemes.map((scheme) => (
              <li key={scheme.id}>
                <button
                  type="button"
                  className={[
                    styles.schemeItem,
                    scheme.id === selectedSchemeId && styles.schemeItemActive,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    setSelectedSchemeId(scheme.id);
                    setSelectedStatusId(null);
                  }}
                >
                  <span className={styles.schemeName}>{scheme.name}</span>
                  <span className={styles.schemeMeta}>
                    {t(`statusEntityKind.${scheme.entityKind}`)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.editorPane}>
        {!selectedScheme ? (
          <EmptyState
            title={t('statusSchemes.selectScheme')}
            description={t('statusSchemes.selectSchemeHint')}
          />
        ) : (
          <>
            <header className={styles.editorHeader}>
              <div>
                <div className={styles.editorTitle}>{selectedScheme.name}</div>
                <div className={styles.editorSubtitle}>
                  <span className={styles.mono}>{selectedScheme.code}</span>
                  <Badge tone="accent">
                    {t(`statusEntityKind.${selectedScheme.entityKind}`)}
                  </Badge>
                </div>
              </div>
              <div className={styles.paneActions}>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.edit')}
                  aria-label={t('common.edit')}
                  onClick={() => setModal('scheme-edit')}
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('statusSchemes.copyScheme')}
                  aria-label={t('statusSchemes.copyScheme')}
                  onClick={handleCopyScheme}
                >
                  <Copy size={15} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('common.delete')}
                  aria-label={t('common.delete')}
                  onClick={handleDeleteScheme}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </header>

            <div className={styles.editorBody}>
              <div className={styles.block}>
                <div className={styles.blockHeader}>
                  <span>{t('statusSchemes.statesTitle')}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedStatusId(null);
                      setModal('status-create');
                    }}
                  >
                    <Plus size={14} />
                    {t('statusSchemes.addState')}
                  </Button>
                </div>
                {schemeStatuses.length === 0 ? (
                  <p className="text-muted">{t('statusSchemes.noStates')}</p>
                ) : (
                  <ul className={styles.stateList}>
                    {schemeStatuses.map((status) => (
                      <li key={status.id} className={styles.stateItem}>
                        <Badge tone={status.tone} dot>
                          {status.name}
                        </Badge>
                        <span className={styles.stateCode}>{status.code}</span>
                        {status.isInitial && (
                          <span className={styles.stateFlag}>
                            {t('statusSchemes.initialBadge')}
                          </span>
                        )}
                        {status.isFinal && (
                          <span className={styles.stateFlag}>
                            {t('statusSchemes.finalBadge')}
                          </span>
                        )}
                        <span className={styles.stateActions}>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={t('common.edit')}
                            aria-label={t('common.edit')}
                            onClick={() => {
                              setSelectedStatusId(status.id);
                              setModal('status-edit');
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={t('common.delete')}
                            aria-label={t('common.delete')}
                            onClick={() => handleDeleteStatus(status)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.block}>
                <div className={styles.blockHeader}>
                  <span>{t('statusSchemes.transitionsTitle')}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={schemeStatuses.length < 2}
                    onClick={() => setModal('transition-create')}
                  >
                    <Plus size={14} />
                    {t('statusSchemes.addTransition')}
                  </Button>
                </div>
                {schemeStatuses.length < 2 ? (
                  <p className="text-muted">
                    {t('statusSchemes.needTwoStates')}
                  </p>
                ) : schemeTransitions.length === 0 ? (
                  <p className="text-muted">
                    {t('statusSchemes.noTransitions')}
                  </p>
                ) : (
                  <ul className={styles.transitionList}>
                    {schemeTransitions.map((tr) => (
                      <li key={tr.id} className={styles.transitionItem}>
                        <span>{statusName.get(tr.fromStatusId)}</span>
                        <span className={styles.arrow}>→</span>
                        <span>{statusName.get(tr.toStatusId)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                          onClick={() => handleDeleteTransition(tr)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        open={modal === 'scheme-create' || modal === 'scheme-edit'}
        title={
          modal === 'scheme-edit'
            ? t('statusSchemes.editSchemeTitle')
            : t('statusSchemes.addSchemeTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        <SchemeForm
          initial={modal === 'scheme-edit' ? selectedScheme : undefined}
          onSubmit={
            modal === 'scheme-edit' ? handleUpdateScheme : handleCreateScheme
          }
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal === 'status-create' || modal === 'status-edit'}
        title={
          modal === 'status-edit'
            ? t('statusSchemes.editStateTitle')
            : t('statusSchemes.addStateTitle')
        }
        onClose={() => setModal(null)}
        size="md"
      >
        <StatusForm
          initial={modal === 'status-edit' ? selectedStatus : undefined}
          onSubmit={
            modal === 'status-edit' ? handleUpdateStatus : handleCreateStatus
          }
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal === 'transition-create'}
        title={t('statusSchemes.addTransitionTitle')}
        onClose={() => setModal(null)}
        size="md"
      >
        <TransitionForm
          statuses={schemeStatuses}
          validate={validateTransition}
          onSubmit={handleCreateTransition}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
