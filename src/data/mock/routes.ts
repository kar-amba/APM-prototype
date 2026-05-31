import type {
  Reading,
  Route,
  RoundExecution,
  RoutePoint,
} from '@/model';

/** Маршруты обхода (демо). */
export const routeSeed: Route[] = [
  { id: 'rt-energy', code: 'ОБХ-ЭНЦ-01', name: 'Обход энергетического цеха', description: 'Ежесменный обход насосной и компрессорной станций.' },
  { id: 'rt-dof', code: 'ОБХ-ДОЦ-01', name: 'Обход участка дробления', description: 'Контроль дробильно-конвейерной линии.' },
];

/** Точки контроля маршрутов (замеры с допустимыми диапазонами). */
export const routePointSeed: RoutePoint[] = [
  // Энергетический цех
  { id: 'rp-pump1-vibro', routeId: 'rt-energy', order: 1, assetId: 'as-pump-1-bearing', name: 'Виброскорость подшипника насоса Д-1250', kind: 'measurement', unitId: 'uom-mms', min: 0, max: 4.5 },
  { id: 'rp-pump1-temp', routeId: 'rt-energy', order: 2, assetId: 'as-pump-1-bearing', name: 'Температура подшипника насоса Д-1250', kind: 'measurement', unitId: 'uom-c', min: 0, max: 75 },
  { id: 'rp-comp1-pressure', routeId: 'rt-energy', order: 3, assetId: 'as-comp-1', name: 'Давление на выходе компрессора ВК-100', kind: 'measurement', unitId: 'uom-bar', min: 7, max: 9 },
  { id: 'rp-comp1-check', routeId: 'rt-energy', order: 4, assetId: 'as-comp-1', name: 'Отсутствие утечек и посторонних шумов', kind: 'checklist' },
  // Участок дробления
  { id: 'rp-crusher1-vibro', routeId: 'rt-dof', order: 1, assetId: 'as-crusher-1', name: 'Виброскорость дробилки ЩДП-12х15', kind: 'measurement', unitId: 'uom-mms', min: 0, max: 7.1 },
  { id: 'rp-crusher1-motor-temp', routeId: 'rt-dof', order: 2, assetId: 'as-crusher-1-motor', name: 'Температура двигателя привода', kind: 'measurement', unitId: 'uom-c', min: 0, max: 80 },
  { id: 'rp-conveyor1-check', routeId: 'rt-dof', order: 3, assetId: 'as-conveyor-1', name: 'Состояние ленты конвейера', kind: 'checklist' },
];

/** Выполнения обходов. */
export const roundExecutionSeed: RoundExecution[] = [
  { id: 're-energy-1', routeId: 'rt-energy', performedById: 'pr-orlov', startedAt: '2026-05-30T08:00:00', finishedAt: '2026-05-30T08:35:00', status: 'done' },
  { id: 're-dof-1', routeId: 'rt-dof', performedById: 'pr-orlov', startedAt: '2026-05-30T09:00:00', finishedAt: '2026-05-30T09:40:00', status: 'done' },
  { id: 're-energy-2', routeId: 'rt-energy', performedById: 'pr-orlov', startedAt: '2026-05-31T08:00:00', status: 'in_progress' },
];

/** Замеры по точкам (история + «сработавшие» отклонения). */
export const readingSeed: Reading[] = [
  // Обход энергоцеха №1 — норма
  { id: 'rd-e1-vibro', roundExecutionId: 're-energy-1', routePointId: 'rp-pump1-vibro', recordedAt: '2026-05-30T08:05:00', value: 3.2, isDeviation: false },
  { id: 'rd-e1-temp', roundExecutionId: 're-energy-1', routePointId: 'rp-pump1-temp', recordedAt: '2026-05-30T08:08:00', value: 58, isDeviation: false },
  { id: 'rd-e1-pressure', roundExecutionId: 're-energy-1', routePointId: 'rp-comp1-pressure', recordedAt: '2026-05-30T08:12:00', value: 8.1, isDeviation: false },
  { id: 'rd-e1-check', roundExecutionId: 're-energy-1', routePointId: 'rp-comp1-check', recordedAt: '2026-05-30T08:15:00', value: true, isDeviation: false },
  // Обход дробления №1 — отклонение по вибрации
  { id: 'rd-d1-vibro', roundExecutionId: 're-dof-1', routePointId: 'rp-crusher1-vibro', recordedAt: '2026-05-30T09:05:00', value: 8.4, isDeviation: true },
  { id: 'rd-d1-motor-temp', roundExecutionId: 're-dof-1', routePointId: 'rp-crusher1-motor-temp', recordedAt: '2026-05-30T09:08:00', value: 72, isDeviation: false },
  { id: 'rd-d1-check', roundExecutionId: 're-dof-1', routePointId: 'rp-conveyor1-check', recordedAt: '2026-05-30T09:12:00', value: false, isDeviation: true },
  // Обход энергоцеха №2 (в процессе) — отклонение по температуре
  { id: 'rd-e2-vibro', roundExecutionId: 're-energy-2', routePointId: 'rp-pump1-vibro', recordedAt: '2026-05-31T08:05:00', value: 4.1, isDeviation: false },
  { id: 'rd-e2-temp', roundExecutionId: 're-energy-2', routePointId: 'rp-pump1-temp', recordedAt: '2026-05-31T08:08:00', value: 81, isDeviation: true },
];
