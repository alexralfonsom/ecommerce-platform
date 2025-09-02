// src/lib/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// ===============================
// CONFIGURACIÓN GLOBAL PARA TODAS LAS ENTIDADES
// ===============================

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Tiempo que los datos se consideran "frescos"
        staleTime: 5 * 60 * 1000, // 5 minutos

        // Tiempo que los datos permanecen en caché después de no ser usados
        gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)

        // Reintentos automáticos en caso de error
        retry: (failureCount, error: any) => {
          // 🚫 No reintentar errores 4xx (errores del cliente y ya controlado)
          if (error?.apiError?.statusCode >= 400 && error?.apiError?.statusCode < 500) {
            return false;
          }

          // 🚫 No reintentar errores de CORS
          if (error?.apiError?.type == 'cors') {
            return false;
          }

          // ✅ Reintentar errores 5xx del servidor (máximo 2 intentos)
          if (error?.apiError?.statusCode >= 500) {
            return failureCount < 2;
          }

          // ✅ Reintentar otros errores de red transitorios
          return failureCount < 2;
        },
        // Configuración de refetch
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        refetchOnReconnect: true,
        refetchOnMount: false,

        // Configuración de network
        networkMode: 'always', // Permite queries offline con caché
      },

      mutations: {
        // Reintentos para mutaciones (crear, actualizar, eliminar)
        retry: 1,

        // Network mode para mutaciones
        networkMode: 'online', // Solo ejecutar si hay conexión
      },
    },
  });

// ===============================
// PROVIDER COMPONENT
// ===============================

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Crear una instancia única del QueryClient
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

// ===============================
// UTILITIES PARA QUERY KEYS GLOBALES
// ===============================

/**
 * Factory para crear query keys consistentes
 * Útil para todas las entidades del sistema
 */
export const createEntityQueryKeys = <TEntity extends string>(entity: TEntity) => ({
  // Todas las queries de esta entidad
  all: [entity] as const,

  // Listas de la entidad
  lists: () => [entity, 'list'] as const,
  list: (params?: Record<string, any>) => [entity, 'list', params] as const,

  // Detalles individuales
  details: () => [entity, 'detail'] as const,
  detail: (id: number | string) => [entity, 'detail', id] as const,

  // Queries especiales (búsquedas, filtros, etc.)
  search: (query: string) => [entity, 'search', query] as const,
  filtered: (filters: Record<string, any>) => [entity, 'filtered', filters] as const,

  // Para entidades relacionadas
  related: (relation: string, id: number | string) => [entity, 'related', relation, id] as const,
});

// ===============================
// CONFIGURACIONES ESPECÍFICAS POR ENTIDAD
// ===============================

/**
 * Configuración específica de staleTime para diferentes tipos de datos
 */
export const EntityStaleTime = {
  // Datos que cambian muy frecuentemente
  REAL_TIME: 30 * 1000, // 30 segundos (ej: notificaciones, chat)

  // Datos que cambian frecuentemente
  FREQUENT: 2 * 60 * 1000, // 2 minutos (ej: dashboards, métricas)

  // Datos estándar (la mayoría de CRUD)
  STANDARD: 5 * 60 * 1000, // 5 minutos (ej: catálogos, usuarios)

  // Datos que cambian poco
  STABLE: 15 * 60 * 1000, // 15 minutos (ej: configuraciones, roles)

  // Datos que casi nunca cambian
  STATIC: 60 * 60 * 1000, // 1 hora (ej: países, monedas)
} as const;

/**
 * Helper para queries con configuración específica por tipo de entidad
 */
export const getEntityQueryOptions = (entityType: keyof typeof EntityStaleTime) => ({
  staleTime: EntityStaleTime[entityType],
  gcTime: EntityStaleTime[entityType] * 2, // El doble del staleTime
});

// ===============================
// EXPORT DE QUERY KEYS PARA ENTIDADES PRINCIPALES
// ===============================

// Query keys para las entidades principales de tu sistema
export const queryKeys = {
  catalogos: createEntityQueryKeys('catalogos'),
  catalogosDetalle: createEntityQueryKeys('catalogosDetalle'),
  usuarios: createEntityQueryKeys('usuarios'),
  reportes: createEntityQueryKeys('reportes'),
  configuracion: createEntityQueryKeys('configuracion'),
  // Agregar más entidades según las necesites
} as const;
