'use client';

import React from 'react';
import { cn } from '@repo/shared';
import { Label } from '@components/ui/label';
import Icon from '@components/ui/Icon';
import * as LucideIcons from 'lucide-react';

interface LabelFieldProps {
  label: string;
  value: string | number;
  description?: string;
  helpText?: string;
  className?: string;
  /**
   * Icono que se mostrará junto al valor
   */
  icon?: keyof typeof LucideIcons;
  /**
   * Estilo del valor mostrado
   */
  valueVariant?: 'default' | 'code' | 'badge' | 'highlight';
  /**
   * Tamaño del campo
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Si se puede copiar el valor al clipboard
   */
  copyable?: boolean;
}

export function LabelField({
  label,
  value,
  description,
  helpText,
  className,
  icon,
  valueVariant = 'default',
  size = 'md',
  copyable = false,
}: LabelFieldProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Estilos según el tamaño
  const sizeStyles = {
    sm: {
      label: 'text-xs',
      value: 'text-sm',
      spacing: 'space-y-1',
    },
    md: {
      label: 'text-sm',
      value: 'text-base',
      spacing: 'space-y-2',
    },
    lg: {
      label: 'text-base',
      value: 'text-lg',
      spacing: 'space-y-2',
    },
  };

  const valueStyles = {
    default: 'text-foreground',
    code: 'font-mono text-foreground bg-muted/50 px-2 py-1 rounded text-sm',
    badge:
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground',
    highlight: 'text-primary font-medium',
  };

  return (
    <div className={cn(sizeStyles[size].spacing, className)}>
      {/* Label */}
      <Label
        className={cn('block leading-6 font-medium', sizeStyles[size].label, 'text-foreground')}
      >
        {label}
      </Label>
      {/* Descripción general */}
      {description && <p className="mb-1 text-xs text-muted-foreground">{description}</p>}
      {/* Valor */}
      <div className="flex items-center gap-2">
        {/* Icono opcional */}
        {icon && <Icon name={icon} className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}

        {/* Valor principal */}
        <span
          className={cn(
            sizeStyles[size].value,
            valueStyles[valueVariant],
            'select-all', // Permite seleccionar el texto fácilmente
          )}
        >
          {value}
        </span>

        {/* Botón de copiar */}
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-muted/80',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none',
            )}
            title={copied ? 'Copiado!' : 'Copiar valor'}
          >
            <Icon
              name={copied ? 'Check' : 'Copy'}
              className={cn('h-3 w-3', copied ? 'text-green-600' : 'text-muted-foreground')}
            />
          </button>
        )}
      </div>

      {/* Help text */}
      {helpText && <p className="text-xs text-blue-600">{helpText}</p>}
    </div>
  );
}
