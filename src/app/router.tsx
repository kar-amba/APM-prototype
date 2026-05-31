import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AssetRegistryPage } from '@/features/asset-registry/AssetRegistryPage';
import { SearchPage } from '@/features/asset-search/SearchPage';
import { StrategiesPage } from '@/features/strategies/StrategiesPage';
import { RoundsPage } from '@/features/rounds/RoundsPage';
import { CriticalityPage } from '@/features/criticality/CriticalityPage';
import { StatusSchemesPage } from '@/features/status-schemes/StatusSchemesPage';
import { CatalogsPage } from '@/features/catalogs/CatalogsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'assets', element: <AssetRegistryPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'strategies', element: <StrategiesPage /> },
      { path: 'rounds', element: <RoundsPage /> },
      { path: 'criticality', element: <CriticalityPage /> },
      { path: 'status-schemes', element: <StatusSchemesPage /> },
      { path: 'catalogs', element: <CatalogsPage /> },
    ],
  },
]);
