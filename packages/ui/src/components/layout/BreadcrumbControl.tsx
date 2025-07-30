// src/components/ui/BreadcrumbControl.tsx
'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb';
import { useBreadcrumbs } from '@components/layout/hooks/useBreadcrumbs';
import { BreadcrumbProps, IBreadcrumbItem } from '@repo/shared/types/BreadcrumbTypes';
import Link from '@components/ui/Link';

const BreadcrumbControl = memo(function BreadcrumbControl({
  items: externalItems,
  showIcons = false,
  separator = 'chevron',
  maxItems = 4,
  showCurrent = true,
}: BreadcrumbProps) {
  const generatedItems = useBreadcrumbs();
  const items = externalItems || generatedItems;
  console.log('items', items);

  // Truncar items si es necesario
  const displayItems = useMemo(() => {
    if (!maxItems || items.length <= maxItems) return items;

    const truncated = [...items];
    const homeItem = truncated.shift();
    const currentItem = truncated.pop();

    const keepCount = Math.max(1, maxItems - 4);
    const middle = truncated.slice(0, keepCount);

    return [
      homeItem!,
      ...middle,
      {
        name: '...',
        href: '#',
        current: false,
        disabled: true,
      } as IBreadcrumbItem,
      ...truncated.slice(-1),
      currentItem!,
    ];
  }, [items, maxItems]);

  const renderSeparator = useCallback(() => {
    const iconMap = {
      chevron: 'ChevronRight',
      slash: 'Slash',
      arrow: 'ArrowRight',
    } as const;

    return (
      <BreadcrumbSeparator>
        <Icon name={iconMap[separator]} aria-hidden="true" />
      </BreadcrumbSeparator>
    );
  }, [separator]);

  const currentPageIndex = displayItems.findIndex((item) => item.current);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isFirst = index === 0;

          return (
            <React.Fragment key={`${item.name}-${index}`}>
              {!isFirst && renderSeparator()}
              <BreadcrumbItem>
                {item.current ? (
                  <BreadcrumbPage className="inline-flex items-center gap-1">
                    {(isFirst || (showIcons && item.icon)) && (
                      <Icon name={item.icon as any} className={cn('h-5 w-5', !isFirst && 'mr-2')} />
                    )}
                    {!isFirst && item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href ?? '#'}
                      className={cn(
                        item.disabled && 'pointer-events-none opacity-50',
                        'inline-flex items-center gap-1',
                      )}
                      aria-label={isFirst ? item.name : undefined}
                    >
                      {(isFirst || (showIcons && item.icon)) && (
                        <Icon
                          name={item.icon as any}
                          className={cn('h-5 w-5', !isFirst && 'mr-2')}
                        />
                      )}
                      {!isFirst && item.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

export default BreadcrumbControl;
