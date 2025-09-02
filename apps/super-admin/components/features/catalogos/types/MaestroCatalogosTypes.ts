// ===============================
// MAESTRO CATÁLOGOS
// ===============================

import { ApiResponse, PagedApiResponse, ListApiResponse } from '@repo/shared/types/api';

export interface IMaestroCatalogo {
  id: number;
  nombre: string;
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ICreateMaestroCatalogoRequest {
  nombre: string;
  activo: boolean;
}

export interface IUpdateMaestroCatalogoRequest {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface MaestroCatalogosParameters {
  pageNumber?: number;
  pageSize?: number;
  nombreFiltro?: string;
  incluirInactivos?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// ===============================
// TIPOS DE RESPUESTA ESPECÍFICOS
// ===============================

export type MaestroCatalogoResponse = ApiResponse<IMaestroCatalogo>;
export type MaestroCatalogosListResponse = ListApiResponse<IMaestroCatalogo>;
export type MaestroCatalogosPagedResponse = PagedApiResponse<IMaestroCatalogo>;

// ===============================
// CONSTANTES Y ENUMS
// ===============================

export const API_ENDPOINTS_CATALOGS = {
  MAESTRO_CATALOGOS: '/api/MaestroCatalogos',
  MAESTRO_CATALOGOS_DETALLE: '/api/MaestroCatalogosDetalle',
} as const;
