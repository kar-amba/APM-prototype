import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { CriticalityLevel } from '@/model';
import {
  CRITICALITY_SCALE,
  cellKey,
  criticalityLevelFromCell,
  riskScore,
} from '@/services/criticality';
import styles from './Criticality.module.css';

const zoneClass: Record<CriticalityLevel, string> = {
  low: styles.zoneLow,
  medium: styles.zoneMedium,
  high: styles.zoneHigh,
  critical: styles.zoneCritical,
};

interface CriticalityMatrixProps {
  /** Число активов в каждой ячейке (ключ — `cellKey`). */
  countByCell: Map<string, number>;
  selectedCell: { consequence: number; probability: number } | null;
  onSelectCell: (consequence: number, probability: number) => void;
}

/**
 * Интерактивная матрица критичности 5×5 (последствия × вероятность). Строки —
 * последствия (сверху 5 — катастрофические), столбцы — вероятность. Цвет ячейки
 * = зона риска (`criticalityLevelFromCell`), число — сколько активов попало в неё.
 */
export function CriticalityMatrix({
  countByCell,
  selectedCell,
  onSelectCell,
}: CriticalityMatrixProps) {
  const { t } = useTranslation();
  const consequences = [...CRITICALITY_SCALE].reverse(); // 5 → 1 (сверху вниз)

  return (
    <div className={styles.matrixWrap}>
      <div className={styles.matrixGrid}>
        <div
          className={styles.axisY}
          style={{ gridColumn: 1, gridRow: '1 / span 5' }}
        >
          {t('criticality.axisConsequence')}
        </div>

        {consequences.map((consequence, rowIdx) => (
          <div
            key={`ty-${consequence}`}
            className={styles.tickY}
            style={{ gridColumn: 2, gridRow: rowIdx + 1 }}
            title={t(`criticality.consequenceScale.${consequence}`)}
          >
            {consequence}
          </div>
        ))}

        {consequences.map((consequence, rowIdx) =>
          CRITICALITY_SCALE.map((probability) => {
            const level = criticalityLevelFromCell(consequence, probability);
            const count = countByCell.get(cellKey(consequence, probability)) ?? 0;
            const isActive =
              selectedCell?.consequence === consequence &&
              selectedCell?.probability === probability;
            const cellStyle: CSSProperties = {
              gridColumn: 2 + probability,
              gridRow: rowIdx + 1,
            };
            return (
              <button
                key={cellKey(consequence, probability)}
                type="button"
                className={[
                  styles.cell,
                  zoneClass[level],
                  isActive && styles.cellActive,
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={cellStyle}
                onClick={() => onSelectCell(consequence, probability)}
                title={t('criticality.cellAssetsTitle', {
                  consequence,
                  probability,
                  count,
                })}
                aria-pressed={isActive}
              >
                <span className={styles.cellScore}>
                  {riskScore(consequence, probability)}
                </span>
                <span
                  className={[
                    styles.cellCount,
                    count === 0 && styles.cellCountEmpty,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {count}
                </span>
              </button>
            );
          }),
        )}

        {CRITICALITY_SCALE.map((probability) => (
          <div
            key={`tx-${probability}`}
            className={styles.tickX}
            style={{ gridColumn: 2 + probability, gridRow: 6 }}
            title={t(`criticality.probabilityScale.${probability}`)}
          >
            {probability}
          </div>
        ))}

        <div className={styles.axisX} style={{ gridColumn: '3 / span 5', gridRow: 7 }}>
          {t('criticality.axisProbability')}
        </div>
      </div>

      <div className={styles.legend}>
        {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
          <span key={level} className={styles.legendItem}>
            <span
              className={[styles.legendSwatch, zoneClass[level]].join(' ')}
            />
            {t(`criticalityLevel.${level}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
