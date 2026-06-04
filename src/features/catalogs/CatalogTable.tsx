import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState } from '@/shared/ui';
import styles from './Catalogs.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface CatalogTableProps<T extends { id: string }> {
  records: T[];
  columns: Column<T>[];
  addLabel: string;
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export function CatalogTable<T extends { id: string }>({
  records,
  columns,
  addLabel,
  onAdd,
  onEdit,
  onDelete,
}: CatalogTableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className={styles.pane}>
      <header className={styles.paneHeader}>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted">{records.length}</span>
        </span>
        <Button size="sm" onClick={onAdd}>
          <Plus size={15} />
          {addLabel}
        </Button>
      </header>
      <div className={styles.paneBody}>
        {records.length === 0 ? (
          <EmptyState title={t('catalogs.empty')} />
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.render(row)}</td>
                    ))}
                    <td className={styles.rowActions}>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={t('common.edit')}
                        aria-label={t('common.edit')}
                        onClick={() => onEdit(row)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        onClick={() => onDelete(row)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
