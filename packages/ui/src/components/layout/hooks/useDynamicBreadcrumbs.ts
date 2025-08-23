'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCurrentLocaleFromPath } from '@repo/shared/lib/utils';
import { APP_ROUTES } from '@repo/shared/configs/routes';
import { useDynamicRouteConfig } from '@repo/shared/lib/hooks';
import { IBreadcrumbItem } from '@repo/shared/types/BreadcrumbTypes';

/**
 * Hook para generar breadcrumbs dinámicos basados en el SUPER ROUTE_CONFIG
 *
 * Características:
 * - Usa el SUPER ROUTE_CONFIG generado desde todos los menús dinámicos
 * - Fallback al ROUTE_CONFIG estático
 * - Manejo inteligente de rutas dinámicas con IDs
 * - Cache automático cuando no cambian los menús
 * - Compatible con el sistema de breadcrumbs existente
 */
export const useDynamicBreadcrumbs = () => {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const tBreadcrumb = useTranslations('breadcrumb');

  // Cargar el SUPER ROUTE_CONFIG dinámico
  const { routeConfig, isLoading, findRoute } = useDynamicRouteConfig({
    menuTypes: ['MAIN_MENU', 'SECONDARY_MENU', 'MENU_GLOBAL_ADMINISTRATIVE', 'USER_MENU'],
    enableLogging: process.env.NODE_ENV === 'development',
  });

  const breadcrumbs = useMemo(() => {
    // Si está cargando, devolver breadcrumb básico
    if (isLoading) {
      return [
        {
          name: t('home'),
          href: '/',
          current: true,
          icon: 'House',
        },
      ];
    }

    // Obtener locale actual y limpiar pathname
    const currentLocale = getCurrentLocaleFromPath(pathname);
    const cleanPath = currentLocale ? pathname.replace(`/${currentLocale}`, '') : pathname;

    // Dividir path en segmentos
    const segments = cleanPath.split('/').filter(Boolean);

    // Detectar si estamos en la ruta por defecto (home)
    const isAtDefault = segments.length === 1 && segments[0] === APP_ROUTES.defaultSection;

    // Si estamos en home, retornar breadcrumb simple
    if (segments.length === 0) {
      return [
        {
          name: t('home'),
          href: currentLocale
            ? APP_ROUTES.getDefaultRouteForLocale(currentLocale)
            : `/${APP_ROUTES.defaultSection}`,
          current: true,
          icon: 'House',
        },
      ];
    }

    const items: IBreadcrumbItem[] = [];
    let currentPath = currentLocale ? `/${currentLocale}` : '';

    // Agregar home como primer elemento solo si no estamos en la ruta por defecto
    if (!isAtDefault) {
      items.push({
        name: t('home'),
        href: currentLocale
          ? APP_ROUTES.getDefaultRouteForLocale(currentLocale)
          : `/${APP_ROUTES.defaultSection}`,
        current: false,
        icon: 'House',
      });
    }

    // Procesar cada segmento usando el SUPER ROUTE_CONFIG dinámico
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Buscar configuración en el SUPER ROUTE_CONFIG dinámico
      const routeConfig = findDynamicRouteConfig(segments, index, findRoute);

      let name: string;
      let icon: string | undefined;

      if (routeConfig) {
        if (routeConfig.originalMenuItem?.name) {
          // ✅ PRIORIDAD 1: Usar el nombre original del menú (siempre correcto, sin espacios, ya traducido)
          if (routeConfig.dynamic) {
            // Para rutas dinámicas, combinar nombre del menú + ID
            const dynamicValue = segment;
            name = tBreadcrumb('dynamicRoute', {
              type: routeConfig.originalMenuItem.name,
              value: dynamicValue,
            });
          } else {
            name = routeConfig.originalMenuItem.name;
          }
        } else if (routeConfig.translationKey) {
          // ✅ FALLBACK: Solo usar translationKey si no hay originalMenuItem
          if (routeConfig.dynamic) {
            const dynamicValue = segment;
            name = tBreadcrumb('dynamicRoute', {
              type: routeConfig.translationKey,
              value: dynamicValue,
            });
          } else {
            name = routeConfig.translationKey;
          }
        } else {
          // ✅ ÚLTIMO RECURSO: capitalizar el segmento
          name = segment.charAt(0).toUpperCase() + segment.slice(1);
        }

        icon = routeConfig.icon;
      } else {
        // Fallback: capitalizar el segmento cuando no hay config
        name = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      items.push({
        name,
        href: currentPath,
        current: isLast,
        icon,
        disabled: routeConfig?.requiresAuth && !isAuthenticated(), // Opcional
      });
    });

    return items;
  }, [pathname, t, tBreadcrumb, routeConfig, isLoading, findRoute]);

  return {
    breadcrumbs,
    isLoading,
    routeConfigStats: {
      totalRoutes: Object.keys(routeConfig).length,
      hasStaticFallback: Object.values(routeConfig).some((config: any) =>
        config.menuTypeCode?.includes('STATIC_CONFIG'),
      ),
    },
  };
};

/**
 * Función helper para encontrar configuración de ruta en el SUPER ROUTE_CONFIG dinámico
 */
function findDynamicRouteConfig(
  segments: string[],
  currentIndex: number,
  findRoute: (path: string) => any,
) {
  // Construir el path hasta el índice actual
  const pathToFind = segments.slice(0, currentIndex + 1).join('/');

  // Buscar directamente en el SUPER ROUTE_CONFIG
  let config = findRoute(pathToFind);

  if (config) {
    return config;
  }

  // Si no se encuentra directamente, intentar con rutas dinámicas
  const pathWithDynamicIds = segments
    .slice(0, currentIndex + 1)
    .map((segment, index) => {
      // Convertir IDs numéricos a [id] para la búsqueda
      return /^[0-9]+$/.test(segment) ? '[id]' : segment;
    })
    .join('/');

  config = findRoute(pathWithDynamicIds);

  if (config) {
    return config;
  }

  // Última oportunidad: buscar configuración padre y marcar como dinámico
  if (currentIndex > 0) {
    const parentPath = segments.slice(0, currentIndex).join('/');
    const parentConfig = findRoute(parentPath);

    if (parentConfig && /^[0-9]+$/.test(segments[currentIndex])) {
      return {
        ...parentConfig,
        dynamic: true,
        translationKey: parentConfig.translationKey || segments[currentIndex - 1],
      };
    }
  }

  return null;
}

/**
 * Función helper para verificar autenticación (puedes personalizar)
 */
function isAuthenticated(): boolean {
  // Implementar tu lógica de autenticación aquí
  // Por ejemplo, verificar si hay un token en el contexto de autenticación
  return true;
}
