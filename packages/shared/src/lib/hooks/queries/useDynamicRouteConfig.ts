// src/lib/hooks/queries/useDynamicRouteConfig.ts
import React from 'react';
import { useMenuHierarchy } from './useMenuHierarchy';
import { buildRouteConfigFromMenu, consolidateRouteConfigs, type SuperRouteConfig } from '@lib/utils/routeConfigBuilder';

/**
 * Configuración para el hook de ROUTE_CONFIG dinámico
 */
export interface DynamicRouteConfigHookConfig {
  /**
   * Tipos de menú a incluir en el SUPER ROUTE_CONFIG
   */
  menuTypes?: string[];
  
  /**
   * Si debe habilitar logging para debugging
   */
  enableLogging?: boolean;
  
  /**
   * Configuraciones específicas por tipo de menú
   */
  menuConfigs?: Record<string, {
    fallbackToMocks?: boolean;
    staleTime?: number;
  }>;
}

/**
 * Hook para generar un SUPER ROUTE_CONFIG consolidado desde múltiples menús dinámicos
 * 
 * Este hook:
 * 1. Carga múltiples tipos de menús en paralelo
 * 2. Convierte cada menú en un ROUTE_CONFIG
 * 3. Consolida todos los ROUTE_CONFIGs en uno solo
 * 4. Mantiene cache inteligente por tipo de menú
 * 5. Se actualiza automáticamente cuando cambian los menús
 */
export function useDynamicRouteConfig(config: DynamicRouteConfigHookConfig = {}) {
  const {
    menuTypes = ['MAIN_MENU', 'SECONDARY_MENU', 'MENU_GLOBAL_ADMINISTRATIVE', 'USER_MENU'],
    enableLogging = process.env.NODE_ENV === 'development',
    menuConfigs = {},
  } = config;

  // Cargar todos los menús especificados en paralelo
  const menuQueries = menuTypes.map(menuTypeCode => {
    const menuConfig = menuConfigs[menuTypeCode] || {};
    
    return useMenuHierarchy({
      menuTypeCode,
      fallbackToMocks: menuConfig.fallbackToMocks ?? true,
      staleTime: menuConfig.staleTime ?? 5 * 60 * 1000,
      enableCache: true,
    });
  });

  // Generar el SUPER ROUTE_CONFIG consolidado
  const superRouteConfig = React.useMemo(() => {
    if (enableLogging) {
      console.log('🏗️ Building SUPER ROUTE_CONFIG from', menuTypes.length, 'menu types');
    }

    // Construir configuraciones individuales para cada menú
    const individualConfigs = menuQueries.map((menuQuery, index) => {
      const menuTypeCode = menuTypes[index];
      
      if (!menuQuery.isSuccess || menuQuery.items.length === 0) {
        if (enableLogging) {
          console.log(`⚠️ ${menuTypeCode}: No items available (loading: ${menuQuery.isLoading}, error: ${!!menuQuery.error})`);
        }
        return null;
      }

      const routeConfig = buildRouteConfigFromMenu(menuQuery.items, menuTypeCode);
      
      if (enableLogging) {
        console.log(`✅ ${menuTypeCode}: Generated ${Object.keys(routeConfig).length} route configs`);
      }

      return {
        menuTypeCode,
        routeConfig,
      };
    }).filter(Boolean) as Array<{ menuTypeCode: string; routeConfig: SuperRouteConfig }>;

    // Consolidar todas las configuraciones
    const consolidated = consolidateRouteConfigs(individualConfigs);

    if (enableLogging) {
      const stats = routeConfigUtils.analyzeDepth(consolidated);
      console.log(`🎯 SUPER ROUTE_CONFIG ready:`, {
        rootRoutes: Object.keys(consolidated).length,
        totalRoutes: stats.totalRoutes,
        maxDepth: stats.maxDepth,
        sources: individualConfigs.map(c => c.menuTypeCode).join(', '),
      });
    }

    return consolidated;
  }, [
    // Dependencies: re-calcular cuando cambien los resultados de los queries
    ...menuQueries.map(q => q.items),
    ...menuQueries.map(q => q.isSuccess),
    ...menuQueries.map(q => q.isLoading),
    enableLogging,
  ]);

  // Estados consolidados
  const isLoading = menuQueries.some(q => q.isLoading);
  const hasErrors = menuQueries.some(q => q.isError);
  const isSuccess = menuQueries.every(q => q.isSuccess || q.error); // Success si todos terminaron (con éxito o error)
  const isEmpty = Object.keys(superRouteConfig).length === 0;

  // Funciones de utilidad
  const findRoute = React.useCallback((path: string) => {
    return routeConfigUtils.findRoute(superRouteConfig, path);
  }, [superRouteConfig]);

  const getAllRoutes = React.useCallback(() => {
    return routeConfigUtils.listAllRoutes(superRouteConfig);
  }, [superRouteConfig]);

  const getRoutesByMenuType = React.useCallback((menuTypeCode: string) => {
    const routes = routeConfigUtils.listAllRoutes(superRouteConfig);
    return routes.filter(route => {
      const config = routeConfigUtils.findRoute(superRouteConfig, route);
      return config?.menuTypeCode?.includes(menuTypeCode);
    });
  }, [superRouteConfig]);

  // Función para invalidar cache de menús específicos
  const invalidateMenus = React.useCallback((menuTypesToInvalidate?: string[]) => {
    const typesToInvalidate = menuTypesToInvalidate || menuTypes;
    
    menuQueries.forEach((query, index) => {
      const menuType = menuTypes[index];
      if (typesToInvalidate.includes(menuType)) {
        query.refetch();
      }
    });
  }, [menuQueries, menuTypes]);

  return {
    // SUPER ROUTE_CONFIG principal
    routeConfig: superRouteConfig,

    // Estados
    isLoading,
    hasErrors,
    isSuccess,
    isEmpty,
    
    // Estadísticas
    stats: {
      menuTypesLoaded: menuQueries.filter(q => q.isSuccess).length,
      totalMenuTypes: menuTypes.length,
      totalRoutes: Object.keys(superRouteConfig).length,
      loadedMenuTypes: menuTypes.filter((_, i) => menuQueries[i].isSuccess),
    },

    // Funciones de utilidad
    findRoute,
    getAllRoutes,
    getRoutesByMenuType,
    invalidateMenus,

    // Queries individuales para debugging
    individualQueries: Object.fromEntries(
      menuTypes.map((type, index) => [type, menuQueries[index]])
    ),
  };
}

// Re-export utilities para que estén disponibles
import { routeConfigUtils } from '@lib/utils/routeConfigBuilder';
export { routeConfigUtils };