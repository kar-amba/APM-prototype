import type { CriticalityAssessment } from '@/model';

/** Оценки критичности (последствия × вероятность) для ключевого оборудования. */
export const criticalityAssessmentSeed: CriticalityAssessment[] = [
  { id: 'ca-crusher-1', assetId: 'as-crusher-1', consequence: 5, probability: 4, score: 20, level: 'critical', assessedAt: '2025-11-10', assessedById: 'pr-kuznetsov' },
  { id: 'ca-crusher-2', assetId: 'as-crusher-2', consequence: 5, probability: 3, score: 15, level: 'critical', assessedAt: '2025-11-10', assessedById: 'pr-kuznetsov' },
  { id: 'ca-mill-1', assetId: 'as-mill-1', consequence: 5, probability: 4, score: 20, level: 'critical', assessedAt: '2025-11-12', assessedById: 'pr-kuznetsov' },
  { id: 'ca-arc-furnace-1', assetId: 'as-arc-furnace-1', consequence: 5, probability: 5, score: 25, level: 'critical', assessedAt: '2025-10-30', assessedById: 'pr-kuznetsov' },
  { id: 'ca-rollstand-1', assetId: 'as-rollstand-1', consequence: 4, probability: 4, score: 16, level: 'critical', assessedAt: '2025-11-01', assessedById: 'pr-kuznetsov' },
  { id: 'ca-comp-2', assetId: 'as-comp-2', consequence: 4, probability: 4, score: 16, level: 'critical', assessedAt: '2025-11-05', assessedById: 'pr-kuznetsov' },
  { id: 'ca-pump-1', assetId: 'as-pump-1', consequence: 3, probability: 3, score: 9, level: 'high', assessedAt: '2025-11-06', assessedById: 'pr-kuznetsov' },
  { id: 'ca-pump-flot-1', assetId: 'as-pump-flot-1', consequence: 3, probability: 4, score: 12, level: 'high', assessedAt: '2025-11-07', assessedById: 'pr-kuznetsov' },
  { id: 'ca-conveyor-1', assetId: 'as-conveyor-1', consequence: 3, probability: 3, score: 9, level: 'high', assessedAt: '2025-11-08', assessedById: 'pr-kuznetsov' },
  { id: 'ca-screen-1', assetId: 'as-screen-1', consequence: 2, probability: 3, score: 6, level: 'medium', assessedAt: '2025-11-09', assessedById: 'pr-kuznetsov' },
  { id: 'ca-fan-1', assetId: 'as-fan-1', consequence: 2, probability: 2, score: 4, level: 'low', assessedAt: '2025-11-09', assessedById: 'pr-kuznetsov' },
];
