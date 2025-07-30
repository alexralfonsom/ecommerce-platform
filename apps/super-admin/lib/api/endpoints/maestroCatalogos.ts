// src/lib/api/endpoints/maestroCatalogos.ts
import { apiClient } from '@repo/shared/lib/api/client';
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
  getAll: async (
    params?: Partial<MaestroCatalogosParameters>,
  ): Promise<MaestroCatalogosListResponse> => {
    const response = await apiClient.get(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, {
      params: {
        ...params,
        getAllRecords: true,
      },
    });
    return response.data;
  },

  /**
   * Obtiene catálogos maestros paginados
   */
  getPaged: async (params?: MaestroCatalogosParameters): Promise<MaestroCatalogosPagedResponse> => {
    const response = await apiClient.get(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, { params });
    return response.data;
  },

  /**
   * Obtiene un catálogo maestro por ID
   */
  getById: async (id: number): Promise<MaestroCatalogoResponse> => {
    const response = await apiClient.get(`${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo catálogo maestro
   */
  create: async (data: ICreateMaestroCatalogoRequest): Promise<MaestroCatalogoResponse> => {
    const response = await apiClient.post(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, data);
    return response.data;
  },

  /**
   * Actualiza un catálogo maestro existente
   */
  update: async (id: number, data: IUpdateMaestroCatalogoRequest): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`, data);
  },

  /**
   * Elimina un catálogo maestro
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS}/${id}`);
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
