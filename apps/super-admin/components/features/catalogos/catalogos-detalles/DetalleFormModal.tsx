'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@repo/ui';
import { cn } from '@repo/shared';
import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { DetalleForm } from '@components/features/catalogos/catalogos-detalles/DetalleForm';

// ===============================
// 🎯 TIPOS PARA EL MODAL
// ===============================

interface BaseDetalleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
  initialData?: IMaestroCatalogoDetalle;
  idMaestro?: number; // Para modo create
}

interface CreateModeProps extends BaseDetalleFormModalProps {
  mode: 'create';
  onSubmit: (data: ICreateMaestroCatalogoDetalleRequest) => void; // Reemplaza 'any' con el tipo correcto
}

interface EditModeProps extends BaseDetalleFormModalProps {
  mode: 'edit';
  onSubmit: (data: any) => void; // Reemplaza 'any' con el tipo correcto
}

type DetalleFormModalProps = CreateModeProps | EditModeProps;

// ===============================
// 🎨 COMPONENTE PRINCIPAL
// ===============================

export function DetalleFormModal(props: DetalleFormModalProps) {
  const {
    isOpen,
    onClose,
    mode,
    isLoading = false,
    className,
    title,
    description,
    initialData,
    idMaestro,
  } = props;

  const handleSubmit = (
    data: ICreateMaestroCatalogoDetalleRequest | IUpdateMaestroCatalogoDetalleRequest,
  ) => {
    // TypeScript ahora puede inferir el tipo correcto basado en el mode
    if (mode === 'create') {
      // props es CreateModeProps, onSubmit espera ICreateMaestroCatalogoDetalleRequest
      props.onSubmit(data as ICreateMaestroCatalogoDetalleRequest);
    } else {
      // props es EditModeProps, onSubmit espera IUpdateMaestroCatalogoDetalleRequest
      props.onSubmit(data as IUpdateMaestroCatalogoDetalleRequest);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // ===============================
  // 📝 TEXTOS DINÁMICOS
  // ===============================

  const modalTitle =
    title || (mode === 'create' ? 'Nuevo Elemento de Catálogo' : 'Editar Elemento de Catálogo');
  const modalDescription =
    description ||
    (mode === 'create'
      ? 'Complete la información para crear un nuevo elemento de catálogo.'
      : 'Modifique la información del elemento de catálogo seleccionado.');

  // ===============================
  // 🎯 RENDER DEL MODAL
  // ===============================

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogOverlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0">
        <DialogContent
          className={cn('max-h-[90vh] w-full max-w-lg overflow-y-auto', className)}
          showCloseButton={!isLoading}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <DetalleForm
              mode={mode}
              idMaestro={idMaestro}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}

export default DetalleFormModal;
