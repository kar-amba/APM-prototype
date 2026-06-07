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
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink, SquareArrowOutUpRight } from 'lucide-react';
import type { Asset, Status } from '@/model';
import { Badge, ContextMenu, EmptyState, type ContextMenuItem } from '@/shared/ui';
import { assetPath, criticalityTone } from '@/features/asset-registry/lib';
import styles from './Search.module.css';

interface ResultsTableProps {
  assets: Asset[];
  locationNames: Map<string, string>;
  statusById: Map<string, Status>;
  onSelect: (id: string) => void;
}

interface RowMenuState {
  x: number;
  y: number;
  assetId: string;
}

const columnHelper = createColumnHelper<Asset>();

export function ResultsTable({
  assets,
  locationNames,
  statusById,
  onSelect,
}: ResultsTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [menu, setMenu] = useState<RowMenuState | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('search.columns.name'),
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenu({ x: e.clientX, y: e.clientY, assetId: id });
              }}
            >
              <Link
                to={assetPath(id)}
                className={styles.assetLink}
                onClick={(e) => e.stopPropagation()}
              >
                {info.getValue()}
              </Link>
              <div className={styles.assetCode}>{info.row.original.code}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor('classification', {
        header: t('search.columns.class'),
      }),
      columnHelper.accessor((row) => statusById.get(row.statusId)?.name ?? '', {
        id: 'status',
        header: t('search.columns.status'),
        cell: (info) => {
          const status = statusById.get(info.row.original.statusId);
          if (!status) return '—';
          return (
            <Badge tone={status.tone} dot>
              {status.name}
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
    [t, locationNames, statusById],
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

  const menuItems: ContextMenuItem[] = menu
    ? [
        {
          id: 'open',
          label: t('registry.contextMenu.open'),
          icon: <ExternalLink size={14} />,
          onSelect: () => navigate(assetPath(menu.assetId)),
        },
        {
          id: 'open-new-tab',
          label: t('registry.contextMenu.openNewTab'),
          icon: <SquareArrowOutUpRight size={14} />,
          onSelect: () =>
            window.open(assetPath(menu.assetId), '_blank', 'noopener'),
        },
      ]
    : [];

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
      <ContextMenu
        open={menu !== null}
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        items={menuItems}
        onClose={() => setMenu(null)}
      />
    </div>
  );
}
