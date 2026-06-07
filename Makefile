# Makefile — управление APM-прототипом ГлоуБайт.
#
# Тонкая обёртка над scripts/apm-control.mjs (Node), чтобы команды работали
# одинаково в Windows/PowerShell и в Unix/sh. Каждый рецепт — одиночная команда
# без shell-специфичного синтаксиса.
#
# Требуется установленный GNU make:
#   Windows (winget):  winget install GnuWin32.Make   (или ezwinports.make)
#   Windows (choco):   choco install make
#   Windows (scoop):   scoop install make
# Node.js и npm должны быть в PATH.

CONTROL := node scripts/apm-control.mjs

.PHONY: help install start up stop down restart status logs build preview lint clean \
        docker-build docker-up docker-down docker-dev docker-logs

# Цель по умолчанию — показать справку.
help:
	@echo Доступные команды APM-прототипа:
	@echo   make install   - установить зависимости (npm install)
	@echo   make start     - запустить dev-сервер (фоном, с контролем состояния)
	@echo   make stop      - остановить dev-сервер
	@echo   make restart   - перезапустить dev-сервер
	@echo   make status    - показать состояние (процесс + порт 5173)
	@echo   make logs      - показать накопленный лог dev-сервера
	@echo   make build     - production-сборка (tsc + vite build)
	@echo   make preview   - предпросмотр production-сборки
	@echo   make lint      - запустить ESLint
	@echo   make clean     - удалить dist и служебную папку .apm
	@echo   --- Docker ---
	@echo   make docker-build - собрать production-образ (nginx + статика)
	@echo   make docker-up    - поднять production-контейнер на http://localhost
	@echo   make docker-down  - остановить и удалить контейнеры
	@echo   make docker-dev   - dev-сервер Vite в контейнере (http://localhost:5173)
	@echo   make docker-logs  - логи docker-compose

install:
	npm install

# start/up и stop/down — синонимы для удобства.
start:
	$(CONTROL) start

up: start

stop:
	$(CONTROL) stop

down: stop

restart:
	$(CONTROL) restart

# Префикс '-' — make игнорирует ненулевой код (скрипт возвращает его как
# health-check, но для интерактивного status это не ошибка сборки).
status:
	-$(CONTROL) status

logs:
	@node -e "const fs=require('fs');const p='.apm/dev.log';try{process.stdout.write(fs.readFileSync(p,'utf8'))}catch{console.log('Лог пуст или отсутствует:',p)}"

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

# Чистим артефакты сборки и состояние. node -e работает кроссплатформенно.
clean:
	@node -e "const fs=require('fs');for(const d of ['dist','.apm']){fs.rmSync(d,{recursive:true,force:true});console.log('Удалено:',d)}"

# --- Docker --------------------------------------------------------------------
docker-build:
	docker compose build app

docker-up:
	docker compose up -d app

docker-down:
	docker compose down

docker-dev:
	docker compose --profile dev up dev

docker-logs:
	docker compose logs -f
