// src/components/ui/StatCard/index.ts

export type { StatCardItem, StatCardColor, StatCardSize, ModernStatCardProps } from './StatCard';

// Builder helper functions
export { StatCardBuilder, createStatCardItem } from './StatCardBuilder';

// Hook for data management
export { useStatCardData } from './useStatCardData';

// ===============================
// QUICK IMPORT ALIASES
// ===============================

// For easy importing
export { default as StatCard } from './StatCard';

// ===============================
// EJEMPLOS DE USO
// ===============================

/*
// 1. USO BÁSICO:
import { ModernStatCard, createStatCardItem } from '@components/ui/StatCard';

const basicStats = [
  createStatCardItem('Total Revenue', '$1,250.00', {
    icon: 'DollarSign',
    color: 'green',
    trend: { value: 12.5, direction: 'up', label: 'from last month' },
    footerAction: { label: 'View details', onClick: () => console.log('View details') }
  }),
  createStatCardItem('New Customers', '1,234', {
    icon: 'Users',
    color: 'blue',
    trend: { value: 20, direction: 'down', label: 'this period' },
    footerAction: { label: 'View all', onClick: () => console.log('View all') }
  }),
];

<ModernStatCard items={basicStats} />

// ===============================
// 2. USO CON BUILDER PATTERN:
const advancedStats = [
  StatCardBuilder.create()
    .title('Active Accounts')
    .value('45,678')
    .icon('Activity')
    .color('purple')
    .trend(12.5, 'up', 'this month')
    .footerAction('Strong user retention', () => handleViewDetails())
    .build(),
];

<ModernStatCard
  items={advancedStats}
  columns={3}
  gap="lg"
  showAnimation={true}
/>

// ===============================
// 3. USO CON CUSTOM CONTENT:
const customStats = [
  {
    title: 'Growth Rate',
    value: '4.5%',
    icon: 'TrendingUp' as const,
    color: 'green' as const,
    header: (
      <div className="flex justify-between">
        <h3 className="font-semibold">Custom Header</h3>
        <span className="text-xs text-green-600">+4.5%</span>
      </div>
    ),
    content: (
      <div>
        <p className="text-3xl font-bold">4.5%</p>
        <p className="text-sm text-muted-foreground">Steady performance increase</p>
      </div>
    ),
    footer: (
      <button className="text-sm text-blue-600 hover:underline">
        Meets growth projections →
      </button>
    ),
  },
];

<ModernStatCard items={customStats} />

// ===============================
// 4. USO EN TU PÁGINA DE CATÁLOGOS:
const catalogStats = [
  createStatCardItem('Total Catálogos', statsData.total, {
    icon: 'FolderOpen',
    color: 'blue',
    footerAction: {
      label: 'Ver todos',
      onClick: () => router.push('/catalogos')
    }
  }),
  createStatCardItem('Activos', statsData.active, {
    icon: 'CheckCircle',
    color: 'green',
    trend: { value: statsData.trends.active.value, direction: statsData.trends.active.direction },
    footerAction: {
      label: 'Filtrar activos',
      onClick: () => applyFilter('active')
    }
  }),
  createStatCardItem('Inactivos', statsData.inactive, {
    icon: 'XCircle',
    color: 'red',
    footerAction: {
      label: 'Gestionar inactivos',
      onClick: () => toast.warning('Gestionando inactivos...')
    }
  }),
  createStatCardItem('Recientes', statsData.recent, {
    icon: 'Clock',
    color: 'purple',
    footerAction: {
      label: 'Ver cambios recientes',
      onClick: () => showRecentChanges()
    }
  }),
];

// En tu página:
<ModernStatCard
  items={catalogStats}
  loading={loading}
  columns="auto"
  gap="md"
  onItemClick={(item, index) => handleStatClick(item, index)}
  className="mb-8"
/>
*/
