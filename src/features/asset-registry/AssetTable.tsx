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
import { criticalityTone, statusTone } from './lib';
import styles from './AssetRegistry.module.css';

interface AssetTableProps {
  assets: Asset[];
  locationNames: Map<string, string>;
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

const columnHelper = createColumnHelper<Asset>();

export function AssetTable({
  assets,
  locationNames,
  selectedAssetId,
  onSelectAsset,
}: AssetTableProps) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('registry.columns.name'),
        cell: (info) => (
          <div>
            <div className={styles.assetName}>{info.getValue()}</div>
            <div className={styles.assetCode}>{info.row.original.code}</div>
          </div>
        ),
      }),
      columnHelper.accessor('classification', {
        header: t('registry.columns.class'),
      }),
      columnHelper.accessor('status', {
        header: t('registry.columns.status'),
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
        header: t('registry.columns.criticality'),
        cell: (info) => {
          const value = info.getValue();
          return (
            <Badge tone={criticalityTone[value]}>
              {t(`criticalityLevel.${value}`)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('functionalLocationId', {
        header: t('registry.columns.location'),
        cell: (info) =>
          locationNames.get(info.getValue()) ?? info.getValue(),
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
    return <EmptyState title={t('registry.tableEmpty')} />;
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
            <tr
              key={row.id}
              className={
                row.original.id === selectedAssetId ? styles.rowSelected : ''
              }
              onClick={() => onSelectAsset(row.original.id)}
            >
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
