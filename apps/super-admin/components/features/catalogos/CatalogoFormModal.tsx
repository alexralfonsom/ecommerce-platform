// src/components/features/catalogos/CatalogoFormModal.tsx
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
import {
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { CatalogoForm } from './CatalogoForm';
import { cn } from '@repo/shared';

// ===============================
// 🎯 TIPOS PARA EL MODAL
// ===============================

interface BaseCatalogoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

interface CreateModeProps extends BaseCatalogoFormModalProps {
  mode: 'create';
  initialData?: never;
  onSubmit: (data: ICreateMaestroCatalogoRequest) => void;
}

interface EditModeProps extends BaseCatalogoFormModalProps {
  mode: 'edit';
  onSubmit: (data: IUpdateMaestroCatalogoRequest) => void;
  initialData: IMaestroCatalogo;
}

type CatalogoFormModalProps = CreateModeProps | EditModeProps;

// ===============================
// 🎨 COMPONENTE PRINCIPAL
// ===============================

export function CatalogoFormModal(props: CatalogoFormModalProps) {
  const { isOpen, onClose, mode, isLoading = false, className, title, description } = props;

  const handleSubmit = (data: ICreateMaestroCatalogoRequest | IUpdateMaestroCatalogoRequest) => {
    // TypeScript ahora puede inferir el tipo correcto basado en el mode
    if (mode === 'create') {
      // props es CreateModeProps, onSubmit espera ICreateMaestroCatalogoRequest
      props.onSubmit(data as ICreateMaestroCatalogoRequest);
    } else {
      // props es EditModeProps, onSubmit espera IUpdateMaestroCatalogoRequest
      props.onSubmit(data as IUpdateMaestroCatalogoRequest);
    }
  };

  const initialData = mode === 'edit' ? props.initialData : undefined;

  const handleCancel = () => {
    onClose();
  };

  // ===============================
  // 📝 TEXTOS DINÁMICOS
  // ===============================

  const modalTitle = title || (mode === 'create' ? 'Nuevo Catálogo' : 'Editar Catálogo');
  const modalDescription =
    description ||
    (mode === 'create'
      ? 'Complete la información para crear un nuevo catálogo.'
      : 'Modifique la información del catálogo seleccionado.');

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
            <CatalogoForm
              mode={mode}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}

export default CatalogoFormModal;
