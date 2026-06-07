import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Asset, Reading, RoutePoint, UnitOfMeasure } from '@/model';
import { Badge } from '@/shared/ui';
import { assetRoutePoints } from '@/services/asset-related';
import { rangeLabel, readingTrend, readingsForPoint } from '@/services/rounds';
import { ReadingTrendChart } from '@/features/rounds/ReadingTrendChart';
import styles from './AssetCard.module.css';

interface AssetRoundsTabProps {
  asset: Asset;
  routePoints: RoutePoint[];
  readings: Reading[];
  units: UnitOfMeasure[];
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('ru-RU');
}

/**
 * Вкладка «Обходы и замеры» карточки актива: точки контроля актива, тренд
 * выбранной точки (Recharts) и история замеров.
 */
export function AssetRoundsTab({
  asset,
  routePoints,
  readings,
  units,
}: AssetRoundsTabProps) {
  const { t } = useTranslation();
  const unitCodes = useMemo(
    () => new Map(units.map((u) => [u.id, u.code])),
    [units],
  );

  const points = useMemo(
    () => assetRoutePoints(asset.id, routePoints),
    [asset.id, routePoints],
  );

  const measurementPoints = useMemo(
    () => points.filter((p) => p.kind === 'measurement'),
    [points],
  );

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const activePointId =
    selectedPointId ?? measurementPoints[0]?.id ?? null;
  const activePoint = points.find((p) => p.id === activePointId);

  if (points.length === 0) {
    return <p className="text-muted">{t('assetCard.roundsTab.empty')}</p>;
  }

  const trend = activePoint ? readingTrend(activePoint.id, readings) : [];
  const history = activePoint ? readingsForPoint(activePoint.id, readings) : [];
  const activeUnit = activePoint?.unitId
    ? unitCodes.get(activePoint.unitId)
    : undefined;

  return (
    <>
      <div className={styles.tabSection}>
        <div className={styles.tabSectionTitle}>
          {t('assetCard.roundsTab.pointsTitle')}
        </div>
        <div className={styles.pointChips}>
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              className={[
                styles.pointChip,
                point.id === activePointId && styles.pointChipActive,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedPointId(point.id)}
            >
              {point.name}
            </button>
          ))}
        </div>
      </div>

      {activePoint && activePoint.kind === 'measurement' && (
        <div className={styles.tabSection}>
          <div className={styles.tabSectionTitle}>
            {t('assetCard.roundsTab.trendTitle')} · {activePoint.name}
            {' · '}
            {t('assetCard.roundsTab.range')}: {rangeLabel(activePoint, activeUnit)}
          </div>
          {trend.length < 2 ? (
            <p className="text-muted">{t('assetCard.roundsTab.trendEmpty')}</p>
          ) : (
            <div className={styles.chartBox}>
              <ReadingTrendChart
                trend={trend}
                min={activePoint.min}
                max={activePoint.max}
                unitCode={activeUnit}
              />
            </div>
          )}
        </div>
      )}

      <div className={styles.tabSection}>
        <div className={styles.tabSectionTitle}>
          {t('assetCard.roundsTab.historyTitle')}
        </div>
        <table className={styles.tabTable}>
          <thead>
            <tr>
              <th>{t('assetCard.roundsTab.recordedAt')}</th>
              <th>{t('assetCard.roundsTab.value')}</th>
              <th>{t('assetCard.roundsTab.status')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((reading) => {
              const valueText =
                typeof reading.value === 'boolean'
                  ? reading.value
                    ? t('assetCard.roundsTab.normal')
                    : t('assetCard.roundsTab.deviation')
                  : `${reading.value}${activeUnit ? ` ${activeUnit}` : ''}`;
              return (
                <tr key={reading.id}>
                  <td className="text-muted">
                    {formatDateTime(reading.recordedAt)}
                  </td>
                  <td className={styles.tabMono}>{valueText}</td>
                  <td>
                    {reading.isDeviation ? (
                      <Badge tone="warning">
                        {t('assetCard.roundsTab.deviation')}
                      </Badge>
                    ) : (
                      <Badge tone="success">
                        {t('assetCard.roundsTab.normal')}
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
