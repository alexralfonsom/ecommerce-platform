// src/components/ui/FormFieldWrapper.tsx
'use client';

import React from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label: string;
  description?: string;
  helpText?: string;
  className?: string;
  labelClassName?: string;
  labelSuffix?: React.ReactNode;
  render: ({ field }: { field: any }) => React.ReactElement;
}

// Componente interno para el mensaje de error con icono
function FormErrorMessage() {
  const { error } = useFormField();

  if (!error) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-destructive">
      <Icon name="AlertCircle" className="h-4 w-4 flex-shrink-0 text-destructive" />
      <FormMessage />
    </div>
  );
}

export function FormFieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  helpText,
  className,
  labelClassName,
  labelSuffix,
  render,
}: FormFieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('space-y-1', className)}>
          <div className="flex items-center justify-between">
            <FormLabel className={cn('text-sm leading-4 font-medium', labelClassName)}>
              {label}
            </FormLabel>
            {labelSuffix && <div>{labelSuffix}</div>}
          </div>

          {description && (
            <FormDescription className="text-xs text-muted-foreground">
              {description}
            </FormDescription>
          )}

          <FormControl>{render({ field })}</FormControl>

          {/* Help text solo se muestra cuando NO hay error */}
          {helpText && !fieldState.error && <div className="text-xs text-blue-600">{helpText}</div>}

          <FormErrorMessage />
        </FormItem>
      )}
    />
  );
}
