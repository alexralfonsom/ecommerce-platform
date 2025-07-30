// src/components/ui/Icon.tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@repo/shared';
import * as LucideIcons from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?:
    | number
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | '8xl';
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'muted'
    | 'accent';
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
  '7xl': 112,
  '8xl': 128,
};

const variantMap = {
  default: 'text-slate-700 dark:text-slate-300', // Visible en ambos modos
  primary: 'text-blue-600 dark:text-blue-400', // Primary consistente
  secondary: 'text-slate-500 dark:text-slate-400', // Secundario consistente
  muted: 'text-slate-400 dark:text-slate-500', // Texto apagado
  accent: 'text-purple-600 dark:text-purple-400', // Accent color

  // 🎯 Estados con colores que siempre se ven
  success: 'text-green-600 dark:text-green-400', // Verde consistente
  warning: 'text-yellow-600 dark:text-yellow-400', // Amarillo consistente
  error: 'text-red-600 dark:text-red-400', // Rojo consistente
};

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', variant = 'default', className, ...props }, ref) => {
    // Obtener el componente dinámicamente
    const IconComponent = LucideIcons[name] as React.ComponentType<any>;

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found`);
      return null;
    }

    const iconSize = typeof size === 'number' ? size : sizeMap[size];

    return (
      <IconComponent
        aria-hidden="true"
        ref={ref}
        size={iconSize}
        className={cn(variantMap[variant], 'transition-colors duration-200', className)}
        {...props}
      />
    );
  },
);

Icon.displayName = 'Icon';

export default Icon;
