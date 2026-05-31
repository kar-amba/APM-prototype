import type { AttributeDefinition, Classification } from '@/model';

/**
 * Классификатор оборудования (дерево классов). Корневые классы → подклассы.
 * Связан с активами через `Asset.classificationId`; атрибуты класса —
 * в `attributeDefinitionSeed`.
 */
export const classificationSeed: Classification[] = [
  // Насосы
  { id: 'cl-pump', code: 'PUMP', name: 'Насос', parentId: null },
  { id: 'cl-pump-centrifugal', code: 'PUMP-CF', name: 'Центробежный', parentId: 'cl-pump' },
  { id: 'cl-pump-slurry', code: 'PUMP-SL', name: 'Грунтовый', parentId: 'cl-pump' },
  // Двигатели
  { id: 'cl-motor', code: 'MOTOR', name: 'Двигатель', parentId: null },
  { id: 'cl-motor-async', code: 'MOTOR-AS', name: 'Асинхронный', parentId: 'cl-motor' },
  // Дробилки
  { id: 'cl-crusher', code: 'CRUSH', name: 'Дробилка', parentId: null },
  { id: 'cl-crusher-jaw', code: 'CRUSH-JAW', name: 'Щековая', parentId: 'cl-crusher' },
  { id: 'cl-crusher-cone', code: 'CRUSH-CONE', name: 'Конусная', parentId: 'cl-crusher' },
  // Конвейеры, грохоты, мельницы, флотомашины
  { id: 'cl-conveyor', code: 'CONV', name: 'Конвейер', parentId: null },
  { id: 'cl-screen', code: 'SCREEN', name: 'Грохот', parentId: null },
  { id: 'cl-mill', code: 'MILL', name: 'Мельница', parentId: null },
  { id: 'cl-flotation', code: 'FLOT', name: 'Флотомашина', parentId: null },
  // Компрессоры
  { id: 'cl-compressor', code: 'COMP', name: 'Компрессор', parentId: null },
  { id: 'cl-compressor-screw', code: 'COMP-SC', name: 'Винтовой', parentId: 'cl-compressor' },
  { id: 'cl-compressor-centrifugal', code: 'COMP-CF', name: 'Центробежный', parentId: 'cl-compressor' },
  // Печи, прокат, прочее
  { id: 'cl-furnace', code: 'FURN', name: 'Печь', parentId: null },
  { id: 'cl-furnace-arc', code: 'FURN-ARC', name: 'Дуговая', parentId: 'cl-furnace' },
  { id: 'cl-furnace-heat', code: 'FURN-HT', name: 'Нагревательная', parentId: 'cl-furnace' },
  { id: 'cl-rollstand', code: 'ROLL', name: 'Прокатная клеть', parentId: null },
  { id: 'cl-fan', code: 'FAN', name: 'Вентилятор', parentId: null },
  { id: 'cl-heatexchanger', code: 'HX', name: 'Теплообменник', parentId: null },
  { id: 'cl-bearing', code: 'BRG', name: 'Узел подшипниковый', parentId: null },
  { id: 'cl-crane', code: 'CRANE', name: 'Кран мостовой', parentId: null },
];

/** Определения атрибутов классов (подтягиваются в карточку актива по классу). */
export const attributeDefinitionSeed: AttributeDefinition[] = [
  // Насос центробежный
  { id: 'ad-pump-flow', classificationId: 'cl-pump-centrifugal', code: 'flow', name: 'Подача', valueType: 'number', unitId: 'uom-m3h', min: 0, max: 5000 },
  { id: 'ad-pump-head', classificationId: 'cl-pump-centrifugal', code: 'head', name: 'Напор', valueType: 'number', unitId: 'uom-m', min: 0, max: 400 },
  { id: 'ad-pump-power', classificationId: 'cl-pump-centrifugal', code: 'power', name: 'Мощность', valueType: 'number', unitId: 'uom-kw', min: 0, max: 5000 },
  // Двигатель асинхронный
  { id: 'ad-motor-power', classificationId: 'cl-motor-async', code: 'power', name: 'Мощность', valueType: 'number', unitId: 'uom-kw', min: 0, max: 10000 },
  { id: 'ad-motor-rpm', classificationId: 'cl-motor-async', code: 'rpm', name: 'Частота вращения', valueType: 'number', unitId: 'uom-rpm', min: 0, max: 6000 },
  { id: 'ad-motor-voltage', classificationId: 'cl-motor-async', code: 'voltage', name: 'Напряжение', valueType: 'number', unitId: 'uom-kv', min: 0, max: 10 },
  // Компрессор винтовой
  { id: 'ad-comp-pressure', classificationId: 'cl-compressor-screw', code: 'pressure', name: 'Рабочее давление', valueType: 'number', unitId: 'uom-bar', min: 0, max: 40 },
  { id: 'ad-comp-capacity', classificationId: 'cl-compressor-screw', code: 'capacity', name: 'Производительность', valueType: 'number', unitId: 'uom-m3h', min: 0, max: 10000 },
];
