import type {
  CriticalityAssessment,
  Defect,
  MaintenanceTask,
  Reading,
  RoundExecution,
  RoutePoint,
} from '@/model';

/**
 * Селекторы связанных с активом сущностей — для виджетов полной карточки
 * (`AssetRelatedWidgets`). Чистые функции над уже загруженными списками; UI
 * получает данные через репозиторий, а здесь только выбирает релевантное.
 */

/** Мероприятия ТОиР, относящиеся к активу напрямую или через его класс. */
export function assetMaintenanceTasks(
  assetId: string,
  classificationId: string | undefined,
  tasks: MaintenanceTask[],
): MaintenanceTask[] {
  return tasks.filter(
    (task) =>
      task.assetId === assetId ||
      (task.assetId === null &&
        classificationId !== undefined &&
        task.classificationId === classificationId),
  );
}

/** Последняя по дате оценка критичности актива. */
export function latestCriticality(
  assetId: string,
  assessments: CriticalityAssessment[],
): CriticalityAssessment | undefined {
  return assessments
    .filter((a) => a.assetId === assetId)
    .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0];
}

/** Все дефекты актива (по дате обнаружения, новые сверху). */
export function assetDefects(assetId: string, defects: Defect[]): Defect[] {
  return defects
    .filter((d) => d.assetId === assetId)
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

/** Открытые (не устранённые и не закрытые) дефекты актива. */
export function assetOpenDefects(assetId: string, defects: Defect[]): Defect[] {
  return assetDefects(assetId, defects).filter(
    (d) => d.status !== 'resolved' && d.status !== 'closed',
  );
}

/** Точки контроля обходов, относящиеся к активу. */
export function assetRoutePoints(
  assetId: string,
  routePoints: RoutePoint[],
): RoutePoint[] {
  return routePoints.filter((p) => p.assetId === assetId);
}

/** Сводка по обходам актива: точки контроля, последний обход, отклонения. */
export interface AssetRoundsSummary {
  pointCount: number;
  routeIds: string[];
  lastRoundAt?: string;
  deviationCount: number;
}

export function assetRoundsSummary(
  assetId: string,
  routePoints: RoutePoint[],
  executions: RoundExecution[],
  readings: Reading[],
): AssetRoundsSummary {
  const points = assetRoutePoints(assetId, routePoints);
  const pointIds = new Set(points.map((p) => p.id));
  const routeIds = [...new Set(points.map((p) => p.routeId))];

  const assetReadings = readings.filter((r) => pointIds.has(r.routePointId));
  const deviationCount = assetReadings.filter((r) => r.isDeviation).length;

  const lastRoundAt = executions
    .filter((e) => routeIds.includes(e.routeId))
    .map((e) => e.finishedAt ?? e.startedAt)
    .sort((a, b) => b.localeCompare(a))[0];

  return { pointCount: points.length, routeIds, lastRoundAt, deviationCount };
}
