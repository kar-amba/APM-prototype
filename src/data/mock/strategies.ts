import type { MaintenanceTask, Strategy } from '@/model';

/** Стратегии обслуживания (демо). */
export const strategySeed: Strategy[] = [
  { id: 'str-cbm-critical', code: 'CBM-CRIT', name: 'Обслуживание по состоянию (критичные)', type: 'condition_based', description: 'Для критичного оборудования: мониторинг вибрации и температуры, ремонт по фактическому состоянию.' },
  { id: 'str-ppr-pumps', code: 'PPR-PUMP', name: 'ППР насосного оборудования', type: 'preventive', description: 'Планово-предупредительные работы для насосов с фиксированными интервалами.' },
  { id: 'str-ppr-motors', code: 'PPR-MOTOR', name: 'ППР электродвигателей', type: 'preventive', description: 'Регламентные осмотры и обслуживание асинхронных двигателей.' },
  { id: 'str-reactive-aux', code: 'REACT-AUX', name: 'Реактивное (вспомогательное)', type: 'reactive', description: 'Эксплуатация до отказа для некритичного вспомогательного оборудования.' },
];

/** Мероприятия ТОиР с интервалами; привязаны к активу и/или классу. */
export const maintenanceTaskSeed: MaintenanceTask[] = [
  { id: 'mt-cbm-vibro', strategyId: 'str-cbm-critical', name: 'Виброконтроль подшипниковых узлов', kind: 'condition', intervalDays: 30, assetId: null, classificationId: 'cl-bearing' },
  { id: 'mt-cbm-thermo', strategyId: 'str-cbm-critical', name: 'Тепловизионный контроль', kind: 'inspection', intervalDays: 90, assetId: null, classificationId: null },
  { id: 'mt-ppr-pump-seal', strategyId: 'str-ppr-pumps', name: 'Замена торцевого уплотнения', kind: 'ppr', intervalDays: 365, assetId: null, classificationId: 'cl-pump-centrifugal' },
  { id: 'mt-ppr-pump-bearing', strategyId: 'str-ppr-pumps', name: 'Ревизия подшипников насоса', kind: 'ppr', intervalDays: 180, assetId: 'as-pump-1', classificationId: null },
  { id: 'mt-ppr-motor-insp', strategyId: 'str-ppr-motors', name: 'Осмотр и протяжка контактов', kind: 'inspection', intervalDays: 90, assetId: null, classificationId: 'cl-motor-async' },
  { id: 'mt-ppr-motor-bearing', strategyId: 'str-ppr-motors', name: 'Смазка подшипников двигателя', kind: 'ppr', intervalDays: 60, assetId: null, classificationId: 'cl-motor-async' },
];
