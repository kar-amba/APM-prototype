import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Save } from 'lucide-react';
import type { Reading, RoundExecution, RoutePoint, ScalarValue } from '@/model';
import { Badge, Button } from '@/shared/ui';
import {
  pointsForRoute,
  rangeLabel,
  readingsForExecution,
  roundProgress,
} from '@/services/rounds';
import styles from './Rounds.module.css';

interface RoundExecutionPanelProps {
  execution: RoundExecution;
  routeName: string;
  points: RoutePoint[];
  readings: Reading[];
  unitCodes: Map<string, string>;
  assetNames: Map<string, string>;
  onSaveReading: (point: RoutePoint, value: ScalarValue) => void;
  onFinish: () => void;
}

export function RoundExecutionPanel({
  execution,
  routeName,
  points,
  readings,
  unitCodes,
  assetNames,
  onSaveReading,
  onFinish,
}: RoundExecutionPanelProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const routePoints = pointsForRoute(execution.routeId, points);
  const execReadings = readingsForExecution(execution.id, readings);
  const readingByPoint = new Map(execReadings.map((r) => [r.routePointId, r]));
  const progress = roundProgress(execution, points, readings);

  const setDraft = (pointId: string, value: string) =>
    setDrafts((prev) => ({ ...prev, [pointId]: value }));

  const handleSave = (point: RoutePoint) => {
    if (point.kind === 'checklist') {
      const raw = drafts[point.id] ?? 'true';
      onSaveReading(point, raw === 'true');
    } else {
      const raw = drafts[point.id];
      if (raw === undefined || raw === '') return;
      const value = Number(raw);
      if (Number.isNaN(value)) return;
      onSaveReading(point, value);
    }
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[point.id];
      return next;
    });
  };

  return (
    <div className={styles.execPane}>
      <div className={styles.execHeader}>
        <div className={styles.execTitle}>
          <span className={styles.execTitleName}>{routeName}</span>
          <span className={styles.execProgress}>
            {t('rounds.execution.progress', {
              recorded: progress.recorded,
              total: progress.total,
            })}
            {progress.deviations > 0 && (
              <>
                {' · '}
                <Badge tone="warning">
                  {t('rounds.execution.deviation')}: {progress.deviations}
                </Badge>
              </>
            )}
          </span>
        </div>
        <div className={styles.execActions}>
          <Badge tone="info" dot>
            {t('rounds.execution.inProgressBadge')}
          </Badge>
          <Button variant="secondary" onClick={onFinish}>
            <CheckCircle2 size={15} />
            {t('rounds.execution.finish')}
          </Button>
        </div>
      </div>

      <ul className={styles.pointList}>
        {routePoints.map((point) => {
          const reading = readingByPoint.get(point.id);
          const unitCode = point.unitId ? unitCodes.get(point.unitId) : undefined;
          const isDeviation = reading?.isDeviation ?? false;

          return (
            <li
              key={point.id}
              className={[
                styles.pointCard,
                isDeviation && styles.pointCardDeviation,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.pointMain}>
                <span className={styles.pointName}>{point.name}</span>
                <span className={styles.pointMeta}>
                  {assetNames.get(point.assetId) ?? point.assetId}
                  {point.kind === 'measurement' && (
                    <>
                      {' · '}
                      {t('rounds.range')}: {rangeLabel(point, unitCode)}
                    </>
                  )}
                </span>
              </div>

              {reading ? (
                <div className={styles.pointResult}>
                  <span className={styles.mono}>
                    {point.kind === 'checklist'
                      ? reading.value === true
                        ? t('rounds.execution.checklistOk')
                        : t('rounds.execution.checklistFail')
                      : `${reading.value}${unitCode ? ` ${unitCode}` : ''}`}
                  </span>
                  {isDeviation ? (
                    <Badge tone="warning">{t('rounds.execution.deviation')}</Badge>
                  ) : (
                    <Badge tone="success">{t('rounds.execution.recorded')}</Badge>
                  )}
                </div>
              ) : (
                <div className={styles.pointInput}>
                  {point.kind === 'checklist' ? (
                    <select
                      className="input"
                      value={drafts[point.id] ?? 'true'}
                      onChange={(e) => setDraft(point.id, e.target.value)}
                    >
                      <option value="true">
                        {t('rounds.execution.checklistOk')}
                      </option>
                      <option value="false">
                        {t('rounds.execution.checklistFail')}
                      </option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      className="input"
                      placeholder={unitCode}
                      value={drafts[point.id] ?? ''}
                      onChange={(e) => setDraft(point.id, e.target.value)}
                    />
                  )}
                  <Button size="sm" onClick={() => handleSave(point)}>
                    <Save size={14} />
                    {t('rounds.execution.save')}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className={`alert alert-info ${styles.alert}`}>
        {t('rounds.execution.deviationCreatesDefect')}
      </div>
    </div>
  );
}
