import type { Manufacturer, OrgUnit, Person, UnitOfMeasure } from '@/model';

/** Единицы измерения для атрибутов классов и точек контроля обходов. */
export const unitOfMeasureSeed: UnitOfMeasure[] = [
  { id: 'uom-mms', code: 'мм/с', name: 'Виброскорость (мм/с)' },
  { id: 'uom-c', code: '°C', name: 'Температура (°C)' },
  { id: 'uom-bar', code: 'бар', name: 'Давление (бар)' },
  { id: 'uom-a', code: 'А', name: 'Ток (А)' },
  { id: 'uom-rpm', code: 'об/мин', name: 'Частота вращения (об/мин)' },
  { id: 'uom-m3h', code: 'м³/ч', name: 'Подача (м³/ч)' },
  { id: 'uom-m', code: 'м', name: 'Напор (м)' },
  { id: 'uom-kw', code: 'кВт', name: 'Мощность (кВт)' },
  { id: 'uom-kv', code: 'кВ', name: 'Напряжение (кВ)' },
  { id: 'uom-pct', code: '%', name: 'Процент (%)' },
];

/** Производители оборудования. */
export const manufacturerSeed: Manufacturer[] = [
  { id: 'mf-uralmash', name: 'Уралмаш', country: 'Россия' },
  { id: 'mf-eldin', name: 'ЭЛДИН', country: 'Россия' },
  { id: 'mf-konveyer', name: 'Конвейер-Маш', country: 'Россия' },
  { id: 'mf-vibrotehnik', name: 'Вибротехник', country: 'Россия' },
  { id: 'mf-mehanobr', name: 'Механобр', country: 'Россия' },
  { id: 'mf-gms', name: 'ГМС Ливгидромаш', country: 'Россия' },
  { id: 'mf-skf', name: 'SKF', country: 'Швеция' },
  { id: 'mf-remeza', name: 'Remeza', country: 'Беларусь' },
  { id: 'mf-kkm', name: 'Казанькомпрессормаш', country: 'Россия' },
  { id: 'mf-bugulma', name: 'Бугульма-Энерго', country: 'Россия' },
  { id: 'mf-ventprom', name: 'Вентпром', country: 'Россия' },
  { id: 'mf-sms', name: 'SMS group', country: 'Германия' },
  { id: 'mf-danieli', name: 'Danieli', country: 'Италия' },
  { id: 'mf-sibelektro', name: 'Сибэлектротерм', country: 'Россия' },
];

/** Организационная структура (цеха/участки) — оргизмерение предприятия. */
export const orgUnitSeed: OrgUnit[] = [
  { id: 'org-dof', code: 'ДОЦ', name: 'Дробильно-обогатительный цех', kind: 'shop', parentId: null },
  { id: 'org-smelt', code: 'ППЦ', name: 'Плавильно-печной цех', kind: 'shop', parentId: null },
  { id: 'org-roll', code: 'ПРЦ', name: 'Прокатный цех', kind: 'shop', parentId: null },
  { id: 'org-energy', code: 'ЭНЦ', name: 'Энергетический цех', kind: 'shop', parentId: null },
  { id: 'org-dof-crush', code: 'ДОЦ-ДРБ', name: 'Участок дробления', kind: 'area', parentId: 'org-dof' },
  { id: 'org-dof-flot', code: 'ДОЦ-ФЛТ', name: 'Участок флотации', kind: 'area', parentId: 'org-dof' },
  { id: 'org-energy-pump', code: 'ЭНЦ-НС', name: 'Насосная станция', kind: 'area', parentId: 'org-energy' },
  { id: 'org-energy-comp', code: 'ЭНЦ-КС', name: 'Компрессорная станция', kind: 'area', parentId: 'org-energy' },
];

/** Персонал: владельцы, планировщики, исполнители обходов. */
export const personSeed: Person[] = [
  { id: 'pr-ivanov', name: 'Иванов А. С.', position: 'Планировщик ТОиР', orgUnitId: 'org-dof' },
  { id: 'pr-petrova', name: 'Петрова Е. В.', position: 'Планировщик ТОиР', orgUnitId: 'org-dof' },
  { id: 'pr-sidorov', name: 'Сидоров К. П.', position: 'Планировщик ТОиР', orgUnitId: 'org-energy' },
  { id: 'pr-kuznetsov', name: 'Кузнецов И. Д.', position: 'Инженер по надёжности', orgUnitId: 'org-smelt' },
  { id: 'pr-orlov', name: 'Орлов М. Н.', position: 'Оператор', orgUnitId: 'org-energy' },
  { id: 'pr-fedotova', name: 'Федотова Л. А.', position: 'Планировщик ТОиР', orgUnitId: 'org-roll' },
];
