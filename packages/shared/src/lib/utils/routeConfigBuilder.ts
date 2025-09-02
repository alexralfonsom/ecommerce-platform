// src/lib/utils/routeConfigBuilder.ts
import type { NavigationItem } from '@/types';

/**
 * Tipo para la configuración de rutas dinámica
 */
export interface DynamicRouteConfig {
  translationKey?: string;
  icon?: string;
  requiresAuth: boolean;
  dynamic?: boolean;
  menuTypeCode?: string; // Nuevo: para saber de qué tipo de menú viene
  originalMenuItem?: NavigationItem; // Referencia al item original
  children?: Record<string, DynamicRouteConfig>;
}

/**
 * Tipo para el SUPER ROUTE_CONFIG consolidado
 */
export type SuperRouteConfig = Record<string, DynamicRouteConfig>;

/**
 * Convierte un NavigationItem en una configuración de ruta
 */
function navigationItemToRouteConfig(
  item: NavigationItem,
  menuTypeCode: string,
  parentPath: string = '',
): DynamicRouteConfig {
  // Extraer el segmento de la ruta (sin path padre)
  const pathSegments = item.href.split('/').filter(Boolean);
  const currentSegment = pathSegments[pathSegments.length - 1];

  // Detectar si es una ruta dinámica (contiene [id], números, etc.)
  const isDynamic = /^\[.*\]$/.test(currentSegment) || /^[0-9]+$/.test(currentSegment);

  const config: DynamicRouteConfig = {
    // Usar globalUniqueId para unicidad, fallback al último segmento de URL
    translationKey: (item as any).globalUniqueId || currentSegment,
    icon: item.icon,
    requiresAuth: true, // Por defecto, los menús dinámicos requieren auth
    menuTypeCode,
    originalMenuItem: item,
    dynamic: isDynamic,
  };

  // Procesar children recursivamente
  if (item.children && item.children.length > 0) {
    config.children = {};

    item.children.forEach((child) => {
      const childPath = child.href.split('/').filter(Boolean);
      const childSegment = childPath[childPath.length - 1];
      const childKey = isDynamic && /^[0-9]+$/.test(childSegment) ? '[id]' : childSegment;

      config.children![childKey] = navigationItemToRouteConfig(child, menuTypeCode, item.href);
    });
  }

  return config;
}

/**
 * Construye una configuración de rutas desde un array de NavigationItems
 */
export function buildRouteConfigFromMenu(
  menuItems: NavigationItem[],
  menuTypeCode: string,
): SuperRouteConfig {
  const routeConfig: SuperRouteConfig = {};

  menuItems.forEach((item) => {
    // Extraer todos los segmentos de la ruta
    const pathSegments = item.href.split('/').filter(Boolean);

    if (pathSegments.length === 0) return;

    // Construir la configuración de ruta anidada
    let currentConfig = routeConfig;
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Detectar rutas dinámicas
      const isNumericId = /^[0-9]+$/.test(segment);
      const segmentKey = isNumericId ? '[id]' : segment;

      if (!currentConfig[segmentKey]) {
        if (isLast) {
          // Es el último segmento, usar toda la info del NavigationItem
          currentConfig[segmentKey] = navigationItemToRouteConfig(item, menuTypeCode, currentPath);
        } else {
          // Es un segmento intermedio, crear configuración básica
          currentConfig[segmentKey] = {
            // Para segmentos intermedios, usar el segmento como clave única
            translationKey: segment,
            icon: undefined,
            requiresAuth: true,
            menuTypeCode,
            children: {},
          };
        }
      }

      // Moverse al siguiente nivel
      if (!isLast) {
        if (!currentConfig[segmentKey].children) {
          currentConfig[segmentKey].children = {};
        }
        currentConfig = currentConfig[segmentKey].children!;
      }
    });
  });

  return routeConfig;
}

/**
 * Consolida múltiples ROUTE_CONFIGs en un SUPER ROUTE_CONFIG
 */
export function consolidateRouteConfigs(
  configs: Array<{
    menuTypeCode: string;
    routeConfig: SuperRouteConfig;
  }>,
): SuperRouteConfig {
  const consolidated: SuperRouteConfig = {};

  configs.forEach(({ menuTypeCode, routeConfig }) => {
    console.log(
      `🔗 Consolidating routes from ${menuTypeCode}:`,
      Object.keys(routeConfig).length,
      'routes',
    );

    // Mergear cada configuración
    Object.entries(routeConfig).forEach(([key, config]) => {
      if (!consolidated[key]) {
        consolidated[key] = { ...config };
      } else {
        // Si ya existe, mergear children y mantener la primera configuración principal
        if (config.children && consolidated[key].children) {
          consolidated[key].children = {
            ...consolidated[key].children,
            ...config.children,
          };
        } else if (config.children) {
          consolidated[key].children = config.children;
        }

        // Mantener metadatos del primer menú, pero agregar info de otros tipos
        consolidated[key].menuTypeCode = `${consolidated[key].menuTypeCode},${menuTypeCode}`;
      }
    });
  });

  console.log(
    `🎯 SUPER ROUTE_CONFIG generated with ${Object.keys(consolidated).length} root routes`,
  );
  return consolidated;
}

/**
 * Funciones helper para debugging y análisis
 */
export const routeConfigUtils = {
  /**
   * Analiza la profundidad del ROUTE_CONFIG
   */
  analyzeDepth(config: SuperRouteConfig): { maxDepth: number; totalRoutes: number } {
    let maxDepth = 0;
    let totalRoutes = 0;

    const traverse = (obj: any, depth: number = 0) => {
      maxDepth = Math.max(maxDepth, depth);

      Object.values(obj).forEach((value: any) => {
        totalRoutes++;
        if (value.children) {
          traverse(value.children, depth + 1);
        }
      });
    };

    traverse(config);
    return { maxDepth, totalRoutes };
  },

  /**
   * Encuentra una ruta específica en el config
   */
  findRoute(config: SuperRouteConfig, path: string): DynamicRouteConfig | null {
    const segments = path.split('/').filter(Boolean);
    let current: any = config;

    for (const segment of segments) {
      if (current[segment]) {
        current = current[segment];
      } else if (current['[id]'] && /^[0-9]+$/.test(segment)) {
        current = current['[id]'];
      } else if (current.children) {
        current = current.children;
        if (current[segment]) {
          current = current[segment];
        } else if (current['[id]'] && /^[0-9]+$/.test(segment)) {
          current = current['[id]'];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return current?.translationKey ? current : null;
  },

  /**
   * Lista todas las rutas disponibles
   */
  listAllRoutes(config: SuperRouteConfig): string[] {
    const routes: string[] = [];

    const traverse = (obj: any, path: string = '') => {
      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}/${key}` : key;

        if (value.translationKey) {
          routes.push(currentPath);
        }

        if (value.children) {
          traverse(value.children, currentPath);
        }
      });
    };

    traverse(config);
    return routes.sort();
  },
};
