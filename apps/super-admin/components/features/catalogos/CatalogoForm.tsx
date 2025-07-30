// src/components/features/catalogos/CatalogoForm.tsx
'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { CheckboxField, FieldWrapper } from '@repo/ui';
import {
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { useCatalogoForm } from './hooks/useCatalogoForm';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { cn } from '@repo/shared';
import { Icon } from '@repo/ui';

// ===============================
// 🎯 TIPOS PARA EL COMPONENTE
// ===============================

interface CatalogoFormProps {
  mode: 'create' | 'edit';
  initialData?: IMaestroCatalogo;
  onSubmit: (data: ICreateMaestroCatalogoRequest | IUpdateMaestroCatalogoRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

// ===============================
// 🎨 COMPONENTE PRINCIPAL
// ===============================

export function CatalogoForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CatalogoFormProps) {
  // ===============================
  // 🪝 HOOK DEL FORMULARIO
  // ===============================

  const {
    form,
    isValid,
    isDirty,
    handleSubmit,
    handleCancel,
    getFieldError,
    isFieldInvalid,
    submitButtonText,
    titleText,
  } = useCatalogoForm({
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
        {/* Campo: Nombre */}
        <FieldWrapper
          label="Nombre del Catálogo"
          helpText="Nombre descriptivo del catálogo. Debe ser único."
          description="Diligencia información detallada del evento que no supere 200 caracteres"
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

        {/* Información adicional para modo edición */}
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
              submitButtonText
            )}
          </Button>
        </div>
      </form>

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && false && (
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

// ===============================
// 🎯 EXPORTACIÓN POR DEFECTO
// ===============================

export default CatalogoForm;
