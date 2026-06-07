import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DefectsByDay } from '@/services/dashboard';
import styles from './Dashboard.module.css';

interface DefectsTrendChartProps {
  data: DefectsByDay[];
}

function shortLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, 'd MMM', { locale: ru });
}

/**
 * Тренд новых дефектов по дням (Recharts AreaChart). Питается дефектами обходов
 * и симулятора телеметрии — обновляется по мере поступления «живых» данных.
 */
export function DefectsTrendChart({ data }: DefectsTrendChartProps) {
  const { t } = useTranslation();
  const chartData = data.map((point) => ({
    label: shortLabel(point.date),
    count: point.count,
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 4, left: -16 }}
        >
          <defs>
            <linearGradient id="defectsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            width={36}
          />
          <Tooltip
            formatter={(value) => [`${value}`, t('dashboard.charts.defectsTooltip')]}
            labelStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#defectsGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
