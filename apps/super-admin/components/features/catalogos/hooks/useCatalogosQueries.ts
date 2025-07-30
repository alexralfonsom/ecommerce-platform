import { maestroCatalogosApi } from '@/lib/api/endpoints/maestroCatalogos';
import {
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
  MaestroCatalogosParameters,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { useGenericCRUD } from '@repo/shared/lib/hooks/queries/useGenericCRUD';

// ===============================
// CONFIGURACIÓN ESPECÍFICA PARA CATÁLOGOS
// ===============================

const catalogosConfig = {
  entityName: 'catalogos',
  entityType: 'STANDARD' as const,
  api: {
    getAll: maestroCatalogosApi.getAll,
    getPaged: maestroCatalogosApi.getPaged,
    getById: maestroCatalogosApi.getById,
    create: maestroCatalogosApi.create,
    update: (id: number, data: IUpdateMaestroCatalogoRequest) =>
      maestroCatalogosApi.update(id, data),
    delete: maestroCatalogosApi.delete,
  },
  options: {
    enableOptimisticUpdates: true, // Habilitar updates optimistas
    customSuccessMessages: {
      create: 'Catálogo creado exitosamente',
      update: 'Catálogo actualizado exitosamente',
      delete: 'Catálogo eliminado exitosamente',
    },
  },
};

// ===============================
// HOOK PRINCIPAL PARA CATÁLOGOS
// ===============================

export const useCatalogosQueries = () => {
  const crud = useGenericCRUD<
    IMaestroCatalogo,
    ICreateMaestroCatalogoRequest,
    IUpdateMaestroCatalogoRequest,
    MaestroCatalogosParameters
  >(catalogosConfig);

  // Hook específico para toggle status
  const useToggleStatus = () => {
    return crud.useCustomMutation(
      async (id: number) => {
        await maestroCatalogosApi.toggleStatus(id);
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

// 🔥 RECOMENDADO: Hook principal para uso general
export const useCatalogosOperations = (params?: MaestroCatalogosParameters) => {
  const { usePagedOperations, useToggleStatus } = useCatalogosQueries();
  const toggleStatus = useToggleStatus();
  return {
    ...usePagedOperations(params),
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

// Para casos específicos donde necesites lista simple
export const useCatalogosSimple = (params?: MaestroCatalogosParameters) => {
  const { useOperations, useToggleStatus } = useCatalogosQueries();
  const toggleStatus = useToggleStatus();
  return {
    ...useOperations(params),
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

// Para obtener un catálogo específico
export const useCatalogo = (id: number | null) => {
  const { useById } = useCatalogosQueries();
  return useById(id);
};