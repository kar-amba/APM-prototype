import type { Asset } from '@/model';

/**
 * Парк оборудования демо-предприятия с узлами и компонентами. Представительный
 * срез по всем цехам; `classificationId` связывает актив с классификатором.
 *
 * Ссылки на справочники: `statusId` — состояние схемы `ss-asset`; `ownerId` —
 * подразделение-владелец (`OrgUnit`); `plannerId` — планировщик (`Person`).
 */
export const assetSeed: Asset[] = [
  // ====== Дробильно-обогатительный цех ======
  // --- Участок дробления / Линия №1 ---
  {
    id: 'as-crusher-1', code: 'ДРБ-001', name: 'Дробилка щековая ЩДП-12х15',
    classification: 'Дробилка / Щековая', classificationId: 'cl-crusher-jaw',
    functionalLocationId: 'fl-dof-crush-l1', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'critical',
    manufacturer: 'Уралмаш', modelName: 'ЩДП-12х15', serialNumber: 'SN-CR-0012',
    inventoryNumber: 'INV-100012', commissionedAt: '2018-06-12', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  {
    id: 'as-crusher-1-motor', code: 'ДРБ-001-ДВ', name: 'Электродвигатель привода дробилки',
    classification: 'Двигатель / Асинхронный', classificationId: 'cl-motor-async',
    functionalLocationId: 'fl-dof-crush-l1', parentAssetId: 'as-crusher-1',
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'ЭЛДИН', modelName: 'АИР-355', serialNumber: 'SN-MT-3551',
    inventoryNumber: 'INV-100013', commissionedAt: '2018-06-12', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  {
    id: 'as-conveyor-1', code: 'КНВ-001', name: 'Конвейер ленточный КЛ-800',
    classification: 'Конвейер / Ленточный', classificationId: 'cl-conveyor',
    functionalLocationId: 'fl-dof-crush-l1', parentAssetId: null,
    statusId: 'st-asset-maint', criticality: 'high',
    manufacturer: 'Конвейер-Маш', modelName: 'КЛ-800', serialNumber: 'SN-CV-0801',
    inventoryNumber: 'INV-100020', commissionedAt: '2019-03-01', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  {
    id: 'as-screen-1', code: 'ГРХ-001', name: 'Грохот вибрационный ГИТ-51',
    classification: 'Грохот / Вибрационный', classificationId: 'cl-screen',
    functionalLocationId: 'fl-dof-crush', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'Вибротехник', modelName: 'ГИТ-51', serialNumber: 'SN-SC-0510',
    inventoryNumber: 'INV-100025', commissionedAt: '2020-09-15', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  // --- Участок дробления / Линия №2 ---
  {
    id: 'as-crusher-2', code: 'ДРБ-002', name: 'Дробилка конусная КСД-2200',
    classification: 'Дробилка / Конусная', classificationId: 'cl-crusher-cone',
    functionalLocationId: 'fl-dof-crush-l2', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'critical',
    manufacturer: 'Уралмаш', modelName: 'КСД-2200', serialNumber: 'SN-CR-2200',
    inventoryNumber: 'INV-100070', commissionedAt: '2019-07-01', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  {
    id: 'as-crusher-2-motor', code: 'ДРБ-002-ДВ', name: 'Электродвигатель конусной дробилки',
    classification: 'Двигатель / Асинхронный', classificationId: 'cl-motor-async',
    functionalLocationId: 'fl-dof-crush-l2', parentAssetId: 'as-crusher-2',
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'ЭЛДИН', modelName: 'АИР-400', serialNumber: 'SN-MT-4001',
    inventoryNumber: 'INV-100071', commissionedAt: '2019-07-01', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },
  {
    id: 'as-conveyor-2', code: 'КНВ-002', name: 'Конвейер ленточный КЛ-1000',
    classification: 'Конвейер / Ленточный', classificationId: 'cl-conveyor',
    functionalLocationId: 'fl-dof-crush-l2', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'Конвейер-Маш', modelName: 'КЛ-1000', serialNumber: 'SN-CV-1001',
    inventoryNumber: 'INV-100072', commissionedAt: '2019-07-01', ownerId: 'org-dof', plannerId: 'pr-ivanov',
  },

  // --- Участок флотации ---
  {
    id: 'as-mill-1', code: 'МЛН-001', name: 'Мельница шаровая МШЦ-3600',
    classification: 'Мельница / Шаровая', classificationId: 'cl-mill',
    functionalLocationId: 'fl-dof-flot', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'critical',
    manufacturer: 'Уралмаш', modelName: 'МШЦ-3600х5500', serialNumber: 'SN-ML-3600',
    inventoryNumber: 'INV-100030', commissionedAt: '2017-11-20', ownerId: 'org-dof', plannerId: 'pr-petrova',
  },
  {
    id: 'as-mill-1-bearing', code: 'МЛН-001-ПДШ', name: 'Узел подшипниковый мельницы',
    classification: 'Узел / Подшипниковый', classificationId: 'cl-bearing',
    functionalLocationId: 'fl-dof-flot', parentAssetId: 'as-mill-1',
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'SKF', modelName: 'SNL-3180', serialNumber: 'SN-BR-3180',
    inventoryNumber: 'INV-100031', commissionedAt: '2017-11-20', ownerId: 'org-dof', plannerId: 'pr-petrova',
  },
  {
    id: 'as-flot-1', code: 'ФЛТ-001', name: 'Флотомашина РИФ-8.5',
    classification: 'Флотомашина / Пневмомеханическая', classificationId: 'cl-flotation',
    functionalLocationId: 'fl-dof-flot', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'Механобр', modelName: 'РИФ-8.5', serialNumber: 'SN-FL-0085',
    inventoryNumber: 'INV-100035', commissionedAt: '2021-05-10', ownerId: 'org-dof', plannerId: 'pr-petrova',
  },
  {
    id: 'as-flot-2', code: 'ФЛТ-002', name: 'Флотомашина РИФ-8.5 (секция 2)',
    classification: 'Флотомашина / Пневмомеханическая', classificationId: 'cl-flotation',
    functionalLocationId: 'fl-dof-flot', parentAssetId: null,
    statusId: 'st-asset-standby', criticality: 'medium',
    manufacturer: 'Механобр', modelName: 'РИФ-8.5', serialNumber: 'SN-FL-0086',
    inventoryNumber: 'INV-100036', commissionedAt: '2021-05-10', ownerId: 'org-dof', plannerId: 'pr-petrova',
  },
  {
    id: 'as-pump-flot-1', code: 'НАС-010', name: 'Насос пульповый ГрАТ-225',
    classification: 'Насос / Грунтовый', classificationId: 'cl-pump-slurry',
    functionalLocationId: 'fl-dof-flot', parentAssetId: null,
    statusId: 'st-asset-fault', criticality: 'high',
    manufacturer: 'ГМС Ливгидромаш', modelName: 'ГрАТ-225', serialNumber: 'SN-PP-2250',
    inventoryNumber: 'INV-100040', commissionedAt: '2019-08-22', ownerId: 'org-dof', plannerId: 'pr-petrova',
  },

  // ====== Плавильно-печной цех ======
  {
    id: 'as-arc-furnace-1', code: 'ДСП-001', name: 'Дуговая сталеплавильная печь ДСП-50',
    classification: 'Печь / Дуговая', classificationId: 'cl-furnace-arc',
    functionalLocationId: 'fl-smelt-melt', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'critical',
    manufacturer: 'Сибэлектротерм', modelName: 'ДСП-50', serialNumber: 'SN-EAF-0050',
    inventoryNumber: 'INV-200010', commissionedAt: '2016-02-01', ownerId: 'org-smelt', plannerId: 'pr-kuznetsov',
  },
  {
    id: 'as-arc-furnace-1-trafo', code: 'ДСП-001-ТР', name: 'Печной трансформатор ЭТЦН-32000',
    classification: 'Трансформатор / Печной', classificationId: undefined,
    functionalLocationId: 'fl-smelt-melt', parentAssetId: 'as-arc-furnace-1',
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'Сибэлектротерм', modelName: 'ЭТЦН-32000', serialNumber: 'SN-TR-3200',
    inventoryNumber: 'INV-200011', commissionedAt: '2016-02-01', ownerId: 'org-smelt', plannerId: 'pr-kuznetsov',
  },
  {
    id: 'as-crane-1', code: 'КРН-001', name: 'Кран мостовой литейный 80/20т',
    classification: 'Кран / Мостовой', classificationId: 'cl-crane',
    functionalLocationId: 'fl-smelt-melt', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'Уралмаш', modelName: 'КМЛ-80/20', serialNumber: 'SN-CRN-0080',
    inventoryNumber: 'INV-200015', commissionedAt: '2015-05-20', ownerId: 'org-smelt', plannerId: 'pr-kuznetsov',
  },
  {
    id: 'as-heat-furnace-1', code: 'ПЕЧ-010', name: 'Печь нагревательная методическая',
    classification: 'Печь / Нагревательная', classificationId: 'cl-furnace-heat',
    functionalLocationId: 'fl-smelt-heat', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'Сибэлектротерм', modelName: 'ПНМ-100', serialNumber: 'SN-FH-0100',
    inventoryNumber: 'INV-200020', commissionedAt: '2017-09-10', ownerId: 'org-smelt', plannerId: 'pr-kuznetsov',
  },
  {
    id: 'as-heat-fan-1', code: 'ВНТ-010', name: 'Дымосос нагревательной печи',
    classification: 'Вентилятор / Дымосос', classificationId: 'cl-fan',
    functionalLocationId: 'fl-smelt-heat', parentAssetId: 'as-heat-furnace-1',
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'Вентпром', modelName: 'ДН-19', serialNumber: 'SN-FN-0190',
    inventoryNumber: 'INV-200021', commissionedAt: '2017-09-10', ownerId: 'org-smelt', plannerId: 'pr-kuznetsov',
  },

  // ====== Прокатный цех ======
  {
    id: 'as-rollstand-1', code: 'КЛТ-001', name: 'Клеть прокатная черновая',
    classification: 'Прокатная клеть / Черновая', classificationId: 'cl-rollstand',
    functionalLocationId: 'fl-roll-mill', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'critical',
    manufacturer: 'SMS group', modelName: 'CMT-650', serialNumber: 'SN-RS-0650',
    inventoryNumber: 'INV-300010', commissionedAt: '2018-11-05', ownerId: 'org-roll', plannerId: 'pr-fedotova',
  },
  {
    id: 'as-rollstand-1-motor', code: 'КЛТ-001-ДВ', name: 'Главный привод прокатной клети',
    classification: 'Двигатель / Асинхронный', classificationId: 'cl-motor-async',
    functionalLocationId: 'fl-roll-mill', parentAssetId: 'as-rollstand-1',
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'ЭЛДИН', modelName: 'СДП-2500', serialNumber: 'SN-MT-2500',
    inventoryNumber: 'INV-300011', commissionedAt: '2018-11-05', ownerId: 'org-roll', plannerId: 'pr-fedotova',
  },
  {
    id: 'as-rollstand-2', code: 'КЛТ-002', name: 'Клеть прокатная чистовая',
    classification: 'Прокатная клеть / Чистовая', classificationId: 'cl-rollstand',
    functionalLocationId: 'fl-roll-mill', parentAssetId: null,
    statusId: 'st-asset-maint', criticality: 'high',
    manufacturer: 'Danieli', modelName: 'FRS-450', serialNumber: 'SN-RS-0450',
    inventoryNumber: 'INV-300020', commissionedAt: '2018-11-05', ownerId: 'org-roll', plannerId: 'pr-fedotova',
  },
  {
    id: 'as-roll-cooler-1', code: 'ОХЛ-001', name: 'Установка охлаждения проката',
    classification: 'Теплообменник / Пластинчатый', classificationId: 'cl-heatexchanger',
    functionalLocationId: 'fl-roll-finish', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'Бугульма-Энерго', modelName: 'ТПУ-300', serialNumber: 'SN-HX-0300',
    inventoryNumber: 'INV-300030', commissionedAt: '2019-02-15', ownerId: 'org-roll', plannerId: 'pr-fedotova',
  },

  // ====== Энергетический цех ======
  // --- Насосная станция ---
  {
    id: 'as-pump-1', code: 'НАС-001', name: 'Насос центробежный Д-1250',
    classification: 'Насос / Центробежный', classificationId: 'cl-pump-centrifugal',
    functionalLocationId: 'fl-energy-pump', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'ГМС Ливгидромаш', modelName: 'Д-1250-125', serialNumber: 'SN-PM-1250',
    inventoryNumber: 'INV-100050', commissionedAt: '2016-04-18', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-pump-1-bearing', code: 'НАС-001-ПДШ', name: 'Узел подшипниковый насоса Д-1250',
    classification: 'Узел / Подшипниковый', classificationId: 'cl-bearing',
    functionalLocationId: 'fl-energy-pump', parentAssetId: 'as-pump-1',
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'SKF', modelName: 'SNL-3144', serialNumber: 'SN-BR-3144',
    inventoryNumber: 'INV-100051', commissionedAt: '2016-04-18', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-pump-1-motor', code: 'НАС-001-ДВ', name: 'Электродвигатель насоса Д-1250',
    classification: 'Двигатель / Асинхронный', classificationId: 'cl-motor-async',
    functionalLocationId: 'fl-energy-pump', parentAssetId: 'as-pump-1',
    statusId: 'st-asset-op', criticality: 'medium',
    manufacturer: 'ЭЛДИН', modelName: 'АИР-315', serialNumber: 'SN-MT-3150',
    inventoryNumber: 'INV-100053', commissionedAt: '2016-04-18', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-pump-2', code: 'НАС-002', name: 'Насос центробежный Д-1250 (резерв)',
    classification: 'Насос / Центробежный', classificationId: 'cl-pump-centrifugal',
    functionalLocationId: 'fl-energy-pump', parentAssetId: null,
    statusId: 'st-asset-standby', criticality: 'medium',
    manufacturer: 'ГМС Ливгидромаш', modelName: 'Д-1250-125', serialNumber: 'SN-PM-1251',
    inventoryNumber: 'INV-100052', commissionedAt: '2016-04-18', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  // --- Компрессорная станция ---
  {
    id: 'as-comp-1', code: 'КМП-001', name: 'Компрессор винтовой ВК-100',
    classification: 'Компрессор / Винтовой', classificationId: 'cl-compressor-screw',
    functionalLocationId: 'fl-energy-comp', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'high',
    manufacturer: 'Remeza', modelName: 'ВК-100-08', serialNumber: 'SN-CMP-1000',
    inventoryNumber: 'INV-100060', commissionedAt: '2020-02-14', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-comp-2', code: 'КМП-002', name: 'Компрессор центробежный К-250',
    classification: 'Компрессор / Центробежный', classificationId: 'cl-compressor-centrifugal',
    functionalLocationId: 'fl-energy-comp', parentAssetId: null,
    statusId: 'st-asset-maint', criticality: 'critical',
    manufacturer: 'Казанькомпрессормаш', modelName: 'К-250-61-5', serialNumber: 'SN-CMP-2500',
    inventoryNumber: 'INV-100061', commissionedAt: '2015-10-05', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-comp-2-cooler', code: 'КМП-002-ОХЛ', name: 'Концевой охладитель компрессора',
    classification: 'Теплообменник / Кожухотрубный', classificationId: 'cl-heatexchanger',
    functionalLocationId: 'fl-energy-comp', parentAssetId: 'as-comp-2',
    statusId: 'st-asset-op', criticality: 'low',
    manufacturer: 'Бугульма-Энерго', modelName: 'ТКГ-200', serialNumber: 'SN-HX-0200',
    inventoryNumber: 'INV-100062', commissionedAt: '2015-10-05', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
  {
    id: 'as-fan-1', code: 'ВНТ-001', name: 'Вентиляторная установка ВДН-12.5',
    classification: 'Вентилятор / Дутьевой', classificationId: 'cl-fan',
    functionalLocationId: 'fl-energy-comp', parentAssetId: null,
    statusId: 'st-asset-op', criticality: 'low',
    manufacturer: 'Вентпром', modelName: 'ВДН-12.5', serialNumber: 'SN-FN-0125',
    inventoryNumber: 'INV-100065', commissionedAt: '2021-12-01', ownerId: 'org-energy', plannerId: 'pr-sidorov',
  },
];
