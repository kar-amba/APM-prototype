#!/usr/bin/env node
// Управление жизненным циклом dev-сервера APM-прототипа (start/stop/status/restart).
// Логика вынесена в Node, чтобы Makefile оставался тонкой кроссплатформенной обёрткой
// (Windows/PowerShell и Unix/sh ведут себя одинаково).

import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ROOT = path.resolve(__dirname, '..');
const STATE_DIR = path.join(ROOT, '.apm');
const PID_FILE = path.join(STATE_DIR, 'dev.pid');
const LOG_FILE = path.join(STATE_DIR, 'dev.log');

// Должно совпадать с server.host/server.port в vite.config.ts.
const HOST = '127.0.0.1';
const PORT = 5173;
const URL = `http://${HOST}:${PORT}/`;

const isWindows = process.platform === 'win32';

function ensureStateDir() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

// Определяем, чем запускать dev-сервер. Предпочитаем прямой запуск бина vite
// через текущий node (реальный PID, без shell). При неудаче — откат на npm.
function resolveDevCommand() {
  try {
    const vitePkg = require.resolve('vite/package.json', { paths: [ROOT] });
    const viteBin = path.join(path.dirname(vitePkg), 'bin', 'vite.js');
    if (fs.existsSync(viteBin)) {
      return { command: process.execPath, args: [viteBin] };
    }
  } catch {
    /* vite не разрешился — используем откат ниже */
  }
  // Откат: npm run dev (на Windows требует shell, PID может быть менее точным).
  return { command: 'npm', args: ['run', 'dev'], viaNpm: true };
}

function readPid() {
  try {
    const pid = Number.parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
    return Number.isInteger(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isProcessAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0); // сигнал 0 — только проверка существования процесса
    return true;
  } catch (err) {
    return err.code === 'EPERM'; // процесс есть, но нет прав — значит живой
  }
}

// Проверка, что порт уже кем-то слушается (dev-сервер поднялся).
function isPortOpen(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForPort(host, port, attempts = 40, intervalMs = 500) {
  for (let i = 0; i < attempts; i += 1) {
    if (await isPortOpen(host, port)) return true;
    await sleep(intervalMs);
  }
  return false;
}

// Завершение процесса вместе с дочерними (vite запускается как ребёнок npm).
function killTree(pid) {
  if (isWindows) {
    spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-pid, 'SIGTERM'); // отрицательный pid — вся группа процессов
    } catch {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        /* уже мёртв */
      }
    }
  }
}

function clearPidFile() {
  try {
    fs.unlinkSync(PID_FILE);
  } catch {
    /* нет файла — ок */
  }
}

async function start() {
  ensureStateDir();
  const existing = readPid();
  if (isProcessAlive(existing)) {
    console.log(`APM уже запущен (PID ${existing}). Адрес: ${URL}`);
    return;
  }
  if (existing) clearPidFile(); // устаревший pid-файл от мёртвого процесса

  if (await isPortOpen(HOST, PORT)) {
    console.error(
      `Порт ${PORT} уже занят другим процессом. Освободите его или остановите тот сервер.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log('Запуск dev-сервера APM…');
  const out = fs.openSync(LOG_FILE, 'a');

  // Запускаем vite напрямую через node, а не через npm/.cmd-обёртку: так PID
  // принадлежит реальному долгоживущему процессу (важно для stop/status), и не
  // нужен shell (на Windows spawn .cmd без shell даёт EINVAL).
  const { command, args, viaNpm } = resolveDevCommand();
  const child = spawn(command, args, {
    cwd: ROOT,
    // detached отвязывает сервер от управляющего процесса: на Unix создаёт свою
    // группу процессов (нужно для kill дерева), на Windows — отдельную консоль,
    // иначе при выходе этого скрипта дочерний vite завершается вместе с ним.
    detached: true,
    shell: Boolean(viaNpm) && isWindows, // только для отката на npm.cmd
    stdio: ['ignore', out, out],
    windowsHide: true,
  });

  child.on('error', (err) => {
    console.error(`Не удалось запустить npm run dev: ${err.message}`);
    process.exitCode = 1;
  });

  fs.writeFileSync(PID_FILE, String(child.pid));
  child.unref();

  console.log(`Процесс запущен (PID ${child.pid}). Ожидаю готовности порта ${PORT}…`);
  const ready = await waitForPort(HOST, PORT);
  if (ready) {
    console.log(`APM готов: ${URL}`);
    console.log(`Логи: ${path.relative(ROOT, LOG_FILE)}`);
  } else {
    console.error(
      `Сервер не ответил на ${URL} вовремя. Проверьте логи: ${path.relative(ROOT, LOG_FILE)}`,
    );
    process.exitCode = 1;
  }
}

async function stop() {
  const pid = readPid();
  if (!isProcessAlive(pid)) {
    console.log('APM не запущен.');
    clearPidFile();
    return;
  }
  console.log(`Остановка APM (PID ${pid})…`);
  killTree(pid);

  for (let i = 0; i < 20; i += 1) {
    if (!isProcessAlive(pid)) break;
    await sleep(250);
  }

  if (isProcessAlive(pid)) {
    console.error(`Процесс ${pid} всё ещё жив. Возможно, требуется ручное завершение.`);
    process.exitCode = 1;
    return;
  }
  clearPidFile();
  console.log('APM остановлен.');
}

async function status() {
  const pid = readPid();
  const alive = isProcessAlive(pid);
  const portOpen = await isPortOpen(HOST, PORT);

  console.log('=== Состояние APM-прототипа ===');
  console.log(`Процесс:  ${alive ? `работает (PID ${pid})` : 'остановлен'}`);
  console.log(`Порт ${PORT}: ${portOpen ? 'отвечает' : 'не отвечает'}`);
  console.log(`Адрес:    ${URL}`);

  if (alive && portOpen) {
    console.log('Итог: APM запущен и доступен.');
  } else if (alive && !portOpen) {
    console.log('Итог: процесс жив, но порт ещё не готов (запускается?).');
    process.exitCode = 1;
  } else if (!alive && portOpen) {
    console.log('Итог: порт занят посторонним процессом (не нашим pid-файлом).');
    process.exitCode = 1;
  } else {
    console.log('Итог: APM остановлен.');
    process.exitCode = 1;
  }
}

async function restart() {
  await stop();
  await sleep(500);
  await start();
}

const command = process.argv[2];
const actions = { start, stop, status, restart };

if (!actions[command]) {
  console.error('Использование: node scripts/apm-control.mjs <start|stop|status|restart>');
  process.exit(2);
}

await actions[command]();
