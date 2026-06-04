import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Asset } from '@/model';
import { Badge, EmptyState } from '@/shared/ui';
import { criticalityTone, statusTone } from '@/features/asset-registry/lib';
import styles from './Search.module.css';

interface ResultsTableProps {
  assets: Asset[];
  locationNames: Map<string, string>;
  onSelect: (id: string) => void;
}

const columnHelper = createColumnHelper<Asset>();

export function ResultsTable({
  assets,
  locationNames,
  onSelect,
}: ResultsTableProps) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('search.columns.name'),
        cell: (info) => (
          <div>
            <div className={styles.assetName}>{info.getValue()}</div>
            <div className={styles.assetCode}>{info.row.original.code}</div>
          </div>
        ),
      }),
      columnHelper.accessor('classification', {
        header: t('search.columns.class'),
      }),
      columnHelper.accessor('status', {
        header: t('search.columns.status'),
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge tone={statusTone[value]} dot>
              {t(`assetStatus.${value}`)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('criticality', {
        header: t('search.columns.criticality'),
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge tone={criticalityTone[value]}>
              {t(`criticalityLevel.${value}`)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('manufacturer', {
        header: t('search.columns.manufacturer'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('functionalLocationId', {
        header: t('search.columns.location'),
        cell: (info) => locationNames.get(info.getValue()) ?? info.getValue(),
      }),
    ],
    [t, locationNames],
  );

  const table = useReactTable({
    data: assets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (assets.length === 0) {
    return <EmptyState title={t('search.empty')} />;
  }

  return (
    <div className={styles.tableScroll}>
      <table className={styles.dataTable}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sorted && (
                      <span className={styles.sortIndicator}>
                        {sorted === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} onClick={() => onSelect(row.original.id)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
