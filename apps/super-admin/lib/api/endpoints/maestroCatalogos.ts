// src/lib/api/endpoints/maestroCatalogos.ts
import { getUniversalBusinessApiClient } from '@repo/shared/lib/api';
import { ApiResponse } from '@repo/shared/types/api';
import { buildUrlWithParams } from '@repo/shared/lib/utils';
import {
  API_ENDPOINTS_CATALOGS,
  ICreateMaestroCatalogoRequest,
  IUpdateMaestroCatalogoRequest,
  MaestroCatalogoResponse,
  MaestroCatalogosListResponse,
  MaestroCatalogosPagedResponse,
  MaestroCatalogosParameters,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';

export const maestroCatalogosApi = {
  /**
   * Obtiene todos los catálogos maestros (sin paginar)
   */
  getAll: async (): Promise<MaestroCatalogosListResponse> => {
    const endpoint = buildUrlWithParams(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, {
      getAllRecords: true,
    });
    return await getUniversalBusinessApiClient().get<MaestroCatalogosListResponse>(endpoint);
  },

  /**
   * Obtiene catálogos maestros paginados
   */
  getPaged: async (params?: MaestroCatalogosParameters): Promise<MaestroCatalogosPagedResponse> => {
    const endpoint = buildUrlWithParams(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, params);
    return await getUniversalBusinessApiClient().get<MaestroCatalogosPagedResponse>(endpoint);
  },

  /**
   * Obtiene un catálogo maestro por ID
   */
  getById: async (id: number): Promise<MaestroCatalogoResponse> => {
    return await getUniversalBusinessApiClient().get<MaestroCatalogoResponse>(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`,
    );
  },

  /**
   * Crea un nuevo catálogo maestro
   */
  create: async (data: ICreateMaestroCatalogoRequest): Promise<MaestroCatalogoResponse> => {
    return await getUniversalBusinessApiClient().post<MaestroCatalogoResponse>(
      API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS,
      data,
    );
  },

  /**
   * Actualiza un catálogo maestro existente
   */
  update: async (id: number, data: IUpdateMaestroCatalogoRequest): Promise<ApiResponse<void>> => {
    return await getUniversalBusinessApiClient().put(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`,
      data,
    );
  },

  /**
   * Elimina un catálogo maestro
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return await getUniversalBusinessApiClient().delete(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`,
    );
  },

  /**
   * Cambia el estado de un catálogo maestro
   */
  toggleStatus: async (id: number): Promise<void> => {
    const catalogo = await maestroCatalogosApi.getById(id);
    if (catalogo.isSuccess) {
      await maestroCatalogosApi.update(id, {
        id: catalogo.value.id,
        nombre: catalogo.value.nombre,
        activo: !catalogo.value.activo,
      });
    }
  },
};
