'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PagesHeader } from '@repo/ui';
import { HeaderAction } from '@repo/shared/types/PagesHeader';
import { DetallesList } from '@components/features/catalogos/catalogos-detalles/DetalleList';
import { useCatalogosDetalles } from '@components/features/catalogos/hooks/useCatalogosDetalles';
import React, { useMemo } from 'react';
import { useCatalogosDetalleSimple } from '@components/features/catalogos/hooks/useCatalogosDetallesQueries';
import { createStatCardItem, StatCard } from '@repo/ui';
import { cn } from '@repo/shared';
import { Backgrounds, Borders } from '@repo/ui/configs/DesignSystem';
import DetalleFormModal from '@components/features/catalogos/catalogos-detalles/DetalleFormModal';
import { useDeleteDialogDescription } from '@repo/shared/lib/hooks';
import { DeleteConfirmDialog } from '@repo/ui';

export default function CatalogoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('catalogs');

  const catalogoId = parseInt(params?.id as string);

  const handleBack = (fallbackRoute = '/catalogs') => {
    if (window.history.length > 1) {
      router.back(); // Vuelve a la página anterior
    } else {
      router.push(fallbackRoute); // Fallback a la lista de catálogos
    }
  };

  // ✅ 1. DATA LAYER: Obtener datos de la API
  const {
    items,
    isLoading,
    error,
    isRefetching,

    // 🚀 Acciones automáticas (conectadas a tu API)
    create,
    update,
    delete: deleteDetalle,
    refetch,
    isDeleting,
    // Funcionalidades específicas de catálogos
    toggleStatus,
  } = useCatalogosDetalleSimple(catalogoId, true);

  // ✅ 2. UNIFIED HOOK: Table + Actions en uno solo
  const {
    table,
    selectedRowsCount,
    batchActions,
    deleteDialog,
    batchDeleteDialog,
    createModal,
    editModal,
    handleRefresh,
  } = useCatalogosDetalles({
    idMaestro: catalogoId,
    idMaestroCatalogo: catalogoId,
    data: items,
    loading: isLoading,
    onRefresh: refetch,
    toggleStatus,
    deleteCatalogoDetalle: deleteDetalle,
    createCatalogoDetalle: create,
    updateCatalogoDetalle: update,
  });

  const batchDeleteDescription = useDeleteDialogDescription({
    translationObject: 'catalogs.dialogs.detail',
    translationKey: 'batch.description',
    mode: 'batch',
    selectedCount: batchDeleteDialog.selectedCount,
    selectedItems: batchDeleteDialog.selectedItems,
  });

  const individualDeleteDescription = useDeleteDialogDescription({
    translationObject: 'catalogs.dialogs.detail',
    translationKey: 'individual.description',
    mode: 'individual',
    itemName: deleteDialog.detalle?.nombre || '',
  });

  const statCardItems = useMemo(() => {
    const totalCount = items?.length || 0;
    const activeCount = items?.filter((item) => item.activo)?.length || 0;
    const inactiveCount = totalCount - activeCount;

    return [
      createStatCardItem('Total de Registros', totalCount, {
        id: 'total-catalogs-detalles',
        icon: 'FolderOpen',
        color: 'blue',
      }),
      createStatCardItem('Elementos Activos', activeCount, {
        id: 'active-catalogs-detalles',
        icon: 'CheckCircle',
        color: 'green',
      }),
      createStatCardItem('Elementos Inactivos', inactiveCount, {
        id: 'inactive-catalogs-detalles',
        icon: 'XCircle',
        color: 'red',
      }),
    ];
  }, [items, selectedRowsCount]);

  // Acciones del header
  const headerActions: HeaderAction[] = [
    {
      id: 'refresh',
      label: 'Actualizar',
      icon: 'RefreshCw',
      variant: 'ghost',
      iconOnly: true,
      onClick: handleRefresh,
      title: 'Actualizar lista',
      disabled: isLoading || isRefetching,
    },
    {
      id: 'back',
      label: 'Volver',
      icon: 'ArrowLeft',
      variant: 'ghost',
      iconOnly: false,
      onClick: handleBack,
      title: 'Volver al catálogo',
      disabled: isLoading || isRefetching,
    },
  ];

  const primaryAction: HeaderAction = {
    id: 'create',
    label: 'Nuevo Detalle',
    icon: 'Plus',
    variant: 'default',
    iconPosition: 'leading',
    onClick: createModal.onOpen,
  };

  return (
    <>
      <PagesHeader
        title={t('details.title')}
        description={t('details.description')}
        showActions={true}
        actions={headerActions}
        primaryAction={primaryAction}
        subtitle={
          <div className="flex items-center gap-6">
            <span>{t('details.description')}</span>
          </div>
        }
        loading={isLoading}
        variant="default"
        size="md"
        actionsPosition="right"
        showAnimation={true}
        className="mb-6"
      />
      <div>
        <StatCard
          items={statCardItems}
          loading={isLoading}
          error={error ? error : null}
          columns="auto"
          gap="md"
          showAnimation={true}
          className="mb-8"
          aria-label={t('details.statCardLabel')}
        />
        <div className="space-y-4">
          <DetallesList
            table={table}
            loading={isLoading}
            error={error ? error : null}
            batchActions={batchActions}
            selectedRowsCount={selectedRowsCount}
          />
        </div>
        <div
          className={cn(
            Backgrounds.elevated,
            Borders.radius.lg,
            Borders.shadow.md,
            Borders.border.default,
          )}
        ></div>
      </div>

      {/* ✅ 3. MODALS */}
      <DetalleFormModal
        mode="create"
        idMaestro={createModal.idMaestro}
        onSubmit={createModal.onSubmit}
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        isLoading={createModal.isLoading}
      />

      {editModal.detalle && (
        <DetalleFormModal
          mode="edit"
          initialData={editModal.detalle}
          onSubmit={editModal.onSubmit}
          isOpen={editModal.isOpen}
          onClose={editModal.onClose}
          isLoading={editModal.isLoading}
        />
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onCancel}
        onConfirm={deleteDialog.onConfirm}
        title={t('dialogs.detail.individual.title')}
        description={individualDeleteDescription}
        isLoading={isDeleting}
        confirmButtonText={t('dialogs.confirmButtonText')}
        cancelButtonText={t('dialogs.cancelButtonText')}
      />
      <DeleteConfirmDialog
        isOpen={batchDeleteDialog.isOpen}
        onClose={batchDeleteDialog.onCancel}
        onConfirm={batchDeleteDialog.onConfirm}
        title={t('dialogs.detail.batch.title')}
        description={batchDeleteDescription}
        isLoading={isDeleting}
        confirmButtonText={t('dialogs.detail.batch.confirmButtonText', {
          count: batchDeleteDialog.selectedCount,
        })}
        cancelButtonText={t('dialogs.cancelButtonText')}
      />
    </>
  );
}
