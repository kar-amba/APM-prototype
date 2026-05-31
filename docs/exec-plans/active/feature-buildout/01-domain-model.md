# План: Доменная модель и Zod-схемы для всех сущностей v1

- Статус: completed
- Дата: 2026-05-31

## Цель

Расширить `src/model` до полного набора сущностей продуктового видения v1, чтобы
последующие разделы строились на типизированных контрактах (а не на догадках).
Сейчас описаны только `FunctionalLocation`, `Asset` и общие enum.

## Контекст

- Модель данных v1: [`../../../product/main.md`](../../../product/main.md) (раздел 6).
- Текущая модель: `src/model/{common,functional-location,asset}.ts`.
- Принцип «валидируем границы данных» — core-belief №7.
- Слой репозитория: `src/data/repository.ts` (после добавления сущностей дополнить
  `AppRepository` соответствующими репозиториями).

## Шаги

- [x] **Классификация и атрибуты:** `Classification`, `AttributeDefinition`
      (тип значения, единица измерения, диапазон), `AssetAttributeValue`
      (`src/model/classification.ts`). Добавлен `Asset.classificationId` (опционально).
- [x] **Статусные схемы:** `StatusScheme`, `Status`, `Transition` с `entityKind`
      (`src/model/status-scheme.ts`). Замена «зашитого» `assetStatusSchema` на
      статусы из схемы отложена в раздел «Статусные схемы» (план 06).
- [x] **Стратегии и мероприятия:** `Strategy`, `MaintenanceTask`
      (`src/model/maintenance.ts`).
- [x] **Маршруты и обходы:** `Route`, `RoutePoint` (kind: measurement/checklist),
      `RoundExecution`, `Reading` (`src/model/rounds.ts`).
- [x] **Критичность:** `CriticalityAssessment` (`src/model/criticality.ts`).
- [x] **Дефекты и уведомления:** `Defect`, `Notification` (`src/model/reliability.ts`).
- [x] **Справочные сущности:** `Manufacturer`, `OrgUnit`, `Person`,
      `UnitOfMeasure`, `AppDocument` (`src/model/catalog.ts`).
- [x] Все сущности — через Zod-схемы, экспорт `z.infer`, ре-экспорт из `index.ts`.
- [x] `AppRepository` расширен репозиториями под все сущности.

## Журнал решений

- 2026-05-31: `assetStatusSchema` оставлен «зашитым» для поля `Asset.status` —
  перевод активов на статусы из схемы относится к плану 06 (чтобы не ломать
  реестр и сиды на этом шаге).
- 2026-05-31: тип документа назван `AppDocument` (а не `Document`), чтобы не
  конфликтовать с DOM-типом `Document`.
- 2026-05-31: общие enum (тоны статусов, типы атрибутов, `statusEntityKind`,
  `scalarValue`) вынесены в `src/model/common.ts`.

## Критерии готовности

- [x] Для каждой сущности v1 есть Zod-схема и выведенный тип в `src/model`.
- [x] `AppRepository` объявляет репозитории под новые сущности.
- [x] `pnpm lint` и `pnpm build` проходят.
