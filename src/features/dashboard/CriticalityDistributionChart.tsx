import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CriticalityLevel } from '@/model';
import type { CriticalityBucket } from '@/services/dashboard';
import styles from './Dashboard.module.css';

interface CriticalityDistributionChartProps {
  data: CriticalityBucket[];
}

/** Цвет столбца по классу критичности — на семантических токенах брендбука. */
const levelColor: Record<CriticalityLevel, string> = {
  low: 'var(--color-success)',
  medium: 'var(--color-info)',
  high: 'var(--color-warning)',
  critical: 'var(--color-error)',
};

/** Распределение активов по классам критичности (Recharts BarChart). */
export function CriticalityDistributionChart({
  data,
}: CriticalityDistributionChartProps) {
  const { t } = useTranslation();
  const chartData = data.map((bucket) => ({
    level: bucket.level,
    label: t(`criticalityLevel.${bucket.level}`),
    count: bucket.count,
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 4, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickMargin={8}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            width={36}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-bg-subtle)' }}
            formatter={(value) => [`${value}`, t('dashboard.charts.assetsTooltip')]}
            labelStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell key={entry.level} fill={levelColor[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
