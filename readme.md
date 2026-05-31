# Прототип APM ГлоуБайт

Прототип создан для демонстрации целевого вида APM-системы (EAM + APM).
Прототип не подразумевает реальные интеграции и только имитирует их.

Это фронтенд-ориентированный SPA: React 19 + TypeScript + Vite, данные —
локальные мок-сиды через слой репозитория. Подробности: см.
[`AGENTS.md`](AGENTS.md), [`ARCHITECTURE.md`](ARCHITECTURE.md) и
[`docs/`](docs/).

## Быстрый старт

Требуется Node.js LTS (≥ 20). Менеджер пакетов — **pnpm** (через `corepack`,
входит в Node):

```bash
corepack enable           # один раз; если нет прав — используйте corepack pnpm@<версия> ...
pnpm install              # установка зависимостей
pnpm dev                  # дев-сервер (http://localhost:5173)
```

Прочие команды:

```bash
pnpm build                # типизация (tsc) + продакшн-сборка (Vite)
pnpm preview              # просмотр собранной версии
pnpm lint                 # ESLint
pnpm format               # Prettier
```

> Если `corepack enable` недоступен (нет прав на запись в каталог Node),
> запускайте pnpm напрямую: `corepack pnpm@11.5.0 install`, `corepack pnpm@11.5.0 dev` и т.д.

## Что уже реализовано

- Оболочка приложения: sidebar на 8 разделов, верхняя панель, переключатель роли.
- Дизайн-система из брендбука (CSS-токены и классы), шрифты Inter / JetBrains Mono.
- Локализация (react-i18next, русский язык).
- Слой данных: доменная модель (Zod) по всем сущностям v1, интерфейс репозитория
  и наполненные мок-сиды демо-предприятия «ГлоуБайт-Металл».
- **Режимы хранения** (системные настройки): in-memory (сиды), localStorage,
  IndexedDB (Dexie) — со сбросом к исходным данным.
- Вертикальный срез **«Реестр активов»**: дерево иерархии + таблица + карточка
  актива с вкладками + **интерактивный CRUD** (React Hook Form + Zod) по активам
  и функциональным местам.

Остальные разделы пока представлены заглушками. Планы работ:
[`docs/exec-plans/active/skeleton-scaffold.md`](docs/exec-plans/active/skeleton-scaffold.md)
и дорожная карта обвязки
[`docs/exec-plans/active/feature-buildout/`](docs/exec-plans/active/feature-buildout/index.md).
