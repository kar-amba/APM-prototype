import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { getAppRepository, type AppRepository, type StorageMode } from '@/data';
import type { Asset, Reading, RoutePoint } from '@/model';
import i18n from '@/shared/i18n';
import {
  buildDeviationDefect,
  buildDeviationNotification,
  rangeLabel,
} from '@/services/rounds';
import {
  measurementPoints,
  nextValue,
  seedValue,
  shouldDeviate,
  SPEED_INTERVAL_MS,
  TELEMETRY_READING_PREFIX,
  TELEMETRY_RETENTION_PER_POINT,
  isTelemetryReadingId,
  type SimulationSpeed,
} from '@/services/telemetry';
import { useDataStore } from './dataStore';

/**
 * Управление симулятором телеметрии. UI-состояние (вкл/выкл, скорость,
 * статистика) живёт в Zustand, а сам таймер и запись через репозиторий — в
 * императивном контроллере на уровне модуля: это побочный эффект, который не
 * место в чистом сторе. Контроллер пишет данные через текущий репозиторий и
 * после каждого тика дёргает `bumpRevision`, чтобы разделы перечитали данные.
 */

interface SimulatorState {
  running: boolean;
  speed: SimulationSpeed;
  /** Сколько тиков отработал симулятор в этой сессии. */
  ticks: number;
  /** Сколько отклонений сгенерировано (создано дефектов). */
  deviations: number;
  lastTickAt: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setSpeed: (speed: SimulationSpeed) => void;
}

// --- Императивное состояние контроллера (вне Zustand) ---
let timer: ReturnType<typeof setInterval> | null = null;
let busy = false;
let initializedMode: StorageMode | null = null;
let simPoints: RoutePoint[] = [];
let assetById = new Map<string, Asset>();
let unitCodeById = new Map<string, string>();
const lastValue = new Map<string, number>();
/** id замеров симулятора по точке (старые → новые) для ограничения роста. */
const createdIds = new Map<string, string[]>();

/** Загружает справочные данные и восстанавливает контекст под текущий режим. */
async function init(repo: AppRepository, mode: StorageMode): Promise<void> {
  const [points, readings, assets, units] = await Promise.all([
    repo.routePoints.list(),
    repo.readings.list(),
    repo.assets.list(),
    repo.unitsOfMeasure.list(),
  ]);

  simPoints = measurementPoints(points);
  assetById = new Map(assets.map((a) => [a.id, a]));
  unitCodeById = new Map(units.map((u) => [u.id, u.code]));

  lastValue.clear();
  for (const point of simPoints) {
    const latest = readings
      .filter((r) => r.routePointId === point.id && typeof r.value === 'number')
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
    lastValue.set(point.id, latest ? (latest.value as number) : seedValue(point));
  }

  // Восстанавливаем учёт ранее созданных симулятором замеров (по префиксу id),
  // чтобы ограничение роста работало и между сессиями в персистентных режимах.
  createdIds.clear();
  const simReadings = readings
    .filter((r) => isTelemetryReadingId(r.id))
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  for (const reading of simReadings) {
    const ids = createdIds.get(reading.routePointId) ?? [];
    ids.push(reading.id);
    createdIds.set(reading.routePointId, ids);
  }

  initializedMode = mode;
}

/** Один шаг симуляции: показания по всем точкам + дефекты/уведомления. */
async function tick(): Promise<void> {
  if (busy) return;
  const mode = useDataStore.getState().storageMode;
  if (mode === 'database') return; // режим-заготовка, репозитория нет

  busy = true;
  try {
    const repo = getAppRepository(mode);
    if (initializedMode !== mode) {
      await init(repo, mode);
    }
    if (simPoints.length === 0) return;

    let deviationsThisTick = 0;

    for (const point of simPoints) {
      const previous = lastValue.get(point.id) ?? seedValue(point);
      const deviate = shouldDeviate();
      const value = nextValue(point, previous, deviate);
      lastValue.set(point.id, value);

      const reading: Reading = {
        id: `${TELEMETRY_READING_PREFIX}${nanoid(8)}`,
        routePointId: point.id,
        recordedAt: new Date().toISOString(),
        value,
        isDeviation: deviate,
      };
      await repo.readings.create(reading);

      // Ограничение роста: храним только последние N замеров на точку.
      const ids = createdIds.get(point.id) ?? [];
      ids.push(reading.id);
      while (ids.length > TELEMETRY_RETENTION_PER_POINT) {
        const oldest = ids.shift();
        if (oldest) await repo.readings.remove(oldest).catch(() => undefined);
      }
      createdIds.set(point.id, ids);

      if (!deviate) continue;

      deviationsThisTick += 1;
      const asset = assetById.get(point.assetId);
      const unitCode = point.unitId ? unitCodeById.get(point.unitId) : undefined;
      const defect = buildDeviationDefect({
        assetId: point.assetId,
        reading,
        point,
        title: i18n.t('simulator.defectTitle', { point: point.name }),
        description: i18n.t('simulator.defectDescription', {
          point: point.name,
          value: String(value),
          range: rangeLabel(point, unitCode),
        }),
        severity: asset?.criticality,
        source: 'simulator',
      });
      await repo.defects.create(defect);
      const notification = buildDeviationNotification({
        defect,
        message: i18n.t('simulator.notification', {
          point: point.name,
          asset: asset?.name ?? point.assetId,
        }),
      });
      await repo.notifications.create(notification);
    }

    useSimulatorStore.setState((s) => ({
      ticks: s.ticks + 1,
      deviations: s.deviations + deviationsThisTick,
      lastTickAt: new Date().toISOString(),
    }));
    useDataStore.getState().bumpRevision();
  } finally {
    busy = false;
  }
}

function startTimer(speed: SimulationSpeed): void {
  stopTimer();
  timer = setInterval(() => void tick(), SPEED_INTERVAL_MS[speed]);
}

function stopTimer(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  running: false,
  speed: 'normal',
  ticks: 0,
  deviations: 0,
  lastTickAt: null,
  start: () => {
    if (get().running) return;
    initializedMode = null; // перечитать контекст под актуальный режим хранения
    startTimer(get().speed);
    set({ running: true });
    void tick(); // первый замер сразу, не дожидаясь интервала
  },
  stop: () => {
    stopTimer();
    set({ running: false });
  },
  toggle: () => {
    if (get().running) get().stop();
    else get().start();
  },
  setSpeed: (speed) => {
    set({ speed });
    if (get().running) startTimer(speed);
  },
}));
