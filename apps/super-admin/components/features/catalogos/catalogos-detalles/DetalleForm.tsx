'use client';

import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { useCatalogoDetallesForm } from '@components/features/catalogos/hooks/useCatalogoDetallesForm';
import { cn } from '@repo/shared';
import { Input } from '@repo/ui';
import { CheckboxField, FieldWrapper, LabelField } from '@repo/ui';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Button } from '@repo/ui';
import { Icon } from '@repo/ui';
import { Textarea } from '@repo/ui';

interface DetailFormProps {
  mode: 'create' | 'edit';
  initialData?: IMaestroCatalogoDetalle;
  onSubmit: (
    data: ICreateMaestroCatalogoDetalleRequest | IUpdateMaestroCatalogoDetalleRequest,
  ) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  idMaestro?: number; // Para modo create
}

export function DetalleForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
  idMaestro,
}: DetailFormProps) {
  const { form, isValid, isDirty, handleSubmit, handleCancel, getFieldError, isFieldInvalid } =
    useCatalogoDetallesForm({
      mode,
      initialData,
      onSubmit,
      onCancel,
    });

  const { register, control, formState } = form;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Formulario */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <LabelField
          label="ID del maestro"
          value={
            mode === 'create'
              ? (idMaestro ?? 'invalid')
              : initialData?.idMaestro != undefined
                ? String(initialData.idMaestro)
                : 'invalid'
          }
          icon="Hash"
          copyable
          valueVariant="code"
          description="Identificador único del registro"
        />

        <FieldWrapper
          label="Nombre del elemento"
          description="Diligencia información detallada del elemento del catalago que no supere 255 caracteres"
          required
          error={getFieldError('nombre')}
        >
          <Input
            {...register('nombre')}
            type="text"
            placeholder="Ingrese el nombre del catálogo"
            disabled={isLoading}
            aria-invalid={isFieldInvalid('nombre')}
            className={cn(
              isFieldInvalid('nombre') &&
                'border-destructive ring-destructive/20 placeholder:text-destructive',
            )}
          />
        </FieldWrapper>
        {/* Campo: Estado Activo */}
        <Controller
          name="activo"
          control={control}
          render={({ field }) => (
            <CheckboxField
              label="Catálogo activo"
              description="Los catálogos inactivos no aparecerán en las listas de selección"
              error={getFieldError('activo')}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isLoading}
              aria-invalid={isFieldInvalid('activo')}
            />
          )}
        />

        <FieldWrapper label="Codigo del elemento" error={getFieldError('codigo')}>
          <Textarea
            {...register('codigo')}
            placeholder="Ingrese el código del elemento del catálogo"
            disabled={isLoading}
            aria-invalid={isFieldInvalid('codigo')}
            className={cn(
              isFieldInvalid('codigo') &&
                'border-destructive ring-destructive/20 placeholder:text-destructive',
            )}
          />
        </FieldWrapper>

        <FieldWrapper label="Evento del elemento" error={getFieldError('evento')}>
          <Textarea
            {...register('evento')}
            placeholder="Ingrese el evento del elemento del catálogo"
            disabled={isLoading}
            aria-invalid={isFieldInvalid('evento')}
            className={cn(
              isFieldInvalid('evento') &&
                'border-destructive ring-destructive/20 placeholder:text-destructive',
            )}
          />
        </FieldWrapper>

        {mode === 'edit' && initialData && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <h4 className="text-sm font-medium text-foreground">Información del registro</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono">{initialData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Creado:</span>
                <span>{new Date(initialData.fechaCreacion).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Por:</span>
                <span>{initialData.creadoPor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 border-t pt-6">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'texto'
            )}
          </Button>
        </div>
      </form>
      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 rounded bg-muted/30 p-4 text-xs">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            Estado del formulario (Dev)
          </summary>
          <pre className="mt-2 text-xs">
            {JSON.stringify(
              {
                isValid,
                isDirty,
                errors: formState.errors,
                values: form.watch(),
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

export default DetalleForm;
