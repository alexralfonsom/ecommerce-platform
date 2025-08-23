// src/types/menu.ts
import { NavigationItem } from './navigation';

/**
 * Estructura de respuesta de la API MenuHierarchy
 */
export interface MenuHierarchyApiResponse {
  value: {
    items: MenuItemApiResponse[];
  };
  status: string;
  isSuccess: boolean;
  title: string;
  successMessage: string;
  correlationId: string;
  location: string;
  errors: string[];
  validationErrors: string[];
}

/**
 * Item de menú desde la API
 */
export interface MenuItemApiResponse {
  globalUniqueId: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  eventName: string;
  parentGlobalUniqueId?: string;
  children: MenuItemApiResponse[];
}

/**
 * Parámetros para obtener la jerarquía de menús
 */
export interface MenuHierarchyParams {
  menuTypeCode?: string;
  languageCode: string;
  includeInactive?: boolean;
}

/**
 * Menu item enriquecido con metadatos adicionales
 */
export interface EnrichedMenuItem extends NavigationItem {
  globalUniqueId: string;
  description: string;
  eventName: string;
  parentGlobalUniqueId?: string;
}

/**
 * Configuración del hook de menús
 */
export interface MenuHierarchyHookConfig {
  menuTypeCode?: string;
  includeInactive?: boolean;
  enableCache?: boolean;
  staleTime?: number;
  fallbackToMocks?: boolean;
}

/**
 * Estado del hook de menús
 */
export interface MenuHierarchyState {
  items: NavigationItem[];
  enrichedItems: EnrichedMenuItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  languageCode: string;
  refetch: () => void;
}