import { maestroCatalogosDetalleApi } from '@/lib/api/endpoints/maestroCatalogosDetalles';
import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
  MaestroCatalogosDetalleParameters,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { useGenericCRUD } from '@repo/shared/lib/hooks';

// Tipos explícitos para resolver el error TS2742
type CatalogosDetalleQueriesReturn = ReturnType<
  typeof useGenericCRUD<
    IMaestroCatalogoDetalle,
    ICreateMaestroCatalogoDetalleRequest,
    IUpdateMaestroCatalogoDetalleRequest,
    MaestroCatalogosDetalleParameters
  >
>;

type CatalogosDetalleOperationsReturn = ReturnType<
  CatalogosDetalleQueriesReturn['usePagedOperations']
>;
type CatalogosDetalleSimpleReturn = ReturnType<CatalogosDetalleQueriesReturn['useOperations']>;
type CatalogoDetalleByIdReturn = ReturnType<CatalogosDetalleQueriesReturn['useById']>;

// ===============================
// CONFIGURACIÓN ESPECÍFICA PARA CATÁLOGOS DETALLES
// ===============================

const catalogosDetalleConfig = {
  entityName: 'catalogosDetalle',
  entityType: 'STABLE' as const,
  api: {
    // Adaptador para getAll que funciona con parentId
    getAll: (params?: MaestroCatalogosDetalleParameters) => {
      if (!params?.parentId) {
        throw new Error('parentId (idMaestro) es requerido para obtener detalles');
      }
      return maestroCatalogosDetalleApi.getByMaestroId(
        params.parentId,
        params.incluirInactivos || false,
      );
    },
    // Adaptador para getPaged que funciona con parentId
    getPaged: (params?: MaestroCatalogosDetalleParameters) => {
      if (!params?.parentId) {
        throw new Error('parentId (idMaestro) es requerido para obtener detalles paginados');
      }
      return maestroCatalogosDetalleApi.getPagedByMaestroId(params.parentId, params);
    },
    getById: maestroCatalogosDetalleApi.getById,
    create: maestroCatalogosDetalleApi.create,
    // Usar respuestas reales del backend - no más adaptadores sintéticos
    update: maestroCatalogosDetalleApi.update,
    delete: maestroCatalogosDetalleApi.delete,
  },
  options: {
    enableOptimisticUpdates: true,
    requiresParent: true, // Los detalles requieren un parentId (idMaestro)
    parentFieldName: 'parentId',
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

export const useCatalogosDetalleQueries = (): CatalogosDetalleQueriesReturn => {
  return useGenericCRUD<
    IMaestroCatalogoDetalle,
    ICreateMaestroCatalogoDetalleRequest,
    IUpdateMaestroCatalogoDetalleRequest,
    MaestroCatalogosDetalleParameters
  >(catalogosDetalleConfig);
};

// ===============================
// 🎯 HOOKS DE CONVENIENCIA (EXPORTADOS)
// ===============================

export const useCatalogosDetalleOperations = (
  idMaestro: number | null,
  params?: MaestroCatalogosDetalleParameters,
): CatalogosDetalleOperationsReturn => {
  const { usePagedOperations } = useCatalogosDetalleQueries();

  // Combinar idMaestro con params para el parentId
  const finalParams = {
    ...params,
    parentId: idMaestro ?? undefined, // Convertir null a undefined
  };

  return usePagedOperations(finalParams);
};

// Para casos específicos donde necesites lista simple (sin paginación)
export const useCatalogosDetalleSimple = (
  idMaestro: number | null,
  incluirInactivos: boolean = false,
): CatalogosDetalleSimpleReturn => {
  const { useOperations } = useCatalogosDetalleQueries();

  // Combinar idMaestro con incluirInactivos para el parentId
  const params = {
    parentId: idMaestro ?? undefined, // Convertir null a undefined
    incluirInactivos,
  };

  return useOperations(params);
};

// Hook específico solo para obtener un detalle por ID (sin dependencia del parent)
export const useCatalogoDetalleById = (id: number | null): CatalogoDetalleByIdReturn => {
  const { useById } = useCatalogosDetalleQueries();
  return useById(id);
};
