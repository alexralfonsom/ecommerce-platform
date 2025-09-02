// src/lib/api/endpoints/maestroCatalogosDetalles.ts
import { getUniversalBusinessApiClient } from '@repo/shared/lib/api';

import {
  ICreateMaestroCatalogoDetalleRequest,
  IUpdateMaestroCatalogoDetalleRequest,
  MaestroCatalogoDetalleResponse,
  MaestroCatalogosDetalleListResponse,
  MaestroCatalogosDetallePagedResponse,
  MaestroCatalogosDetalleParameters,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { ApiResponse } from '@repo/shared/types/api';

import {
  API_ENDPOINTS_CATALOGS,
  MaestroCatalogosPagedResponse,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { buildUrlWithParams } from '@repo/shared/lib/utils';

export const maestroCatalogosDetalleApi = {
  /**
   * Obtiene un detalle por ID
   */
  getById: async (id: number): Promise<MaestroCatalogoDetalleResponse> => {
    return await getUniversalBusinessApiClient().get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/${id}`,
    );
  },

  /**
   * Obtiene detalles por ID del catálogo maestro
   */
  getByMaestroId: async (
    idMaestro: number,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const endpoint = buildUrlWithParams(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/${idMaestro}/detalles`,
      {
        getAllRecords: true,
        incluirInactivos: incluirInactivos,
      },
    );
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetalleListResponse>(endpoint);
  },

  /**
   * Obtiene detalles paginados por ID del catálogo maestro
   */
  getPagedByMaestroId: async (
    idMaestro: number,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const endpoint = buildUrlWithParams(API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS, params);
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetallePagedResponse>(
      endpoint,
    );
  },

  /**
   * Obtiene detalles por nombre del catálogo maestro
   */
  getByMaestroName: async (
    nombreMaestro: string,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const endpoint = buildUrlWithParams(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/tipo/${encodeURIComponent(nombreMaestro)}/detalles`,
      {
        incluirInactivos: incluirInactivos,
      },
    );
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetalleListResponse>(endpoint);
  },

  /**
   * Obtiene detalles paginados por nombre del catálogo maestro
   */
  getPagedByMaestroName: async (
    nombreMaestro: string,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const endpoint = buildUrlWithParams(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/tipo/${encodeURIComponent(nombreMaestro)}/detalles/paged`,
      params,
    );
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetallePagedResponse>(
      endpoint,
    );
  },

  /**
   * Obtiene detalles usando Dapper por nombre del maestro
   */
  getDapperByMaestroName: async (
    nombreMaestro: string,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const endpoint = buildUrlWithParams(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/dapper/nombre/${encodeURIComponent(nombreMaestro)}/detalles`,
      {
        incluirInactivos: incluirInactivos,
      },
    );
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetalleListResponse>(endpoint);
  },

  /**
   * Obtiene detalles paginados usando Dapper por nombre del maestro
   */
  getPagedDapperByMaestroName: async (
    nombreMaestro: string,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const endpoint = buildUrlWithParams(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/dapper/nombre/${encodeURIComponent(nombreMaestro)}/detalles/paged`,
      params,
    );
    return await getUniversalBusinessApiClient().get<MaestroCatalogosDetallePagedResponse>(
      endpoint,
    );
  },

  /**
   * Crea un nuevo detalle de catálogo
   */
  create: async (
    data: ICreateMaestroCatalogoDetalleRequest,
  ): Promise<MaestroCatalogoDetalleResponse> => {
    return await getUniversalBusinessApiClient().post<MaestroCatalogoDetalleResponse>(
      API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE,
      data,
    );
  },

  /**
   * Actualiza un detalle de catálogo existente
   */
  update: async (
    id: number,
    data: IUpdateMaestroCatalogoDetalleRequest,
  ): Promise<ApiResponse<void>> => {
    return await getUniversalBusinessApiClient().put(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/detalles/${id}`,
      data,
    );
  },

  /**
   * Elimina un detalle de catálogo
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return await getUniversalBusinessApiClient().delete(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/detalles/${id}`,
    );
  },

  /**
   * Cambia el estado de un detalle de catálogo
   */
  toggleStatus: async (id: number): Promise<void> => {
    const detalle = await maestroCatalogosDetalleApi.getById(id);
    if (detalle.isSuccess) {
      await maestroCatalogosDetalleApi.update(id, {
        id: detalle.value.id,
        nombre: detalle.value.nombre,
        activo: !detalle.value.activo,
        codigo: detalle.value.codigo,
        evento: detalle.value.evento,
      });
    }
  },
};
