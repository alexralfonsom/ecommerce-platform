// 📁 src/components/ui/FieldWrapper.tsx
'use client';

import React, { cloneElement, isValidElement, useId } from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import { Label } from '@components/ui/label';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  helpText?: string;
  disabled?: boolean;
  id?: string;
}

export function FieldWrapper({
  label,
  required,
  error,
  children,
  className,
  description,
  helpText,
  disabled,
  id: providedId,
}: FieldWrapperProps) {
  const hasError = !!error;
  const generatedId = useId();
  const fieldId = providedId || generatedId;
  const helpTextId = helpText ? `${fieldId}-help` : undefined;
  const errorId = hasError ? `${fieldId}-error` : undefined;

  // ✅ Clonar el children y agregar las props necesarias
  const enhancedChildren = React.Children.map(children, (child) => {
    if (isValidElement(child)) {
      const childProps = child.props as any;
      const ariaDescribedBy =
        [childProps['aria-describedby'], helpTextId, errorId].filter(Boolean).join(' ') ||
        undefined;

      // ✅ Type assertion en cloneElement para evitar errores de TypeScript
      const validProps: Record<string, any> = {
        id: childProps.id || fieldId,
        'aria-invalid': hasError || childProps['aria-invalid'],
        disabled: disabled || childProps.disabled,
      };

      if (ariaDescribedBy) {
        validProps['aria-describedby'] = ariaDescribedBy;
      }

      return cloneElement(child as any, validProps);
    }
    return child;
  });

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        className={cn(
          'block text-sm font-medium leading-6',
          hasError ? 'text-destructive' : 'text-foreground',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Descripción general - NO va en aria-describedby */}
      {description && <p className="text-muted-foreground mb-1 text-xs">{description}</p>}

      <div className="relative">{enhancedChildren}</div>

      {/* Help text - SÍ va en aria-describedby */}
      {helpText && !hasError && (
        <p id={helpTextId} className="text-xs text-blue-600">
          {helpText}
        </p>
      )}

      {/* Error message */}
      {hasError && (
        <div id={errorId} className="text-destructive flex items-center gap-1.5 text-sm">
          <Icon
            name="AlertCircle"
            className="dark:text-destructive-dark text-destructive h-4 w-4 flex-shrink-0"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
