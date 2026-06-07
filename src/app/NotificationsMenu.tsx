import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '@/model';
import { useDataStore, useRepository } from '@/store/dataStore';
import styles from './NotificationsMenu.module.css';

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('ru-RU');
}

/**
 * Индикатор уведомлений в верхней панели. Показывает число непрочитанных и
 * раскрывает список последних уведомлений (порождаются отклонениями на обходах
 * и симулятором телеметрии). Реагирует на `revision` стора данных — обновляется
 * при работе симулятора. Клик по уведомлению ведёт на карточку актива.
 */
export function NotificationsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const repository = useRepository();
  const revision = useDataStore((s) => s.revision);
  const bumpRevision = useDataStore((s) => s.bumpRevision);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void repository.notifications.list().then((list) => {
      if (active) setItems(list);
    });
    return () => {
      active = false;
    };
  }, [repository, revision]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items],
  );
  const unread = useMemo(() => sorted.filter((n) => !n.read).length, [sorted]);
  const recent = useMemo(() => sorted.slice(0, 8), [sorted]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markAllRead = useCallback(async () => {
    const unreadItems = items.filter((n) => !n.read);
    if (unreadItems.length === 0) return;
    await Promise.all(
      unreadItems.map((n) =>
        repository.notifications.update(n.id, { read: true }),
      ),
    );
    bumpRevision();
  }, [items, repository, bumpRevision]);

  const openNotification = useCallback(
    async (n: Notification) => {
      if (!n.read) {
        await repository.notifications.update(n.id, { read: true });
        bumpRevision();
      }
      setOpen(false);
      if (n.assetId) navigate(`/assets/${n.assetId}`);
    },
    [repository, bumpRevision, navigate],
  );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bell}
        title={t('notifications.title')}
        aria-label={t('notifications.title')}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className={styles.count}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t('notifications.title')}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>{t('notifications.title')}</span>
            <button
              type="button"
              className={styles.markAll}
              onClick={markAllRead}
              disabled={unread === 0}
            >
              <CheckCheck size={14} />
              {t('notifications.markAllRead')}
            </button>
          </div>

          <div className={styles.list}>
            {recent.length === 0 ? (
              <div className={styles.empty}>{t('notifications.empty')}</div>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={[styles.item, !n.read && styles.itemUnread]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => openNotification(n)}
                >
                  <span
                    className={[styles.dot, !n.read && styles.dotUnread]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  <span className={styles.itemBody}>
                    <span className={styles.itemMessage}>{n.message}</span>
                    <span className={styles.itemTime}>
                      {formatTime(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
