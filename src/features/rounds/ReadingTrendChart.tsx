import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReadingTrendPoint } from '@/services/rounds';
import styles from './Rounds.module.css';

interface ReadingTrendChartProps {
  trend: ReadingTrendPoint[];
  /** Границы допустимого диапазона точки (для опорных линий). */
  min?: number;
  max?: number;
  unitCode?: string;
}

function shortLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : format(date, 'd MMM HH:mm', { locale: ru });
}

/**
 * Тренд числовых замеров точки контроля (Recharts). Допустимый диапазон
 * показан опорными линиями — выход за них и есть отклонение.
 */
export function ReadingTrendChart({
  trend,
  min,
  max,
  unitCode,
}: ReadingTrendChartProps) {
  const data = trend.map((point) => ({
    label: shortLabel(point.recordedAt),
    value: point.value,
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            width={44}
            unit={unitCode ? ` ${unitCode}` : undefined}
          />
          <Tooltip
            formatter={(value) =>
              unitCode ? `${value} ${unitCode}` : `${value}`
            }
          />
          {min !== undefined && (
            <ReferenceLine y={min} stroke="var(--color-warning)" strokeDasharray="4 4" />
          )}
          {max !== undefined && (
            <ReferenceLine y={max} stroke="var(--color-error)" strokeDasharray="4 4" />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
