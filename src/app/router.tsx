import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';

/**
 * Разделы загружаются лениво (код-сплиттинг по маршрутам): каждый раздел —
 * отдельный чанк, грузится при первом переходе. Общий `Suspense` со скелетоном
 * живёт в `AppShell` вокруг `Outlet`.
 */
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);
const AssetRegistryPage = lazy(() =>
  import('@/features/asset-registry/AssetRegistryPage').then((m) => ({
    default: m.AssetRegistryPage,
  })),
);
const AssetCardPage = lazy(() =>
  import('@/features/asset-registry/AssetCardPage').then((m) => ({
    default: m.AssetCardPage,
  })),
);
const SearchPage = lazy(() =>
  import('@/features/asset-search/SearchPage').then((m) => ({
    default: m.SearchPage,
  })),
);
const StrategiesPage = lazy(() =>
  import('@/features/strategies/StrategiesPage').then((m) => ({
    default: m.StrategiesPage,
  })),
);
const RoundsPage = lazy(() =>
  import('@/features/rounds/RoundsPage').then((m) => ({
    default: m.RoundsPage,
  })),
);
const CriticalityPage = lazy(() =>
  import('@/features/criticality/CriticalityPage').then((m) => ({
    default: m.CriticalityPage,
  })),
);
const StatusSchemesPage = lazy(() =>
  import('@/features/status-schemes/StatusSchemesPage').then((m) => ({
    default: m.StatusSchemesPage,
  })),
);
const CatalogsPage = lazy(() =>
  import('@/features/catalogs/CatalogsPage').then((m) => ({
    default: m.CatalogsPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'assets', element: <AssetRegistryPage /> },
      { path: 'assets/:assetId', element: <AssetCardPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'strategies', element: <StrategiesPage /> },
      { path: 'rounds', element: <RoundsPage /> },
      { path: 'criticality', element: <CriticalityPage /> },
      { path: 'status-schemes', element: <StatusSchemesPage /> },
      { path: 'catalogs', element: <CatalogsPage /> },
    ],
  },
]);
