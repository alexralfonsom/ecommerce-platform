// ===============================
// MAESTRO CATÁLOGOS DETALLE
// ===============================

import { IMaestroCatalogo } from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { ApiResponse, PagedResult } from '@repo/shared/types/api';

export interface IMaestroCatalogoDetalle {
  id: number;
  idMaestro: number;
  nombre: string;
  activo: boolean;
  codigo?: string;
  evento?: string;
  fechaCreacion: string;
  creadoPor: string;
  fechaModificacion?: string;
  modificadoPor?: string;
  // Navegación
  maestro?: IMaestroCatalogo;
}

export interface ICreateMaestroCatalogoDetalleRequest {
  nombre: string;
  idMaestro: number;
  codigo?: string;
  evento?: string;
}

export interface IUpdateMaestroCatalogoDetalleRequest {
  id: number;
  nombre: string;
  activo: boolean;
  codigo?: string;
  evento?: string;
}

export interface MaestroCatalogosDetalleParameters {
  pageNumber?: number;
  pageSize?: number;
  nombreFiltro?: string;
  codigoFiltro?: string;
  eventoFiltro?: string;
  incluirInactivos?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// ===============================
// TIPOS DE RESPUESTA ESPECÍFICOS
// ===============================

export type MaestroCatalogoDetalleResponse = ApiResponse<IMaestroCatalogoDetalle>;
export type MaestroCatalogosDetalleListResponse = ApiResponse<IMaestroCatalogoDetalle[]>;
export type MaestroCatalogosDetallePagedResponse = ApiResponse<
  PagedResult<IMaestroCatalogoDetalle>
>;
