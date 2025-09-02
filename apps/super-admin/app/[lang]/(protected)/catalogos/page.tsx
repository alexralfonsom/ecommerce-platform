//src/app/[lang]/(protected)/catalogos/page.tsx
'use client';

import { PagesHeader } from '@repo/ui';
import { HeaderAction } from '@repo/shared/types/PagesHeader';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { useToast } from '@repo/ui';
import { cn } from '@repo/shared';
import { createStatCardItem, StatCard } from '@repo/ui';
import { Backgrounds, Borders } from '@repo/ui/configs/DesignSystem';
import { CatalogoList } from '@components/features/catalogos/CatalogoList';
import { useCatalogos } from '@components/features/catalogos/hooks/useCatalogos';
import { useCatalogosSimple } from '@components/features/catalogos/hooks/useCatalogosQueries';
import { CatalogoFormModal } from '@components/features/catalogos/CatalogoFormModal';
import { DeleteConfirmDialog } from '@repo/ui';
import { useDeleteDialogDescription } from '@repo/shared/lib/hooks';

export default function Catalogos() {
  const toast = useToast();
  const t = useTranslations('catalogs');

  // ✅ 1. DATA LAYER: Obtener TODOS los datos de la API (sin paginación del servidor)
  const {
    items, // Array de catálogos desde tu API .NET Core
    //totalCount, // Total de registros
    //currentPage: page, // Página actual
    //totalPages, // Total de páginas
    //hasNextPage,
    //hasPreviousPage,

    // 🎛️ Estados automáticos
    isLoading, // true cuando está cargando
    error,
    isRefetching, // true cuando está refrescando en background

    // 🚀 Acciones automáticas (conectadas a tu API)
    create, // Función para crear (POST /MaestroCatalogos)
    update, // Función para actualizar (PUT /MaestroCatalogos/{id})
    delete: deleteCatalogo, // Función para eliminar (DELETE /MaestroCatalogos/{id})
    refetch, // Función para refrescar manualmente

    // 🔄 Estados de mutaciones
    isCreating, // true cuando está creando
    isUpdating, // true cuando está actualizando
    isDeleting, // true cuando está eliminando

    // Funcionalidades específicas de catálogos
  } = useCatalogosSimple({
    // Sin paginación del servidor - obtener todos los datos
    incluirInactivos: true,
  });

  // ✅ 2. UNIFIED HOOK: Table + Actions en uno solo
  const {
    table,
    selectedRowsCount,
    selectedRowsData,
    clearSelection,
    actions,
    batchActions,
    deleteDialog,
    batchDeleteDialog,
    createModal,
    editModal,
    handleRefresh,
    isExporting,
  } = useCatalogos({
    data: items,
    loading: isLoading,
    onRefresh: refetch,
    deleteCatalogo: deleteCatalogo,
    createCatalogo: create,
    updateCatalogo: update,
  });

  const batchDeleteDescription = useDeleteDialogDescription({
    translationObject: 'catalogs.dialogs.master',
    translationKey: 'batch.description',
    mode: 'batch',
    selectedCount: batchDeleteDialog.selectedCount,
    selectedItems: batchDeleteDialog.selectedItems,
  });

  const individualDeleteDescription = useDeleteDialogDescription({
    translationObject: 'catalogs.dialogs.master',
    translationKey: 'individual.description',
    mode: 'individual',
    itemName: deleteDialog.catalogo?.nombre || '',
  });

  // ✅ STAT CARDS
  const statCardItems = useMemo(() => {
    const totalCount = items?.length || 0;
    const activeCount = items?.filter((item: any) => item.activo)?.length || 0;
    const inactiveCount = totalCount - activeCount;
    const recentModifiedCount = 10;

    return [
      createStatCardItem('Total de Catálogos', totalCount, {
        id: 'total-catalogs',
        icon: 'FolderOpen',
        color: 'blue',
        trend: { value: 5.2, direction: 'up', label: 'vs mes anterior' },
        footerAction: {
          label: 'Ver todos',
          onClick: () => {
            // Limpiar filtros para mostrar todos
            //setParams((prev) => ({ ...prev, activo: undefined, page: 1 }));
            toast.info('Filtros limpiados', 'Mostrando todos los catálogos');
          },
          icon: 'Eye',
        },
      }),
      createStatCardItem('Catálogos Activos', activeCount, {
        id: 'active-catalogs',
        icon: 'CheckCircle',
        color: 'green',
        trend: { value: 2.1, direction: 'up', label: 'este mes' },
        footerAction: {
          label: 'Filtrar activos',
          onClick: () => {
            // Filtrar solo activos
            //setParams((prev) => ({ ...prev, activo: true, page: 1 }));
            toast.success('Filtro aplicado', 'Mostrando solo catálogos activos');
          },
          icon: 'Filter',
        },
      }),
      createStatCardItem('Catálogos Inactivos', inactiveCount, {
        id: 'inactive-catalogs',
        icon: 'XCircle',
        color: 'red',
        footerAction: {
          label: 'Gestionar inactivos',
          onClick: () => {
            // Filtrar solo inactivos
            //setParams((prev) => ({ ...prev, activo: false, page: 1 }));
            toast.warning('Gestión', 'Mostrando catálogos inactivos');
          },
          icon: 'Settings',
        },
      }),
      createStatCardItem('Actualizados Recientemente', recentModifiedCount, {
        id: 'recent-catalogs',
        icon: 'Clock',
        color: 'purple',
        footerAction: {
          label: 'Ver cambios',
          onClick: () => {
            toast.info('Historial', 'Mostrando cambios recientes');
          },
          icon: 'History',
        },
      }),
    ];
  }, [items, selectedRowsCount]); // ✅ Incluir selectedRowsCount en dependencias
  // ===============================
  // 📊 COMPUTED DATA FOR STATS
  // ===============================
  const statsData = useMemo(() => {
    const activeCatalogos = items.filter((c: any) => c.activo);
    const inactiveCatalogos = items.filter((c: any) => !c.activo);

    // Calcular "recientes" (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCatalogos = items.filter((c: any) => {
      const fechaModificacion = c.fechaCreacion;
      return new Date(fechaModificacion) > sevenDaysAgo;
    });

    return {
      total: items.length, // <- Viene del API (totalCount real)
      active: activeCatalogos.length,
      inactive: inactiveCatalogos.length,
      recent: recentCatalogos.length,
    };
  }, [items]);

  // ===============================
  // 🎯 HANDLERS PARA ACCIONES
  // ===============================

  const actionsHeaders: HeaderAction[] = [
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
  ];

  const primaryAction: HeaderAction = {
    id: 'create',
    label: 'Nuevo Catálogo',
    icon: 'Plus',
    variant: 'default',
    iconPosition: 'leading',
    onClick: createModal.onOpen,
  };

  // ===============================
  // 🎯 RENDER
  // ===============================
  return (
    <>
      <PagesHeader
        title={t('title')}
        showActions={true}
        subtitle={
          <div className="flex items-center gap-6">
            <span>{t('description')}</span>
          </div>
        }
        actions={actionsHeaders}
        primaryAction={primaryAction}
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
          error={error ? error.message : null}
          columns="auto"
          gap="md"
          showAnimation={true}
          className="mb-8"
          ariaLabel={t('statCards.statCardLabel')}
        />

        {/* Tabla principal */}
        <div className="space-y-4">
          <CatalogoList
            table={table}
            loading={isLoading}
            isExporting={isExporting}
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

      {/* ✅ MODALES */}
      {/* Modal de Creación */}
      <CatalogoFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        mode="create"
        onSubmit={createModal.onSubmit}
        isLoading={createModal.isLoading}
      />

      {/* Modal de Edición */}
      {editModal.catalogo && (
        <CatalogoFormModal
          isOpen={editModal.isOpen}
          onClose={editModal.onClose}
          mode="edit"
          initialData={editModal.catalogo}
          onSubmit={editModal.onSubmit}
          isLoading={editModal.isLoading}
        />
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onCancel}
        onConfirm={deleteDialog.onConfirm}
        title={t('dialogs.master.individual.title')}
        description={individualDeleteDescription}
        isLoading={isDeleting}
        confirmButtonText={t('dialogs.confirmButtonText')}
        cancelButtonText={t('dialogs.cancelButtonText')}
      />

      {/* ✅ NUEVO: DIÁLOGO DE ELIMINACIÓN MASIVA */}

      <DeleteConfirmDialog
        isOpen={batchDeleteDialog.isOpen}
        onClose={batchDeleteDialog.onCancel}
        onConfirm={batchDeleteDialog.onConfirm}
        title={t('dialogs.master.batch.title')}
        description={batchDeleteDescription}
        isLoading={isDeleting}
        confirmButtonText={t('dialogs.master.batch.confirmButtonText', {
          count: batchDeleteDialog.selectedCount,
        })}
        cancelButtonText={t('dialogs.cancelButtonText')}
      />
    </>
  );
}
