// src/components/layout/HeaderActionsGroup.tsx
'use client';

import { ReactNode } from 'react';
import { cn } from '@repo/shared';
import { Separator } from '@components/ui/separator';

interface HeaderActionsGroupProps {
  children: ReactNode;
  className?: string;
  showSeparators?: boolean;
}

export default function HeaderActionsGroup({
  children,
  className,
  showSeparators = true,
}: HeaderActionsGroupProps) {
  // Convert children to array for separator insertion
  const childrenArray = Array.isArray(children) ? children : [children];
  const filteredChildren = childrenArray.filter(Boolean);

  return (
    <div className={cn('flex items-center gap-x-2 lg:gap-x-3', className)}>
      {showSeparators
        ? filteredChildren.map((child, index) => (
            <div key={index} className="flex h-6 items-center space-x-4">
              {child}
              {/* Add separator after each item except the last */}
              {index < filteredChildren.length - 1 && (
                <Separator orientation="vertical" className="mx-2 mr-2 lg:mx-3" />
              )}
            </div>
          ))
        : filteredChildren}
    </div>
  );
}
