// src/lib/hooks/queries/useMenuHierarchy.ts
import React from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { menuHierarchyApi } from '@lib/api/endpoints';
import { getCurrentLocaleFromPath } from '@lib/utils/i18nUtils';
import { i18n } from '@configs/i18n';
import { mockNavigation, MockNavSecondary, MockProjectItems, mockUserOptions } from '@data/mocks';
import type {
  MenuHierarchyApiResponse,
  MenuItemApiResponse,
  MenuHierarchyHookConfig,
  MenuHierarchyState,
  EnrichedMenuItem,
} from '@repo/shared/types/menu';
import type { NavigationItem } from '@repo/shared/types/navigation';
import * as LucideIcons from 'lucide-react';

/**
 * Transforma un MenuItem de la API a NavigationItem
 */
function transformApiMenuToNavigationItem(
  apiItem: MenuItemApiResponse,
): NavigationItem {
  // Validar que el icono existe en Lucide
  const iconName = apiItem.icon as keyof typeof LucideIcons;
  const isValidIcon = iconName && iconName in LucideIcons;
  
  return {
    name: apiItem.name,
    href: apiItem.url,
    icon: isValidIcon ? iconName : 'Circle', // Fallback a 'Circle' si el icono no existe
    current: false, // Se establecerá dinámicamente en el componente
    children: apiItem.children?.map(transformApiMenuToNavigationItem) || [],
  };
}

/**
 * Transforma un MenuItem de la API a EnrichedMenuItem (con metadatos adicionales)
 */
function transformApiMenuToEnrichedItem(
  apiItem: MenuItemApiResponse,
): EnrichedMenuItem {
  const baseItem = transformApiMenuToNavigationItem(apiItem);
  
  return {
    ...baseItem,
    globalUniqueId: apiItem.globalUniqueId,
    description: apiItem.description,
    eventName: apiItem.eventName,
    parentGlobalUniqueId: apiItem.parentGlobalUniqueId,
    children: apiItem.children?.map(transformApiMenuToEnrichedItem) || [],
  };
}

/**
 * Query key factory para menús
 */
const createMenuQueryKeys = {
  all: ['menu-hierarchy'] as const,
  byLanguage: (languageCode: string, menuTypeCode: string) => 
    [...createMenuQueryKeys.all, languageCode, menuTypeCode] as const,
};

/**
 * Hook para cargar y gestionar la jerarquía de menús dinámicos
 * 
 * Características:
 * - Detección automática del idioma desde la URL
 * - Cache inteligente con stale time configurable
 * - Transformación automática a NavigationItem
 * - Fallback inteligente: mocks específicos en DEV, array vacío en PROD
 * - Soporte para invalidación de cache
 */
