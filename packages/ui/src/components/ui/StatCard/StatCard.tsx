// src/components/ui/StatCard/ModernStatCard.tsx
'use client';

import React, { memo } from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@components/ui/card';

// ===============================
// 🎯 TYPES & INTERFACES
// ===============================

export type StatCardColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'indigo';

export type StatCardSize = 'sm' | 'md' | 'lg';

export interface StatCardItem {
  // Core data
  id?: string;
  title: string;
  value: string | number;

  // Visual
  icon?: keyof typeof LucideIcons;
  color?: StatCardColor;

  // Content sections
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;

  // Trend/Change indicator
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };

  // Behavior
  onClick?: () => void;
  href?: string;

  // Footer action
  footerAction?: {
    label: string;
    onClick: () => void;
    icon?: keyof typeof LucideIcons;
  };

  // Formatting
  formatValue?: (value: string | number) => string;
  loading?: boolean;
}

export interface ModernStatCardProps {
  // Data
  items: StatCardItem[];

  // Layout
  size?: StatCardSize;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'sm' | 'md' | 'lg';

  // Behavior
  loading?: boolean;
  error?: any | null | undefined;
  onItemClick?: (item: StatCardItem, index: number) => void;

  // Styling
  className?: string;
  cardClassName?: string;

  // Features
  showAnimation?: boolean;

  // Accessibility
  ariaLabel?: string;
}

// ===============================
// 🎨 COLOR MAPPINGS
// ===============================

const colorMappings = {
  blue: {
    icon: 'bg-blue-500 text-white',
    trend: {
      up: 'text-blue-600',
      down: 'text-blue-600',
      neutral: 'text-blue-600',
    },
    accent: 'text-blue-600',
  },
  green: {
    icon: 'bg-green-500 text-white',
    trend: {
      up: 'text-green-600',
      down: 'text-green-600',
      neutral: 'text-green-600',
    },
    accent: 'text-green-600',
  },
  red: {
    icon: 'bg-red-500 text-white',
    trend: {
      up: 'text-red-600',
      down: 'text-red-600',
      neutral: 'text-red-600',
    },
    accent: 'text-red-600',
  },
  purple: {
    icon: 'bg-purple-500 text-white',
    trend: {
      up: 'text-purple-600',
      down: 'text-purple-600',
      neutral: 'text-purple-600',
    },
    accent: 'text-purple-600',
  },
  orange: {
    icon: 'bg-orange-500 text-white',
    trend: {
      up: 'text-orange-600',
      down: 'text-orange-600',
      neutral: 'text-orange-600',
    },
    accent: 'text-orange-600',
  },
  teal: {
    icon: 'bg-teal-500 text-white',
    trend: {
      up: 'text-teal-600',
      down: 'text-teal-600',
      neutral: 'text-teal-600',
    },
    accent: 'text-teal-600',
  },
  pink: {
    icon: 'bg-pink-500 text-white',
    trend: {
      up: 'text-pink-600',
      down: 'text-pink-600',
      neutral: 'text-pink-600',
    },
    accent: 'text-pink-600',
  },
  indigo: {
    icon: 'bg-indigo-500 text-white',
    trend: {
      up: 'text-indigo-600',
      down: 'text-indigo-600',
      neutral: 'text-indigo-600',
    },
    accent: 'text-indigo-600',
  },
} as const;

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

// ===============================
// 🧩 SINGLE CARD COMPONENT
// ===============================

interface SingleStatCardProps {
  item: StatCardItem;
  size: StatCardSize;
  showAnimation: boolean;
  onClick?: (item: StatCardItem) => void;
  className?: string;
}

