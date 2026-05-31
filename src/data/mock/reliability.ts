import type { Defect, Notification } from '@/model';

/** Дефекты (часть порождена отклонениями на обходах). */
export const defectSeed: Defect[] = [
  { id: 'df-pump-flot-1', assetId: 'as-pump-flot-1', title: 'Отказ пульпового насоса ГрАТ-225', description: 'Останов по сигналу защиты, повышенная вибрация и течь по сальнику.', source: 'manual', severity: 'high', status: 'in_progress', detectedAt: '2026-05-28T14:20:00', readingId: null },
  { id: 'df-crusher-1-vibro', assetId: 'as-crusher-1', title: 'Превышение вибрации дробилки ЩДП-12х15', description: 'Виброскорость 8.4 мм/с при норме до 7.1 мм/с.', source: 'round', severity: 'high', status: 'open', detectedAt: '2026-05-30T09:05:00', readingId: 'rd-d1-vibro' },
  { id: 'df-conveyor-1-belt', assetId: 'as-conveyor-1', title: 'Повреждение ленты конвейера КЛ-800', description: 'Выявлен продольный порез ленты при осмотре на обходе.', source: 'round', severity: 'medium', status: 'open', detectedAt: '2026-05-30T09:12:00', readingId: 'rd-d1-check' },
  { id: 'df-pump-1-temp', assetId: 'as-pump-1-bearing', title: 'Перегрев подшипника насоса Д-1250', description: 'Температура подшипника 81 °C при норме до 75 °C.', source: 'round', severity: 'medium', status: 'open', detectedAt: '2026-05-31T08:08:00', readingId: 'rd-e2-temp' },
];

/** Уведомления (отражаются в оболочке и на дашборде). */
export const notificationSeed: Notification[] = [
  { id: 'nt-crusher-1-vibro', defectId: 'df-crusher-1-vibro', assetId: 'as-crusher-1', message: 'Отклонение по вибрации на дробилке ЩДП-12х15', createdAt: '2026-05-30T09:05:00', read: false },
  { id: 'nt-conveyor-1-belt', defectId: 'df-conveyor-1-belt', assetId: 'as-conveyor-1', message: 'Повреждение ленты конвейера КЛ-800', createdAt: '2026-05-30T09:12:00', read: false },
  { id: 'nt-pump-1-temp', defectId: 'df-pump-1-temp', assetId: 'as-pump-1-bearing', message: 'Перегрев подшипника насоса Д-1250', createdAt: '2026-05-31T08:08:00', read: false },
];
