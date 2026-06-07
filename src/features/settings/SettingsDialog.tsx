import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { STORAGE_MODES, type StorageMode } from '@/data';
import { useDataStore } from '@/store/dataStore';
import { useSimulatorStore } from '@/store/simulatorStore';
import { SIMULATION_SPEEDS, type SimulationSpeed } from '@/services/telemetry';
import { Badge, Button, Modal } from '@/shared/ui';
import styles from './SettingsDialog.module.css';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { t } = useTranslation();
  const storageMode = useDataStore((s) => s.storageMode);
  const setStorageMode = useDataStore((s) => s.setStorageMode);
  const resetData = useDataStore((s) => s.resetData);
  const simRunning = useSimulatorStore((s) => s.running);
  const simSpeed = useSimulatorStore((s) => s.speed);
  const simTicks = useSimulatorStore((s) => s.ticks);
  const simDeviations = useSimulatorStore((s) => s.deviations);
  const toggleSim = useSimulatorStore((s) => s.toggle);
  const setSimSpeed = useSimulatorStore((s) => s.setSpeed);
  const storageDisabled = storageMode === 'database';
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!window.confirm(t('settings.resetConfirm'))) return;
    setResetting(true);
    setDone(false);
    try {
      await resetData();
      setDone(true);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t('settings.title')}
      onClose={onClose}
      footer={<Button onClick={onClose}>{t('common.close')}</Button>}
    >
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('settings.storageMode')}</div>
        <p className="text-sm text-muted mb-4">{t('settings.storageHint')}</p>
        <div className={styles.options}>
          {STORAGE_MODES.map((mode) => {
            const disabled = mode === 'database';
            return (
              <label
                key={mode}
                className={[
                  styles.option,
                  storageMode === mode && styles.optionActive,
                  disabled && styles.optionDisabled,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="radio"
                  name="storage-mode"
                  value={mode}
                  checked={storageMode === mode}
                  disabled={disabled}
                  onChange={() => setStorageMode(mode as StorageMode)}
                />
                <span className={styles.optionText}>
                  <span className={styles.optionName}>
                    {t(`settings.modes.${mode}.name`)}
                  </span>
                  <span className={styles.optionDesc}>
                    {t(`settings.modes.${mode}.description`)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('settings.reset')}</div>
        <p className="text-sm text-muted mb-4">{t('settings.resetHint')}</p>
        <Button variant="secondary" onClick={handleReset} disabled={resetting}>
          <RotateCcw size={16} />
          {resetting ? t('common.loading') : t('settings.resetAction')}
        </Button>
        {done && (
          <div className="alert alert-success mt-4">{t('settings.resetDone')}</div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('simulator.title')}</div>
        <p className="text-sm text-muted mb-4">{t('simulator.hint')}</p>
        <div className={styles.simRow}>
          <Button
            variant={simRunning ? 'secondary' : 'primary'}
            onClick={toggleSim}
            disabled={storageDisabled}
          >
            {simRunning ? <Pause size={16} /> : <Play size={16} />}
            {simRunning ? t('simulator.stop') : t('simulator.start')}
          </Button>
          <div className={styles.simField}>
            <label className="label" htmlFor="sim-speed">
              {t('simulator.speed')}
            </label>
            <select
              id="sim-speed"
              className="input"
              value={simSpeed}
              onChange={(e) => setSimSpeed(e.target.value as SimulationSpeed)}
            >
              {SIMULATION_SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {t(`simulator.speeds.${speed}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.simStatus}>
          <Badge tone={simRunning ? 'success' : 'default'} dot>
            {simRunning ? t('simulator.running') : t('simulator.stopped')}
          </Badge>
          <span className="text-xs text-muted">
            {t('simulator.stats', {
              ticks: simTicks,
              deviations: simDeviations,
            })}
          </span>
        </div>
      </div>
    </Modal>
  );
}
