import { maestroCatalogosApi } from '@/lib/api/endpoints/maestroCatalogos';
import {
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
  MaestroCatalogosParameters,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { useGenericCRUD } from '@repo/shared/lib/hooks';

// Tipos explícitos para resolver el error TS2742
type CatalogosQueriesReturn = ReturnType<
  typeof useGenericCRUD<
    IMaestroCatalogo,
    ICreateMaestroCatalogoRequest,
    IUpdateMaestroCatalogoRequest,
    MaestroCatalogosParameters
  >
>;

type CatalogosOperationsReturn = ReturnType<CatalogosQueriesReturn['usePagedOperations']>;
type CatalogosSimpleReturn = ReturnType<CatalogosQueriesReturn['useOperations']>;
type CatalogoByIdReturn = ReturnType<CatalogosQueriesReturn['useById']>;

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
    update: maestroCatalogosApi.update,
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

export const useCatalogosQueries = (): CatalogosQueriesReturn => {
  return useGenericCRUD<
    IMaestroCatalogo,
    ICreateMaestroCatalogoRequest,
    IUpdateMaestroCatalogoRequest,
    MaestroCatalogosParameters
  >(catalogosConfig);
};

// ===============================
// 🎯 HOOKS DE CONVENIENCIA (EXPORTADOS)
// ===============================

// 🔥 RECOMENDADO: Hook principal para uso general con paginación
export const useCatalogosOperations = (
  params?: MaestroCatalogosParameters,
): CatalogosOperationsReturn => {
  const { usePagedOperations } = useCatalogosQueries();
  return usePagedOperations(params);
};

// Para casos específicos donde necesites lista simple sin paginación
export const useCatalogosSimple = (params?: MaestroCatalogosParameters): CatalogosSimpleReturn => {
  const { useOperations } = useCatalogosQueries();
  return useOperations(params);
};

// Para obtener un catálogo específico por ID (exportado para casos específicos)
export const useCatalogo = (id: number | null): CatalogoByIdReturn => {
  const { useById } = useCatalogosQueries();
  return useById(id);
};
