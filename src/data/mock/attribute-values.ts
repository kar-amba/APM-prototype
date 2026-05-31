import type { AssetAttributeValue } from '@/model';

/** Значения атрибутов классов для отдельных активов (демо-набор). */
export const assetAttributeValueSeed: AssetAttributeValue[] = [
  // Насос Д-1250 (центробежный)
  { id: 'av-pump1-flow', assetId: 'as-pump-1', attributeId: 'ad-pump-flow', value: 1250 },
  { id: 'av-pump1-head', assetId: 'as-pump-1', attributeId: 'ad-pump-head', value: 125 },
  { id: 'av-pump1-power', assetId: 'as-pump-1', attributeId: 'ad-pump-power', value: 630 },
  // Насос Д-1250 резерв
  { id: 'av-pump2-flow', assetId: 'as-pump-2', attributeId: 'ad-pump-flow', value: 1250 },
  { id: 'av-pump2-head', assetId: 'as-pump-2', attributeId: 'ad-pump-head', value: 125 },
  // Двигатель привода дробилки
  { id: 'av-mt1-power', assetId: 'as-crusher-1-motor', attributeId: 'ad-motor-power', value: 315 },
  { id: 'av-mt1-rpm', assetId: 'as-crusher-1-motor', attributeId: 'ad-motor-rpm', value: 985 },
  { id: 'av-mt1-voltage', assetId: 'as-crusher-1-motor', attributeId: 'ad-motor-voltage', value: 6 },
  // Компрессор винтовой
  { id: 'av-comp1-pressure', assetId: 'as-comp-1', attributeId: 'ad-comp-pressure', value: 8 },
  { id: 'av-comp1-capacity', assetId: 'as-comp-1', attributeId: 'ad-comp-capacity', value: 600 },
];