const SingleStatCard = memo<SingleStatCardProps>(function SingleStatCard({
  item,
  size,
  showAnimation,
  onClick,
  className,
}) {
  const colorConfig = colorMappings[item.color || 'blue'];

  // Format value
  const formatValue = (value: string | number): string => {
    if (item.formatValue) {
      return item.formatValue(value);
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  };

  // Render trend indicator
  const renderTrend = () => {
    if (!item.trend) return null;

    const { value, direction, label } = item.trend;
    const trendColor = colorConfig.trend[direction];

    return (
      <div className="flex items-center gap-1">
        <Icon
          name={direction === 'up' ? 'TrendingUp' : direction === 'down' ? 'TrendingDown' : 'Minus'}
          className={cn('h-4 w-4', trendColor)}
        />
        <span className={cn('text-sm font-medium', trendColor)}>
          {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
          {Math.abs(value)}%
        </span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    );
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-lg bg-muted"></div>
        <div className="h-4 w-16 rounded bg-muted"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted"></div>
        <div className="h-8 w-1/2 rounded bg-muted"></div>
      </div>
      <div className="h-4 w-1/3 rounded bg-muted"></div>
    </div>
  );

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (onClick) {
      onClick(item);
    }
  };

  const handleFooterAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.footerAction?.onClick) {
      item.footerAction.onClick();
    }
  };

  const isClickable = Boolean(item.onClick || onClick || item.href);

  if (item.loading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        // Base card styles usando Shadcn tokens
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'transition-all duration-200 ease-in-out',

        // Interactive states
        isClickable && [
          'cursor-pointer hover:border-primary/20 hover:shadow-md',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        ],

        // Animation
        showAnimation && 'hover:-translate-y-0.5',

        className,
      )}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Header Section */}
      <CardHeader className="px-6">
        {item.header || (
          <div className="flex items-center space-x-4">
            {/* Icon */}
            {item.icon && (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  colorConfig.icon,
                )}
              >
                <Icon name={item.icon} className={cn('h6 w-6', colorConfig.icon)} />
              </div>
            )}

            <CardTitle className="text-md font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
          </div>
        )}
      </CardHeader>

      {/* Content Section */}
      <CardContent className="pl-6">
        {item.content || (
          <div className="justify-between space-y-1">
            <p className="text-2xl font-bold text-foreground">{formatValue(item.value)}</p>
            {/* Trend */}
            {renderTrend()}
          </div>
        )}
      </CardContent>

      {/* Footer Section */}
      {(item.footer || item.footerAction) && (
        <CardFooter className="px-6">
          {item.footer || (
            <button
              onClick={handleFooterAction}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors',
                colorConfig.accent,
                'hover:underline focus:underline focus:outline-none',
              )}
            >
              {item.footerAction?.label}
              {item.footerAction?.icon && (
                <Icon name={item.footerAction.icon} className="h-4 w-4" />
              )}
            </button>
          )}
        </CardFooter>
      )}
    </Card>
  );
});

// ===============================
// 🎯 MAIN COMPONENT
// ===============================

const StatCard = memo<ModernStatCardProps>(function ModernStatCard({
  items,
  size = 'md',
  columns = 'auto',
  gap = 'md',
  loading = false,
  error,
  onItemClick,
  className,
  cardClassName,
  showAnimation = true,
  ariaLabel,
}) {
  // Loading state
  if (loading) {
    const skeletonItems = Array.from({ length: 4 }, (_, i) => ({
      id: `skeleton-${i}`,
      title: '',
      value: 0,
      loading: true,
    }));

    return (
      <div
        className={cn('grid', gridColumns[columns], gapClasses[gap], className)}
        aria-label={ariaLabel || 'Cargando estadísticas'}
      >
        {skeletonItems.map((item) => (
          <SingleStatCard
            key={item.id}
            item={item}
            size={size}
            showAnimation={false}
            className={cardClassName}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'col-span-full rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center',
          className,
        )}
      >
        <Icon name="AlertCircle" className="mx-auto mb-2 h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div
        className={cn(
          'col-span-full rounded-lg border border-border bg-muted/50 p-6 text-center',
          className,
        )}
      >
        <Icon name="BarChart3" className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div
      className={cn('grid', gridColumns[columns], gapClasses[gap], className)}
      role="group"
      aria-label={ariaLabel || 'Estadísticas del sistema'}
    >
      {items.map((item, index) => (
        <SingleStatCard
          key={item.id || `stat-${index}`}
          item={item}
          size={size}
          showAnimation={showAnimation}
          onClick={onItemClick ? (item) => onItemClick(item, index) : undefined}
          className={cardClassName}
        />
      ))}
    </div>
  );
});

StatCard.displayName = 'ModernStatCard';

export default StatCard;
