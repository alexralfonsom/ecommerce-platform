// src/hooks/useCatalogosDetalles.ts
import { useToast } from '@repo/ui';
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { useCallback, useMemo, useState } from 'react';
import { CatalogosDetallesColumns } from '@components/features/catalogos/catalogos-detalles/catalogos-detalles-columns';
import { useExport } from '@repo/ui';
import { IMaestroCatalogo } from '@components/features/catalogos/types/MaestroCatalogosTypes';
import type { ExportFormat } from '@repo/shared/types/export';
import { catalogosDetallesExportConfig } from '@components/features/catalogos/config/exportConfig';

interface UseCatalogosDetallesProps {
  idMaestro?: number;
  idMaestroCatalogo: number;
  data: IMaestroCatalogoDetalle[];
  loading?: boolean;
  onRefresh?: () => void;
  createCatalogoDetalle?: (
    detalle: ICreateMaestroCatalogoDetalleRequest,
    options?: {
      onSuccess?: (result?: { value: IMaestroCatalogoDetalle }) => void;
      onError?: (error: any) => void;
    },
  ) => void;
  updateCatalogoDetalle?: (
    id: number,
    data: IUpdateMaestroCatalogoDetalleRequest,
    options?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
    },
  ) => void;

  deleteCatalogoDetalle?: (
    id: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
    },
  ) => void;

  toggleStatus?: (
    id: number,
    options?: {
      onSuccess?: (data?: any) => void;
      onError?: (error: any) => void;
    },
  ) => void;
}

interface UseCatalogosDetallesReturn {
  table: ReturnType<typeof useReactTable<IMaestroCatalogoDetalle>>;
  selectedRowsCount: number;
  selectedRowsData: IMaestroCatalogoDetalle[];
  clearSelection: () => void;
  actions: {
    onView?: (id: number) => void;
    onEdit?: (id: number) => void;
    onCopy?: (id: number) => void;
    onToggleStatus?: (id: number) => void;
    onDelete?: (id: number) => void;
  };
  batchActions: {
    toggleStatusSelected: () => void;
    exportSelected: (format?: ExportFormat) => void;
    deleteSelected: () => void;
  };
  batchDeleteDialog: {
    isOpen: boolean;
    selectedCount: number;
    selectedItems: IMaestroCatalogo[];
    onConfirm: () => void;
    onCancel: () => void;
  };
  deleteDialog: {
    isOpen: boolean;
    detalle: IMaestroCatalogoDetalle | null;
    onConfirm: () => void;
    onCancel: () => void;
  };
  createModal: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSubmit: (data: ICreateMaestroCatalogoDetalleRequest) => void;
    isLoading: boolean;
    idMaestro: number;
  };
  editModal: {
    isOpen: boolean;
    detalle: IMaestroCatalogoDetalle | null;
    onOpen: (detalleId: number) => void;
    onClose: () => void;
    onSubmit: (data: IUpdateMaestroCatalogoDetalleRequest) => void;
    isLoading: boolean;
  };

  handleRefresh: () => void;
  isExporting: boolean;
}

