'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCurrentLocaleFromPath } from '@repo/shared/lib/utils/i18nUtils';
import { APP_ROUTES, ROUTE_CONFIG } from '@repo/shared/configs/routes';
import { IBreadcrumbItem } from '@repo/shared/types/BreadcrumbTypes';

export const useBreadcrumbs = () => {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const tBreadcrumb = useTranslations('breadcrumb');

  const breadcrumbs = useMemo(() => {
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
            : `/ ${APP_ROUTES.defaultSection}`,
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

    // Procesar cada segmento
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Buscar configuración para este segmento
      const routeConfig = findRouteConfig(segments, index);

      let name: string;
      let icon: string | undefined;

      if (routeConfig) {
        if (routeConfig.dynamic && routeConfig.translationKey) {
          // Para rutas dinámicas, usar el ID como parte del nombre
          const dynamicValue = segment;
          name = tBreadcrumb('dynamicRoute', {
            type: t(routeConfig.translationKey as any),
            value: dynamicValue,
          });
        } else {
          name = t(routeConfig.translationKey as any);
        }
        icon = routeConfig.icon;
      } else {
        // Fallback: capitalizar el segmento
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
  }, [pathname, t, tBreadcrumb]);

  return breadcrumbs;
};

// Función helper para encontrar configuración de ruta
function findRouteConfig(segments: string[], currentIndex: number) {
  let config: any = ROUTE_CONFIG;

  for (let i = 0; i <= currentIndex; i++) {
    const segment = segments[i];

    if (config[segment]) {
      config = config[segment];
    } else if (config['[id]'] && /^[0-9]+$/.test(segment)) {
      // Ruta dinámica con ID numérico
      config = { ...config['[id]'], dynamic: true };
    } else if (config.children && config.children[segment]) {
      config = config.children[segment];
    } else if (config.children && config.children['[id]'] && /^[0-9]+$/.test(segment)) {
      config = { ...config.children['[id]'], dynamic: true };
    } else {
      return null;
    }
  }

  return config;
}

// Función helper para verificar autenticación (puedes personalizar)
function isAuthenticated(): boolean {
  // Implementar tu lógica de autenticación aquí
  return true;
}
