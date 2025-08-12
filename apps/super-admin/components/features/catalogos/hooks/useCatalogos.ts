import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { CatalogosMaestrosColumns } from '@components/features/catalogos/catalogos-columns';
import { useExport } from '@repo/ui';
import { catalogosMaestrosExportConfig } from '@components/features/catalogos/config/exportConfig';
import type { ExportFormat } from '@repo/shared/types/export';

interface UseCatalogosProps {
  data: IMaestroCatalogo[];
  loading?: boolean;
  onRefresh?: () => void;
  createCatalogo?: (
    catalogo: ICreateMaestroCatalogoRequest,
    options?: {
      onSuccess?: (result?: { value: IMaestroCatalogo }) => void;
      onError?: (error: any) => void;
    },
  ) => void;

  updateCatalogo?: (
    id: number,
    data: IUpdateMaestroCatalogoRequest,
    options?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
    },
  ) => void;

  deleteCatalogo?: (
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

interface UseCatalogosReturn {
  table: ReturnType<typeof useReactTable<IMaestroCatalogo>>;
  selectedRowsCount: number;
  selectedRowsData: IMaestroCatalogo[];
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
    catalogo: IMaestroCatalogo | null;
    onConfirm: () => void;
    onCancel: () => void;
  };

  createModal: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSubmit: (data: ICreateMaestroCatalogoRequest) => void;
    isLoading: boolean;
  };

  editModal: {
    isOpen: boolean;
    catalogo: IMaestroCatalogo | null;
    onOpen: (catalogoId: number) => void;
    onClose: () => void;
    onSubmit: (data: IUpdateMaestroCatalogoRequest) => void;
    isLoading: boolean;
  };

  handleRefresh: () => void;
  getCatalogoById: (id: number) => IMaestroCatalogo | undefined;
  isExporting: boolean;
}

const fallbackData: IMaestroCatalogo[] = [];

