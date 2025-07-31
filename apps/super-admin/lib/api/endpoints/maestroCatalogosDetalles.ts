// src/lib/api/endpoints/maestroCatalogosDetalles.ts
import { apiClient } from '@repo/shared/lib/api/client';

import {
  ICreateMaestroCatalogoDetalleRequest,
  IUpdateMaestroCatalogoDetalleRequest,
  MaestroCatalogoDetalleResponse,
  MaestroCatalogosDetalleListResponse,
  MaestroCatalogosDetallePagedResponse,
  MaestroCatalogosDetalleParameters,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';

import { API_ENDPOINTS_CATALOGS } from '@components/features/catalogos/types/MaestroCatalogosTypes';

export const maestroCatalogosDetalleApi = {
  /**
   * Obtiene un detalle por ID
   */
  getById: async (id: number): Promise<MaestroCatalogoDetalleResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/${id}`,
    );
    return response.data;
  },

  /**
   * Obtiene detalles por ID del catálogo maestro
   */
  getByMaestroId: async (
    idMaestro: number,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/${idMaestro}/detalles`,
      { params: { incluirInactivos } },
    );
    return response.data;
  },

  /**
   * Obtiene detalles paginados por ID del catálogo maestro
   */
  getPagedByMaestroId: async (
    idMaestro: number,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/${idMaestro}/detalles/paged`,
      { params },
    );
    return response.data;
  },

  /**
   * Obtiene detalles por nombre del catálogo maestro
   */
  getByMaestroName: async (
    nombreMaestro: string,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/tipo/${encodeURIComponent(nombreMaestro)}/detalles`,
      { params: { incluirInactivos } },
    );
    return response.data;
  },

  /**
   * Obtiene detalles paginados por nombre del catálogo maestro
   */
  getPagedByMaestroName: async (
    nombreMaestro: string,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/tipo/${encodeURIComponent(nombreMaestro)}/detalles/paged`,
      { params },
    );
    return response.data;
  },

  /**
   * Obtiene detalles usando Dapper por nombre del maestro
   */
  getDapperByMaestroName: async (
    nombreMaestro: string,
    incluirInactivos: boolean = false,
  ): Promise<MaestroCatalogosDetalleListResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/dapper/nombre/${encodeURIComponent(nombreMaestro)}/detalles`,
      { params: { incluirInactivos } },
    );
    return response.data;
  },

  /**
   * Obtiene detalles paginados usando Dapper por nombre del maestro
   */
  getPagedDapperByMaestroName: async (
    nombreMaestro: string,
    params?: MaestroCatalogosDetalleParameters,
  ): Promise<MaestroCatalogosDetallePagedResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/dapper/nombre/${encodeURIComponent(nombreMaestro)}/detalles/paged`,
      { params },
    );
    return response.data;
  },

  /**
   * Crea un nuevo detalle de catálogo
   */
  create: async (
    data: ICreateMaestroCatalogoDetalleRequest,
  ): Promise<MaestroCatalogoDetalleResponse> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/detalles`,
      data,
    );
    return response.data;
  },

  /**
   * Actualiza un detalle de catálogo existente
   */
  update: async (id: number, data: IUpdateMaestroCatalogoDetalleRequest): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/detalles/${id}`, data);
  },

  /**
   * Elimina un detalle de catálogo
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS_CATALOGS.MAESTRO_CATALOGOS_DETALLE}/detalles/${id}`);
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
