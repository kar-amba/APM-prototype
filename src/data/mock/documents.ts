import type { AppDocument } from '@/model';

/** Документы активов (паспорта, схемы, фото) — демо-набор без реальных файлов. */
export const documentSeed: AppDocument[] = [
  { id: 'doc-crusher-1-passport', assetId: 'as-crusher-1', title: 'Паспорт дробилки ЩДП-12х15', kind: 'passport' },
  { id: 'doc-crusher-1-scheme', assetId: 'as-crusher-1', title: 'Кинематическая схема дробилки', kind: 'scheme' },
  { id: 'doc-pump-1-passport', assetId: 'as-pump-1', title: 'Паспорт насоса Д-1250', kind: 'passport' },
  { id: 'doc-arc-furnace-1-manual', assetId: 'as-arc-furnace-1', title: 'Руководство по эксплуатации ДСП-50', kind: 'manual' },
  { id: 'doc-comp-2-passport', assetId: 'as-comp-2', title: 'Паспорт компрессора К-250', kind: 'passport' },
];
