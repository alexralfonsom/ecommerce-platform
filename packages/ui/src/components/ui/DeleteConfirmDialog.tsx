// src/components/ui/DeleteConfirmDialog.tsx
'use client';

import React, { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';

// ===============================
// 🎯 TIPOS PARA EL DIALOG
// ===============================

interface DeleteConfirmDialogProps {
  // Estado del dialog
  isOpen: boolean;
  onClose: () => void;

  // Callbacks
  onConfirm: () => void;

  // Contenido
  title?: string;
  description?: ReactNode;
  itemName?: string;

  // Estados
  isLoading?: boolean;

  // Personalización
  className?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;

  // Variante de peligro
  variant?: 'default' | 'destructive';
}

// ===============================
// 🎨 COMPONENTE PRINCIPAL
// ===============================

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
  className,
  confirmButtonText,
  cancelButtonText,
  variant = 'destructive',
}: DeleteConfirmDialogProps) {
  const t = useTranslations('general.dialogs');
  confirmButtonText = confirmButtonText ?? t('confirmButtonText');
  cancelButtonText = cancelButtonText ?? t('cancelButtonText');
  title = title ?? t('title');

  // ===============================
  // 🎯 MANEJADORES DE EVENTOS
  // ===============================

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // ===============================
  // 📝 CONTENIDO DINÁMICO
  // ===============================

  const finalDescription =
    description ??
    (itemName ? t.rich('message', { itemName: itemName, br: () => <br /> }) : t('message'));

  // ===============================
  // 🎯 RENDER DEL DIALOG
  // ===============================

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className={cn('w-full max-w-md', className)} showCloseButton={!isLoading}>
        {/* Header con icono de advertencia */}
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                variant === 'destructive'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-warning/10 text-warning',
              )}
            >
              <Icon name="AlertTriangle" className="text-destructive h-5 w-5" />
            </div>
            <DialogTitle className="text-foreground text-lg font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Contenido del dialog */}
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">{finalDescription}</p>

          {/* Advertencia adicional */}
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Info" className="text-destructive h-4 w-4 flex-shrink-0" />
              <p className="text-destructive text-xs">{t('generalMessageInfo')}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelButtonText}
          </Button>

          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                <span>{t('labelDeleting')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Icon name="Trash2" className="h-4 w-4 text-white" />
                <span>{confirmButtonText}</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===============================
// 🎯 EXPORTACIÓN POR DEFECTO
// ===============================

export default DeleteConfirmDialog;