export function useMenuHierarchy(config: MenuHierarchyHookConfig = {}): MenuHierarchyState {
  const pathname = usePathname();
  
  // Obtener idioma actual desde la URL o fallback al default
  const currentLocale = getCurrentLocaleFromPath(pathname) || i18n.defaultLocale;
  const languageCode = currentLocale;

  // Configuración por defecto
  const {
    menuTypeCode = 'MAIN_MENU',
    includeInactive = false,
    enableCache = true,
    staleTime = 5 * 60 * 1000, // 5 minutos (el backend ya maneja cache)
    fallbackToMocks = true,
  } = config;

  /**
   * Obtener el mock apropiado según el tipo de menú
   */
  const getAppropiateFallbackMock = React.useCallback((menuType: string): NavigationItem[] => {
    const mockMap: Record<string, NavigationItem[]> = {
      'MAIN_MENU': mockNavigation,
      'SECONDARY_MENU': MockNavSecondary,
      'MENU_GLOBAL_ADMINISTRATIVE': MockProjectItems as NavigationItem[],
      'USER_MENU': mockUserOptions as NavigationItem[],
    };

    return mockMap[menuType] || [];
  }, []);

  /**
   * Estrategia inteligente de fallback:
   * - DEV: Usa mocks específicos por tipo de menú
   * - PROD: Array vacío para mejor UX (evita mostrar datos incorrectos)
   */
  const getIntelligentFallback = React.useCallback((menuType: string, enableFallback: boolean): NavigationItem[] => {
    // Si fallback está deshabilitado, siempre array vacío
    if (!enableFallback) {
      return [];
    }

    // En desarrollo: usar mocks específicos
    if (process.env.NODE_ENV === 'development') {
      const specificMock = getAppropiateFallbackMock(menuType);
      console.log(`🔧 DEV: Using specific mock for ${menuType}:`, specificMock.length, 'items');
      return specificMock;
    }

    // En producción: array vacío para mejor UX
    console.log(`🏭 PROD: Using empty fallback for ${menuType} to avoid user confusion`);
    return [];
  }, [getAppropiateFallbackMock]);

  // Query para obtener menús desde la API
  const queryOptions: UseQueryOptions<MenuHierarchyApiResponse> = {
    queryKey: createMenuQueryKeys.byLanguage(languageCode, menuTypeCode),
    queryFn: () => menuHierarchyApi.getMenuHierarchy({
      menuTypeCode,
      languageCode,
      includeInactive,
    }),
    enabled: enableCache,
    staleTime,
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    retry: (failureCount, error) => {
      // Solo reintentar errores de red, no errores 4xx
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          return false; // No reintentar errores 4xx
        }
      }
      return failureCount < 2; // Máximo 2 reintentos
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  };

  const query = useQuery(queryOptions);

  // Procesar datos y estados con estrategia inteligente de fallback
  const processedData = React.useMemo(() => {
    let items: NavigationItem[] = [];
    let enrichedItems: EnrichedMenuItem[] = [];
    
    if (query.isSuccess && query.data?.isSuccess && query.data.value?.items) {
      // Transformar datos de la API
      try {
        items = query.data.value.items.map(transformApiMenuToNavigationItem);
        enrichedItems = query.data.value.items.map(transformApiMenuToEnrichedItem);
      } catch (transformError) {
        console.error('❌ Error transforming menu data:', transformError);
        
        // Estrategia inteligente de fallback por transformación
        items = getIntelligentFallback(menuTypeCode, fallbackToMocks);
        enrichedItems = items.map(item => ({
          ...item,
          globalUniqueId: `transform-fallback-${Date.now()}-${Math.random()}`,
          description: `Transform fallback: ${item.name}`,
          eventName: '',
        }));
      }
    } else if (query.isError) {
      // Estrategia inteligente para errores de API
      console.warn('⚠️ API error for menu:', { 
        menuTypeCode, 
        error: query.error?.message,
        environment: process.env.NODE_ENV
      });
      
      items = getIntelligentFallback(menuTypeCode, fallbackToMocks);
      enrichedItems = items.map(item => ({
        ...item,
        globalUniqueId: `api-error-fallback-${Date.now()}-${Math.random()}`,
        description: `API error fallback: ${item.name}`,
        eventName: '',
      }));
    }

    return { items, enrichedItems };
  }, [query.data, query.isSuccess, query.isError, fallbackToMocks, menuTypeCode, getIntelligentFallback]);

  return {
    items: processedData.items,
    enrichedItems: processedData.enrichedItems,
    isLoading: query.isLoading,
    isError: query.isError && !fallbackToMocks,
    error: query.error,
    isSuccess: query.isSuccess || (query.isError && fallbackToMocks),
    languageCode,
    refetch: query.refetch,
  };
}

/**
 * Hook simplificado que solo devuelve NavigationItem[] (para compatibilidad directa)
 */
export function useMenuNavigationItems(config: MenuHierarchyHookConfig = {}): NavigationItem[] {
  const { items } = useMenuHierarchy(config);
  return items;
}

/**
 * Hook que devuelve información adicional del estado
 */
export function useMenuHierarchyWithStatus(config: MenuHierarchyHookConfig = {}) {
  const menuState = useMenuHierarchy(config);
  
  return {
    ...menuState,
    isEmpty: menuState.items.length === 0,
    isUsingFallback: menuState.isError && config.fallbackToMocks !== false,
    hasError: menuState.isError && !config.fallbackToMocks,
    isIntelligentFallback: process.env.NODE_ENV === 'development' ? 
      menuState.isError && menuState.items.length > 0 : 
      menuState.isError && menuState.items.length === 0,
  };
}

// Export query keys para uso externo (invalidación manual)
export { createMenuQueryKeys };