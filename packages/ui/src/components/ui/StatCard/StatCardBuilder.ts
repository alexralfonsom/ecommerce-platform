// src/components/ui/StatCard/StatCardBuilder.ts

import { StatCardColor, StatCardItem } from './StatCard';
import * as LucideIcons from 'lucide-react';
import { ReactNode } from 'react';

export class StatCardBuilder {
  private item: Partial<StatCardItem> = {};

  static create(): StatCardBuilder {
    return new StatCardBuilder();
  }

  title(title: string): StatCardBuilder {
    this.item.title = title;
    return this;
  }

  value(value: string | number): StatCardBuilder {
    this.item.value = value;
    return this;
  }

  icon(icon: keyof typeof LucideIcons): StatCardBuilder {
    this.item.icon = icon;
    return this;
  }

  color(color: StatCardColor): StatCardBuilder {
    this.item.color = color;
    return this;
  }

  id(id: string): StatCardBuilder {
    this.item.id = id;
    return this;
  }

  trend(value: number, direction: 'up' | 'down' | 'neutral', label?: string): StatCardBuilder {
    this.item.trend = { value, direction, label };
    return this;
  }

  onClick(handler: () => void): StatCardBuilder {
    this.item.onClick = handler;
    return this;
  }

  href(href: string): StatCardBuilder {
    this.item.href = href;
    return this;
  }

  loading(loading = true): StatCardBuilder {
    this.item.loading = loading;
    return this;
  }

  formatter(formatter: (value: string | number) => string): StatCardBuilder {
    this.item.formatValue = formatter;
    return this;
  }

  footerAction(
    label: string,
    onClick: () => void,
    icon?: keyof typeof LucideIcons,
  ): StatCardBuilder {
    this.item.footerAction = { label, onClick, icon };
    return this;
  }

  header(content: ReactNode): StatCardBuilder {
    this.item.header = content;
    return this;
  }

  content(content: ReactNode): StatCardBuilder {
    this.item.content = content;
    return this;
  }

  footer(content: ReactNode): StatCardBuilder {
    this.item.footer = content;
    return this;
  }

  build(): StatCardItem {
    if (!this.item.title || this.item.value === undefined) {
      throw new Error('StatCard requiere al menos title y value');
    }

    return {
      color: 'blue',
      ...this.item,
    } as StatCardItem;
  }
}

// ===============================
// HELPER FUNCTION
// ===============================

export function createStatCardItem(
  title: string,
  value: string | number,
  options: Partial<StatCardItem> = {},
): StatCardItem {
  return {
    title,
    value,
    color: 'blue',
    ...options,
  };
}

// ===============================
// PRESET BUILDERS
// ===============================

export const StatCardPresets = {
  // Financial metrics
  revenue: (
    amount: number,
    currency = 'USD',
    trend?: { value: number; direction: 'up' | 'down' | 'neutral' },
  ) =>
    createStatCardItem('Total Revenue', amount, {
      icon: 'DollarSign',
      color: 'green',
      trend,
      formatValue: (value) => `$${Number(value).toLocaleString()}`,
      footerAction: { label: 'View details', onClick: () => console.log('View revenue details') },
    }),

  customers: (count: number, trend?: { value: number; direction: 'up' | 'down' | 'neutral' }) =>
    createStatCardItem('Total Customers', count, {
      icon: 'Users',
      color: 'blue',
      trend,
      footerAction: { label: 'View all', onClick: () => console.log('View all customers') },
    }),

  orders: (count: number, trend?: { value: number; direction: 'up' | 'down' | 'neutral' }) =>
    createStatCardItem('Orders', count, {
      icon: 'ShoppingCart',
      color: 'purple',
      trend,
      footerAction: { label: 'Manage orders', onClick: () => console.log('Manage orders') },
    }),

  growth: (percentage: number, trend?: { value: number; direction: 'up' | 'down' | 'neutral' }) =>
    createStatCardItem('Growth Rate', `${percentage}%`, {
      icon: 'TrendingUp',
      color: 'green',
      trend,
      footerAction: { label: 'View analytics', onClick: () => console.log('View analytics') },
    }),

  // Catalog specific presets
  catalogs: {
    total: (count: number) =>
      createStatCardItem('Total Catálogos', count, {
        icon: 'FolderOpen',
        color: 'blue',
        id: 'total-catalogs',
        footerAction: { label: 'Ver todos', onClick: () => console.log('Ver todos los catálogos') },
      }),

    active: (count: number, trend?: { value: number; direction: 'up' | 'down' | 'neutral' }) =>
      createStatCardItem('Catálogos Activos', count, {
        icon: 'CheckCircle',
        color: 'green',
        id: 'active-catalogs',
        trend,
        footerAction: { label: 'Filtrar activos', onClick: () => console.log('Filtrar activos') },
      }),

    inactive: (count: number) =>
      createStatCardItem('Catálogos Inactivos', count, {
        icon: 'XCircle',
        color: 'red',
        id: 'inactive-catalogs',
        footerAction: {
          label: 'Gestionar inactivos',
          onClick: () => console.log('Gestionar inactivos'),
        },
      }),

    recent: (count: number, period = '7d') =>
      createStatCardItem('Recientes', count, {
        icon: 'Clock',
        color: 'purple',
        id: 'recent-catalogs',
        footerAction: { label: `Últimos ${period}`, onClick: () => console.log('Ver recientes') },
      }),
  },
};
