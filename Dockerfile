# syntax=docker/dockerfile:1

# Dockerfile прототипа APM ГлоуБайт.
# Это фронтенд-ориентированный SPA (Vite + React), без бэкенда: собираем
# статику на Node и раздаём её через nginx. Сборка многоступенчатая, чтобы в
# финальный образ не попали ни node_modules, ни тулчейн.

# --- Этап 1: сборка статики ---------------------------------------------------
# Vite 8 требует современный Node (LTS 22.x). Pinned alpine — лёгкий и стабильный.
FROM node:22-alpine AS build
WORKDIR /app

# pnpm идёт через corepack (менеджер пакетов проекта, lockfileVersion 9).
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Сначала только манифесты — слой с зависимостями кешируется и не
# пересобирается, пока package.json/lock не меняются.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Затем исходники и production-сборка (tsc -b && vite build → /app/dist).
COPY . .
RUN pnpm build

# --- Этап 2: раздача статики через nginx --------------------------------------
FROM nginx:1.27-alpine AS runtime

# Конфиг с history-API fallback для SPA-маршрутов (React Router).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Только собранная статика, без исходников и зависимостей.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Простой healthcheck: nginx должен отдавать корневую страницу.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
