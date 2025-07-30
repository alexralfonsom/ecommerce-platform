'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import Icon from '@components/ui/Icon';

export function ModeToggleLightDark() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="group gap-2 data-[state=open]:bg-accent">
          <Icon name={resolvedTheme === 'dark' ? 'Moon' : 'Sun'} className="h-4 w-4" />
          {/* 📝 Texto del tema actual */}
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}

          {/* 🔽 Chevron indicador de dropdown */}
          <Icon
            name="ChevronDown"
            className="h-3 w-3 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Icon name="Sun" className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Icon name="Moon" className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Icon name="Monitor" className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
