import { maestroCatalogosDetalleApi } from '@/lib/api/endpoints/maestroCatalogosDetalles';
import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
  MaestroCatalogosDetalleParameters,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { useGenericCRUDWithParent } from '@repo/shared/lib/hooks';

// ===============================
// CONFIGURACIÓN ESPECÍFICA PARA CATÁLOGOS DETALLES
// ===============================

const catalogosDetalleConfig = {
  entityName: 'catalogosDetalle',
  entityType: 'STABLE' as const,
  api: {
    // Métodos que requieren parentId (idMaestro)
    getAll: (idMaestro: number, incluirInactivos: boolean = false) =>
      maestroCatalogosDetalleApi.getByMaestroId(idMaestro, incluirInactivos),
    getPaged: (idMaestro: number, params?: MaestroCatalogosDetalleParameters) =>
      maestroCatalogosDetalleApi.getPagedByMaestroId(idMaestro, params),

    // Métodos estándar que no requieren parentId
    getById: maestroCatalogosDetalleApi.getById,
    create: maestroCatalogosDetalleApi.create,
    update: (id: number, data: IUpdateMaestroCatalogoDetalleRequest) =>
      maestroCatalogosDetalleApi.update(id, data),
    delete: maestroCatalogosDetalleApi.delete,
  },
  options: {
    enableOptimisticUpdates: true,
    customSuccessMessages: {
      create: 'Detalle creado exitosamente',
      update: 'Detalle actualizado exitosamente',
      delete: 'Detalle eliminado exitosamente',
    },
  },
};

// ===============================
// HOOK PRINCIPAL PARA CATÁLOGOS DETALLES
// ===============================

export const useCatalogosDetalleQueries = () => {
  const crud = useGenericCRUDWithParent<
    IMaestroCatalogoDetalle,
    ICreateMaestroCatalogoDetalleRequest,
    IUpdateMaestroCatalogoDetalleRequest,
    MaestroCatalogosDetalleParameters
  >(catalogosDetalleConfig);

  // Hook específico para toggle status de detalle
  const useToggleStatus = (idMaestro: number | null) => {
    return crud.useCustomMutation(
      idMaestro,
      async (id: number) => {
        await maestroCatalogosDetalleApi.toggleStatus(id);
      },
      {
        invalidateLists: true,
        invalidateDetails: true,
      },
    );
  };

  return {
    ...crud,
    useToggleStatus,
  };
};

// ===============================
// 🎯 HOOKS DE CONVENIENCIA (EXPORTADOS)
// ===============================

export const useCatalogosDetalleOperations = (
  idMaestro: number | null,
  params?: MaestroCatalogosDetalleParameters,
) => {
  const { usePagedOperations, useToggleStatus } = useCatalogosDetalleQueries();
  const toggleStatus = useToggleStatus(idMaestro);

  return {
    ...usePagedOperations(idMaestro, params),

    // Acción personalizada para toggle status
    toggleStatus: (
      id: number,
      options?: {
        onSuccess?: (data?: any) => void;
        onError?: (error: any) => void;
      },
    ) => {
      toggleStatus.mutate(id, {
        onSuccess: (data) => {
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },

    // Estados adicionales
    isToggling: toggleStatus.isPending,
  };
};

// Para casos específicos donde necesites lista simple (sin paginación)
export const useCatalogosDetalleSimple = (
  idMaestro: number | null,
  incluirInactivos: boolean = false,
) => {
  const { useOperations, useToggleStatus } = useCatalogosDetalleQueries();
  const toggleStatus = useToggleStatus(idMaestro);

  return {
    ...useOperations(idMaestro, incluirInactivos),

    toggleStatus: (
      id: number,
      options?: {
        onSuccess?: (data?: any) => void;
        onError?: (error: any) => void;
      },
    ) => {
      toggleStatus.mutate(id, {
        onSuccess: (data) => {
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          options?.onError?.(error);
        },
      });
    },

    isToggling: toggleStatus.isPending,
  };
};

// Hook específico solo para obtener un detalle por ID (sin dependencia del parent)
export const useCatalogoDetalleById = (id: number | null) => {
  const { useById } = useCatalogosDetalleQueries();
  return useById(id);
};