export function useCatalogos({
  data,
  loading = false,
  onRefresh,
  toggleStatus,
  deleteCatalogo,
  createCatalogo,
  updateCatalogo,
}: UseCatalogosProps): UseCatalogosReturn {
  const router = useRouter();
  const toast = useToast();
  const { exportSelected: performExport, isExporting } = useExport();
  // ✅ React moderno: TanStack Query ya maneja el cleanup automáticamente
  // ===============================
  // ESTADOS DE TABLA
  // ===============================
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCatalogoForEdit, setSelectedCatalogoForEdit] = useState<IMaestroCatalogo | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [selectedCatalogo, setSelectedCatalogo] = useState<IMaestroCatalogo | null>(null);

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

  // Modal de creación
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    (data: ICreateMaestroCatalogoRequest) => {
      if (!createCatalogo) {
        showToast('danger', 'Error', 'Función de creación no disponible');
        return;
      }

      setIsCreating(true);
      createCatalogo(data, {
        onSuccess: (result) => {
          showToast('success', 'Catálogo creado', 'El catálogo se ha creado exitosamente');
          closeCreateModal();
          onRefresh?.();
          setIsCreating(false);
        },
        onError: (error) => {
          showToast('danger', 'Error al crear', error?.message || 'No se pudo crear el catálogo');
          setIsCreating(false);
        },
      });
    },
    [createCatalogo, onRefresh, toast],
  );

  // Modal de edición
  const openEditModal = useCallback(
    (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      setSelectedCatalogoForEdit(catalogo);
      setIsEditModalOpen(true);
    },
    [data, showToast],
  );

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedCatalogoForEdit(null);
  }, []);

  const handleEditSubmit = useCallback(
    (data: IUpdateMaestroCatalogoRequest) => {
      if (!updateCatalogo || !selectedCatalogoForEdit) {
        showToast('danger', 'Error', 'Función de actualización no disponible');
        return;
      }

      setIsUpdating(true);
      updateCatalogo(selectedCatalogoForEdit.id, data, {
        onSuccess: () => {
          showToast(
            'success',
            'Catálogo actualizado',
            'El catálogo se ha actualizado exitosamente',
          );
          closeEditModal();
          onRefresh?.();
          setIsUpdating(false);
        },
        onError: (error) => {
          showToast(
            'danger',
            'Error al actualizar',
            error?.message || 'No se pudo actualizar el catálogo',
          );
          setIsUpdating(false);
        },
      });
    },
    [updateCatalogo, selectedCatalogoForEdit, onRefresh, toast],
  );

  // ===============================
  // ACCIONES INDIVIDUALES
  // ===============================
  const handleView = useCallback(
    (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      router.push(`/catalogos/${catalogoId}`);
    },
    [data, router, toast],
  );

  const handleViewDetails = useCallback(
    (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      router.push(`/catalogos/${catalogoId}`);
    },
    [data, router, toast],
  );

  const handleEdit = useCallback(
    (catalogoId: number) => {
      openEditModal(catalogoId);
    },
    [openEditModal],
  );

  const handleCopy = useCallback(
    async (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      if (!createCatalogo) {
        showToast('danger', 'Error', 'Función de creación no disponible');
        return;
      }

      const newCatalogo: ICreateMaestroCatalogoRequest = {
        nombre: `${catalogo.nombre} - Copia`,
        activo: true,
      };

      createCatalogo(newCatalogo, {
        onSuccess: (data: any) => {
          showToast(
            'success',
            'Catálogo copiado',
            `Se ha creado una copia: "${newCatalogo.nombre}"`,
          );
          onRefresh?.();
        },
        onError: (error: any) => {
          showToast(
            'danger',
            'Error al copiar',
            error?.message || 'No se pudo crear la copia del catálogo',
          );
        },
      });
    },
    [data, createCatalogo, toast, onRefresh],
  );

  const handleToggleStatus = useCallback(
    (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      if (!toggleStatus) {
        showToast('danger', 'Error', 'Función de actualización no disponible');
        return;
      }

      const newStatus = !catalogo.activo;
      const actionText = newStatus ? 'activado' : 'desactivado';

      toggleStatus(catalogoId, {
        onSuccess: () => {
          showToast(
            'success',
            'Estado actualizado',
            `Catálogo "${catalogo.nombre}" ${actionText} correctamente`,
          );
          onRefresh?.();
        },
        onError: (error: any) => {
          showToast('danger', 'Error', error?.message || 'No se pudo actualizar el estado');
        },
      });
    },
    [data, toggleStatus, toast, onRefresh],
  );

  const handleDelete = useCallback(
    (catalogoId: number) => {
      const catalogo = data?.find((c) => c.id === catalogoId);
      if (!catalogo) {
        showToast('danger', 'Error', 'Catálogo no encontrado');
        return;
      }
      setSelectedCatalogo(catalogo);
      setIsDeleteDialogOpen(true);
    },
    [data, toast],
  );

  const confirmDelete = useCallback(() => {
    if (!selectedCatalogo || !deleteCatalogo) {
      setIsDeleteDialogOpen(false);
      return;
    }

    deleteCatalogo(selectedCatalogo.id, {
      onSuccess: () => {
        showToast(
          'success',
          'Catálogo eliminado',
          `"${selectedCatalogo.nombre}" ha sido eliminado correctamente`,
        );
        onRefresh?.();
        setIsDeleteDialogOpen(false);
        setSelectedCatalogo(null);
      },
      onError: (error: any) => {
        showToast(
          'danger',
          'Error al eliminar',
          error?.message || 'No se pudo eliminar el catálogo',
        );
        setIsDeleteDialogOpen(false);
      },
    });
  }, [selectedCatalogo, deleteCatalogo, toast, onRefresh]);

  const cancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedCatalogo(null);
  }, []);

  // ===============================
  // CONFIGURACIÓN DE TABLA
  // ===============================

  // MEMOIZAR DATA PARA EVITAR RE-CREACIÓN DE TABLE
  const memoizedData = useMemo(() => {
    return data || fallbackData;
  }, [data]);

  //const memoizedData = data || fallbackData;

  // Crear las acciones memoizadas
  const tableActions = useMemo(
    () => ({
      onView: (catalogoId: number) => handleView(catalogoId),
      onEdit: (catalogoId: number) => handleEdit(catalogoId),
      onCopy: (catalogoId: number) => handleCopy(catalogoId),
      onToggleStatus: (catalogoId: number) => handleToggleStatus(catalogoId),
      onDelete: (catalogoId: number) => handleDelete(catalogoId),
      onViewDetails: (catalogoId: number) => handleViewDetails(catalogoId),
    }),
    [handleView, handleEdit, handleCopy, handleToggleStatus, handleDelete, handleViewDetails],
  );

  // ✅ MEMOIZAR COLUMNS PARA EVITAR RE-RENDERS
  const memoizedColumns = useMemo(() => CatalogosMaestrosColumns(tableActions), [tableActions]);

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
    // 🔧 HANDLERS ESTABLES - Sin useCallback para evitar problemas de cleanup
    onPaginationChange: memoizedData.length > 0 ? setPagination : undefined,
    onSortingChange: memoizedData.length > 0 ? setSorting : undefined,
    onColumnFiltersChange: memoizedData.length > 0 ? setColumnFilters : undefined,
    onRowSelectionChange: memoizedData.length > 0 ? setRowSelection : undefined,
    onColumnVisibilityChange: memoizedData.length > 0 ? setColumnVisibility : undefined,


    // 🔧 CONFIGURACIÓN DE FUNCIONALIDADES
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    autoResetPageIndex: false,

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
  }, [onRefresh, toast]);

  const getCatalogoById = useCallback(
    (id: number) => {
      return data?.find((catalogo) => catalogo.id === id);
    },
    [data],
  );

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

        selectedRowsData.forEach((catalogo) => {
          handleToggleStatus(catalogo.id);
        });

        showToast('info', 'Procesando', `Actualizando estado de ${selectedRowsCount} catálogos`);
      },

      exportSelected: (format: ExportFormat = 'csv') => {
        if (selectedRowsCount === 0) {
          showToast('warning', 'Advertencia', 'Selecciona al menos un catálogo para exportar');
          return;
        }

        const configWithTimestamp = {
          ...catalogosMaestrosExportConfig,
          filename: `catalogos_maestros_${new Date().toISOString().slice(0, 10)}`,
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
    if (selectedRowsCount === 0 || !deleteCatalogo) {
      setIsBatchDeleteDialogOpen(false);
      return;
    }

    selectedRowsData.forEach((catalogo) => {
      deleteCatalogo(catalogo.id, {
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
  }, [selectedRowsCount, selectedRowsData, deleteCatalogo, showToast, clearSelection, onRefresh]);

  const cancelBatchDelete = useCallback(() => {
    setIsBatchDeleteDialogOpen(false);
  }, []);

  // ===============================
  // RETURN FINAL
  // ===============================

  return {
    table,
    selectedRowsCount,
    selectedRowsData,
    clearSelection,

    // Actions functionality
    actions: tableActions,
    // Batch actions
    batchActions,

    // Dialog states
    deleteDialog: {
      isOpen: isDeleteDialogOpen,
      catalogo: selectedCatalogo,
      onConfirm: confirmDelete,
      onCancel: cancelDelete,
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
    },

    editModal: {
      isOpen: isEditModalOpen,
      catalogo: selectedCatalogoForEdit,
      onOpen: openEditModal,
      onClose: closeEditModal,
      onSubmit: handleEditSubmit,
      isLoading: isUpdating,
    },
    handleRefresh,
    // Utilities
    getCatalogoById,
    isExporting,
  };
}
