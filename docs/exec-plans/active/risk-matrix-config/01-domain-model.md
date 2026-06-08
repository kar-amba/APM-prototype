# План 01: Доменная модель матриц риска

- Статус: active
- Дата: 2026-06-08

## Цель

Описать сущности конфигурируемых матриц риска (`RiskScale`,
`ConsequenceCategory`, `RiskMatrix` со встроенными коллекциями), Zod-схемы и
новые enum; зарегистрировать датасеты в репозитории и наполнить сидами. Это
фундамент для всех экранов конфигуратора (планы 02–05) и интеграции (план 06).

## Контекст

- Целевая модель и принципы: [`index.md`](index.md).
- Текущая (заменяемая) модель: `src/model/criticality.ts`,
  `src/services/criticality.ts` (жёсткая 5×5).
- Паттерн enum/тонов: `src/model/common.ts` (`criticalityLevelSchema`,
  `statusToneSchema`, `statusEntityKindSchema`).
- Паттерн регистрации датасета: `src/data/datasets.ts`, интерфейс
  `src/data/repository.ts`, сиды `src/data/mock/`.
- Встраивание дочерних коллекций массивами — решение из `index.md` (агрегат).

## Шаги

- [ ] В `src/model/common.ts` добавить enum:
      - `riskAnalysisTypeSchema = z.enum(['aca','fmeca','rcm','rbi','strategy'])`;
      - `riskScaleKindSchema = z.enum(['probability','consequence','criticality','rank'])`;
      - `consequenceCategoryCodeSchema` — `production|safety|ecology|quality|finance`
        (строка не ограничена строго enum, чтобы допускать пользовательские коды:
        использовать `z.string().min(1)` + отдельный список «известных» кодов-констант).
- [ ] Создать `src/model/risk-matrix.ts`:
      - `riskScaleLevelSchema` — `{ order: int≥1, code, label, description?, anchor? }`.
      - `riskScaleSchema` — `{ id, code, name, kind, description?, levels: RiskScaleLevel[] (min 2) }`
        c проверкой уникальности `order` и непрерывности 1…N (через `superRefine`).
      - `consequenceCategoryDescriptorSchema` — `{ scaleOrder: int≥1, description }`.
      - `consequenceCategorySchema` — `{ id, code, name, description?, enabled, order,
        weight?, consequenceScaleId, descriptors: [] }`.
      - `riskLevelSchema` — `{ code, name, tone: statusTone, color?(hex), order,
        scoreFrom: number, scoreTo: number, actionHint? }`.
      - `riskMatrixCellSchema` — `{ probabilityOrder, consequenceOrder, riskLevelCode }`.
      - `riskMatrixSchema` — `{ id, code, name, description?, analysisType,
        probabilityScaleId, consequenceScaleId, rankMode, consequenceAggregation,
        isDefault, riskLevels: RiskLevel[] (min 2), cells?: RiskMatrixCell[] }`
        с `superRefine`: при `rankMode='explicit'` `cells` обязателен и покрывает все
        ячейки; пороги `riskLevels` не пересекаются и покрывают весь диапазон баллов.
      - Экспортировать типы (`z.infer`) и ре-экспортнуть из `src/model/index.ts`.
- [ ] Расширить `src/data/repository.ts` (`AppRepository`):
      `riskScales`, `consequenceCategories`, `riskMatrices`.
- [ ] Зарегистрировать датасеты в `src/data/datasets.ts` (ключ + схема + сид),
      порядок: шкалы → категории → матрицы (категории и матрицы ссылаются на шкалы).
- [ ] Сиды в `src/data/mock/` (+ ре-экспорт в `mock/index.ts`):
      - Стандартные шкалы 5-уровневые: вероятность, последствия, критичность, ранг
        (с осмысленными подписями и «якорями» на русском).
      - Пять категорий последствий: производство, безопасность, экология,
        качество, финансы — с описанием каждого из 5 уровней тяжести.
      - Матрица **ACA 5×5 по умолчанию** (`isDefault`, `rankMode='product'`),
        чьи `riskLevels`-пороги **воспроизводят текущие** правила
        `criticalityLevelFromScore` (low ≤4 / medium 5–8 / high 9–14 / critical ≥15)
        и тоны из `criticalityTone`. Дополнительно — демонстрационные матрицы для
        FMECA, RCM, RBI (RBI — `rankMode='explicit'` с явной окраской ячеек),
        матрица «стратегии».
- [ ] Проверить, что сиды проходят Zod (хелпер `ds()` в `datasets.ts` валидирует на
      этапе компиляции типы; рантайм-валидация — на чтении репозитория).

## Журнал решений

- 2026-06-08: `consequenceCategory.code` — свободная строка с набором «известных»
  кодов-констант (а не жёсткий enum), чтобы поддержать пользовательские категории
  без миграции схемы.
- 2026-06-08: пороги зон храним парой `scoreFrom`/`scoreTo` в `riskLevel` (а не
  одной границей), чтобы валидировать покрытие/непересечение диапазона явно.

## Критерии готовности

- [ ] Сущности и enum описаны Zod-схемами, ре-экспортированы из `src/model`.
- [ ] Три новых репозитория доступны через `AppRepository`, датасеты сидируются.
- [ ] Матрица ACA по умолчанию воспроизводит текущие пороги критичности.
- [ ] `npm run lint` и `npm run build` проходят.
