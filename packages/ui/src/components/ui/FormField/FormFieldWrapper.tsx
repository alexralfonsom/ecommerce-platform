// src/components/ui/FormFieldWrapper.tsx
'use client';

import React from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@components/ui/form';

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  description?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  labelClassName?: string;
  // Para elementos que van junto al label (como "Forgot Password")
  labelSuffix?: React.ReactNode;
}

// Componente interno para el mensaje de error con icono
function FormErrorMessage() {
  const { error } = useFormField();

  if (!error) return null;

  return (
    <div className="text-destructive flex items-center gap-1.5 text-sm">
      <Icon name="AlertCircle" className="text-destructive h-4 w-4 flex-shrink-0" />
      <FormMessage />
    </div>
  );
}

export function FormFieldWrapper({
  label,
  required = false,
  description,
  helpText,
  disabled = false,
  className,
  children,
  labelClassName,
  labelSuffix,
}: FormFieldWrapperProps) {
  return (
    <FormItem className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <FormLabel
          className={cn(
            'text-sm font-medium leading-4',
            disabled && 'cursor-not-allowed opacity-50',
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
        {labelSuffix && <div>{labelSuffix}</div>}
      </div>

      {/* Descripción general - NO interfiere con la validación */}
      {description && (
        <FormDescription className="text-muted-foreground text-xs">{description}</FormDescription>
      )}

      <FormControl>{children}</FormControl>

      {/* Help text personalizado - Se muestra solo cuando NO hay error */}
      {helpText && <div className="text-xs text-blue-600 empty:hidden">{helpText}</div>}

      {/* Error message con icono automático - Solo aparece cuando hay error */}
      <FormErrorMessage />
    </FormItem>
  );
}