export function useCatalogosDetalles({
  data,
  loading = false,
  idMaestroCatalogo, // ✅ ID del catálogo padre
  onRefresh,
  createCatalogoDetalle,
  updateCatalogoDetalle,
  deleteCatalogoDetalle,
  toggleStatus,
}: UseCatalogosDetallesProps): UseCatalogosDetallesReturn {
  const toast = useToast();
  // ===============================
  // ESTADOS DE TABLA
  // ===============================
  const { exportSelected: performExport, isExporting } = useExport();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDetalleForEdit, setSelectedDetalleForEdit] =
    useState<IMaestroCatalogoDetalle | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState<IMaestroCatalogoDetalle | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const showToast = useCallback(
    (type: 'success' | 'info' | 'danger' | 'warning', title: string, description: string) => {
      toast[type](title, description);
    },
    [toast],
  );

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    (data: ICreateMaestroCatalogoDetalleRequest) => {
      if (!createCatalogoDetalle) {
        showToast('danger', 'Error', 'Función de creación no disponible');
        return;
      }
      setIsCreating(true);

      createCatalogoDetalle(data, {
        onSuccess: (result) => {
          showToast('success', 'Detalle creado', 'El detalle se ha creado exitosamente');
          closeCreateModal();
          onRefresh?.();
          setIsCreating(false);
        },
        onError: (error) => {
          showToast(
            'danger',
            'Error al crear el detalle',
            error.message || 'No se pudo crear el detalle',
          );
          setIsCreating(false);
        },
      });
    },
    [createCatalogoDetalle, onRefresh, showToast],
  );

  const openEditModal = useCallback(
    (detalleId: number) => {
      const detalle = data?.find((d) => d.id === detalleId);
      if (!detalle) {
        showToast('danger', 'Error', 'Detalle no encontrado');
        return;
      }
      setSelectedDetalleForEdit(detalle);
      setIsEditModalOpen(true);
    },
    [data, showToast],
  );

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedDetalleForEdit(null);
  }, []);

  const handleEditSubmit = useCallback(
    (data: IUpdateMaestroCatalogoDetalleRequest) => {
      if (!updateCatalogoDetalle || !selectedDetalleForEdit) {
        showToast('danger', 'Error', 'Función de actualización no disponible');
        return;
      }

      setIsUpdating(true);
      updateCatalogoDetalle(selectedDetalleForEdit.id, data, {
        onSuccess: () => {
          showToast('success', 'Detalle actualizado', 'El detalle se ha actualizado exitosamente');
          closeEditModal();
          onRefresh?.();
          setIsUpdating(false);
        },
        onError: (error) => {
          showToast(
            'danger',
            'Error al actualizar',
            error?.message || 'No se pudo actualizar el detalle',
          );
          setIsUpdating(false);
        },
      });
    },
    [updateCatalogoDetalle, selectedDetalleForEdit, onRefresh, showToast],
  );

  // ===============================
  // ACCIONES INDIVIDUALES
  // ===============================

  const handleEdit = useCallback(
    (detalleId: number) => {
      openEditModal(detalleId);
    },
    [openEditModal],
  );

  const handleCopy = useCallback(
    async (detalleId: number) => {
      const detalle = data.find((d) => d.id === detalleId);
      if (!detalle) {
        showToast('danger', 'Error', 'Detalle no encontrado');
        return;
      }
      if (!createCatalogoDetalle) {
        showToast('danger', 'Error', 'Función de creación no disponible');
        return;
      }
      const newDetalle: ICreateMaestroCatalogoDetalleRequest = {
        nombre: `${detalle.nombre} (Copia)`,
        idMaestro: detalle.idMaestro,
        codigo: detalle.codigo,
        evento: detalle.evento,
      };

      createCatalogoDetalle(newDetalle, {
        onSuccess: (data: any) => {
          showToast('success', 'Detalle copiado', `Se ha creado una copia: "${newDetalle.nombre}"`);
          onRefresh?.();
        },
        onError: (error: any) => {
          showToast(
            'danger',
            'Error al copiar',
            error?.message || 'No se pudo crear la copia del detalle',
          );
        },
      });
    },
    [data, createCatalogoDetalle, onRefresh, showToast],
  );

  const handleToggleStatus = useCallback(
    (detalleId: number) => {
      const detalle = data?.find((c) => c.id === detalleId);
      if (!detalle) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      if (!toggleStatus) {
        showToast('danger', 'Error', 'Función de actualización no disponible');
        return;
      }

      const newStatus = !detalle.activo;
      const actionText = newStatus ? 'activado' : 'desactivado';

      toggleStatus(detalleId, {
        onSuccess: () => {
          showToast(
            'success',
            'Estado actualizado',
            `Catálogo "${detalle.nombre}" ${actionText} correctamente`,
          );
          onRefresh?.();
        },
        onError: (error: any) => {
          showToast('danger', 'Error', error?.message || 'No se pudo actualizar el estado');
        },
      });
    },
    [data, toggleStatus, showToast, onRefresh],
  );

  // ===============================
  // 🗑️ ELIMINACIÓN
  // ===============================

  const openDeleteDialog = useCallback(
    (detalleId: number) => {
      const detalle = data?.find((d) => d.id === detalleId);
      if (!detalle) {
        showToast('danger', 'Error', 'Detalle no encontrado');
        return;
      }
      setSelectedDetalle(detalle);
      setIsDeleteDialogOpen(true);
    },
    [data, showToast],
  );

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedDetalle(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteCatalogoDetalle || !selectedDetalle) {
      showToast('danger', 'Error', 'Función de eliminación no disponible');
      return;
    }

    deleteCatalogoDetalle(selectedDetalle.id, {
      onSuccess: () => {
        showToast('success', 'Detalle eliminado', 'El detalle se ha eliminado exitosamente');
        closeDeleteDialog();
        onRefresh?.();
      },
      onError: (error) => {
        showToast(
          'danger',
          'Error al eliminar el detalle',
          error.message || 'No se pudo eliminar el detalle',
        );
        setIsDeleteDialogOpen(false);
      },
    });
  }, [deleteCatalogoDetalle, selectedDetalle, onRefresh, showToast, closeDeleteDialog]);

  // ===============================
  // 🎯 ACCIONES DE TABLA
  // ===============================
  const memoizedData = useMemo(() => {
    return data || [];
  }, [data]);

  // Crear las acciones memoizadas
  const tableActions = useMemo(
    () => ({
      onEdit: handleEdit,
      onCopy: handleCopy,
      onToggleStatus: handleToggleStatus,
      onDelete: openDeleteDialog,
    }),
    [handleEdit, handleCopy, handleToggleStatus, openDeleteDialog],
  );

  const memoizedColumns = useMemo(() => CatalogosDetallesColumns(tableActions), [tableActions]);

  // Configuración del table
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      pagination,
    },
    // 🔧 HANDLERS OBLIGATORIOS
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,

    // 🔧 CONFIGURACIÓN DE FUNCIONALIDADES
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',

    // 🔧 MODELOS DE TABLA (ORDEN IMPORTANTE)
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    // 🔧 CONFIGURACIÓN INICIAL
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  // ===============================
  // DATOS COMPUTADOS
  // ===============================
  const selectedRowsCount = Object.keys(rowSelection).length;
  const selectedRowsData = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh, showToast]);

  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // ===============================
  // ACCIONES BATCH
  // ===============================
  const batchActions = useMemo(
    () => ({
      toggleStatusSelected: () => {
        if (selectedRowsCount === 0) {
          showToast('warning', 'Advertencia', 'Selecciona al menos un catálogo');
          return;
        }

        selectedRowsData.forEach((detalle) => {
          handleToggleStatus(detalle.id);
        });

        showToast('info', 'Procesando', `Actualizando estado de ${selectedRowsCount} catálogos`);
      },

      exportSelected: (format: ExportFormat = 'csv') => {
        if (selectedRowsCount === 0) {
          showToast('warning', 'Advertencia', 'Selecciona al menos un registro para exportar');
          return;
        }

        const configWithTimestamp = {
          ...catalogosDetallesExportConfig,
          filename: `catalogos_detalles_${new Date().toISOString().slice(0, 10)}`,
        };

        performExport(selectedRowsData, configWithTimestamp, format);
      },

      deleteSelected: () => {
        if (selectedRowsCount === 0) {
          showToast('warning', 'Advertencia', 'Selecciona al menos un catálogo para eliminar');
          return;
        }
        setIsBatchDeleteDialogOpen(true);
      },
    }),
    [selectedRowsCount, selectedRowsData, handleToggleStatus, toast],
  );

  const confirmBatchDelete = useCallback(() => {
    if (selectedRowsCount === 0 || !deleteCatalogoDetalle) {
      setIsBatchDeleteDialogOpen(false);
      return;
    }

    selectedRowsData.forEach((catalogo) => {
      deleteCatalogoDetalle(catalogo.id, {
        onSuccess: () => {
          showToast(
            'info',
            'Eliminando',
            `Procesando eliminación de ${selectedRowsCount} catálogos`,
          );
        },
        onError: (error: any) => {
          showToast('danger', 'Error', `Error al eliminar ${catalogo.nombre}: ${error?.message}`);
        },
      });
    });

    showToast('success', 'Eliminación masiva', `Eliminando ${selectedRowsCount} catálogos`);
    setIsBatchDeleteDialogOpen(false);
    clearSelection(); // Limpiar selección
    onRefresh?.(); // Refrescar datos
  }, [
    selectedRowsCount,
    selectedRowsData,
    deleteCatalogoDetalle,
    showToast,
    clearSelection,
    onRefresh,
  ]);

  const cancelBatchDelete = useCallback(() => {
    setIsBatchDeleteDialogOpen(false);
  }, []);

  // ===============================
  // RETURN FINAL
  // ===============================

  return {
    // Data
    table,
    selectedRowsCount,
    selectedRowsData,
    clearSelection,
    actions: tableActions,
    batchActions,
    // Dialog states
    deleteDialog: {
      isOpen: isDeleteDialogOpen,
      detalle: selectedDetalle,
      onConfirm: confirmDelete,
      onCancel: closeDeleteDialog,
    },
    batchDeleteDialog: {
      isOpen: isBatchDeleteDialogOpen,
      selectedCount: selectedRowsCount,
      selectedItems: selectedRowsData,
      onConfirm: confirmBatchDelete,
      onCancel: cancelBatchDelete,
    },
    createModal: {
      isOpen: isCreateModalOpen,
      onOpen: openCreateModal,
      onClose: closeCreateModal,
      onSubmit: handleCreateSubmit,
      isLoading: isCreating,
      idMaestro: idMaestroCatalogo,
    },

    editModal: {
      isOpen: isEditModalOpen,
      detalle: selectedDetalleForEdit,
      onOpen: openEditModal,
      onClose: closeEditModal,
      onSubmit: handleEditSubmit,
      isLoading: isUpdating,
    },
    handleRefresh,
    isExporting,
  };
}
