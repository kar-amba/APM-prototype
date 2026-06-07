import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContextMenu.module.css';

/** Пункт контекстного меню. */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}

interface ContextMenuProps {
  open: boolean;
  /** Координаты курсора (clientX/clientY) для позиционирования меню. */
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/**
 * Лёгкое контекстное меню по координатам курсора. Закрывается по клику вне меню,
 * прокрутке, ресайзе и Escape. Рендерится в портал, чтобы не обрезаться overflow
 * таблиц/панелей.
 */
export function ContextMenu({ open, x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <ul
      className={styles.menu}
      style={{ top: y, left: x }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => (
        <li key={item.id} role="none">
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>,
    document.body,
  );
}
