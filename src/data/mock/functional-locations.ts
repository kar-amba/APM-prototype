import type { FunctionalLocation } from '@/model';

/**
 * Иерархия функциональных мест демо-предприятия «ГлоуБайт-Металл»:
 * Предприятие → Цех → Участок → Технологическая позиция.
 */
export const functionalLocationSeed: FunctionalLocation[] = [
  { id: 'fl-gbm', code: 'ГБМ', name: 'ГлоуБайт-Металл', level: 'enterprise', parentId: null },

  // --- Дробильно-обогатительный цех ---
  { id: 'fl-dof', code: 'ДОЦ', name: 'Дробильно-обогатительный цех', level: 'shop', parentId: 'fl-gbm' },
  { id: 'fl-dof-crush', code: 'ДОЦ-ДРБ', name: 'Участок дробления', level: 'area', parentId: 'fl-dof' },
  { id: 'fl-dof-crush-l1', code: 'ДОЦ-ДРБ-Л1', name: 'Линия дробления №1', level: 'position', parentId: 'fl-dof-crush' },
  { id: 'fl-dof-crush-l2', code: 'ДОЦ-ДРБ-Л2', name: 'Линия дробления №2', level: 'position', parentId: 'fl-dof-crush' },
  { id: 'fl-dof-flot', code: 'ДОЦ-ФЛТ', name: 'Участок флотации', level: 'area', parentId: 'fl-dof' },

  // --- Плавильно-печной цех ---
  { id: 'fl-smelt', code: 'ППЦ', name: 'Плавильно-печной цех', level: 'shop', parentId: 'fl-gbm' },
  { id: 'fl-smelt-melt', code: 'ППЦ-ПЛВ', name: 'Участок плавки', level: 'area', parentId: 'fl-smelt' },
  { id: 'fl-smelt-heat', code: 'ППЦ-НГР', name: 'Участок нагрева', level: 'area', parentId: 'fl-smelt' },

  // --- Прокатный цех ---
  { id: 'fl-roll', code: 'ПРЦ', name: 'Прокатный цех', level: 'shop', parentId: 'fl-gbm' },
  { id: 'fl-roll-mill', code: 'ПРЦ-СТН', name: 'Прокатный стан', level: 'area', parentId: 'fl-roll' },
  { id: 'fl-roll-finish', code: 'ПРЦ-ОТД', name: 'Участок отделки', level: 'area', parentId: 'fl-roll' },

  // --- Энергетический цех ---
  { id: 'fl-energy', code: 'ЭНЦ', name: 'Энергетический цех', level: 'shop', parentId: 'fl-gbm' },
  { id: 'fl-energy-pump', code: 'ЭНЦ-НС', name: 'Насосная станция', level: 'area', parentId: 'fl-energy' },
  { id: 'fl-energy-comp', code: 'ЭНЦ-КС', name: 'Компрессорная станция', level: 'area', parentId: 'fl-energy' },
];
