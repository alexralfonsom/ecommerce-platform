// src/hooks/queries/useGenericCRUD.ts
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  createEntityQueryKeys,
  EntityStaleTime,
  getEntityQueryOptions,
} from '@repo/ui';

// ===============================
// TIPOS GENÉRICOS PARA CRUD
// ===============================

export interface GenericCRUDConfig<TEntity, TCreateData, TUpdateData, TParams> {
  entityName: string;
  entityType?: keyof typeof EntityStaleTime;
  api: {
    getAll: (params?: TParams) => Promise<{ value: TEntity[] }>;
    getPaged: (params?: TParams) => Promise<{
      value: {
        items: TEntity[];
        totalCount: number;
        pageNumber: number;
        totalPages: number;
      };
    }>;
    getById: (id: number) => Promise<{ value: TEntity }>;
    create: (data: TCreateData) => Promise<{ value: TEntity }>;
    update: (id: number, data: TUpdateData) => Promise<void>;
    delete: (id: number) => Promise<void>;
  };
  options?: {
    enableRealTimeUpdates?: boolean;
    enableOptimisticUpdates?: boolean;
    customSuccessMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
  };
}

// ===============================
// TIPOS PARA MUTATION CONTEXT
// ===============================

export interface CreateMutationContext {
  previousData: [any, any][];
}

export interface UpdateMutationContext {
  previousDetail: any;
  previousLists: [any, any][];
}

export interface DeleteMutationContext {
  previousLists: [any, any][];
}

// ===============================
// HOOK GENÉRICO PARA CUALQUIER ENTIDAD
// ===============================

export function useGenericCRUD<TEntity, TCreateData, TUpdateData, TParams>(
  config: GenericCRUDConfig<TEntity, TCreateData, TUpdateData, TParams>,
) {
  const queryClient = useQueryClient();
  const queryKeys = createEntityQueryKeys(config.entityName);
  const queryOptions = config.entityType
    ? getEntityQueryOptions(config.entityType)
    : getEntityQueryOptions('STANDARD');

  // ===============================
  // QUERIES (READ)
  // ===============================

  const useList = (
    params?: TParams,
    options?: Omit<UseQueryOptions<{ value: TEntity[] }>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: queryKeys.list(params as Record<string, any>),
      queryFn: () => config.api.getAll(params),
      ...queryOptions,
      ...options,
    });
  };

  const usePaged = (
    params?: TParams,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: queryKeys.list(params as Record<string, any>),
      queryFn: () => config.api.getPaged(params),
      ...queryOptions,
      ...options,
    });
  };

  const useById = (
    id: number | null,
    options?: Omit<UseQueryOptions<{ value: TEntity }>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: queryKeys.detail(id!),
      queryFn: () => config.api.getById(id!),
      enabled: !!id,
      ...queryOptions,
      ...options,
    });
  };

  // ===============================
  // MUTATIONS (CREATE, UPDATE, DELETE), MUTATIONS CON OPTIMISTIC UPDATES
  // ===============================


  const useCreate = (
    options?: UseMutationOptions<{ value: TEntity }, Error, TCreateData, CreateMutationContext>
  ) => {
    return useMutation({
      mutationFn: config.api.create,
      onMutate: async (newData: TCreateData): Promise<CreateMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return {previousData: []};
        }

        await queryClient.cancelQueries({queryKey: queryKeys.lists()});
        const previousData = queryClient.getQueriesData({queryKey: queryKeys.lists()});

        queryClient.setQueriesData(
          {queryKey: queryKeys.lists()},
          (old: any) => {
            if (!old?.value) return old;

            const newItem = {
              id: Date.now(), // ID temporal para optimistic update
              ...newData,
              fechaCreacion: new Date().toISOString(),
              creadoPor: 'current-user', // Puedes mejorar esto después
            };

            if (Array.isArray(old.value)) {
              return {...old, value: [newItem, ...old.value]};
            }

            if (old.value.items) {
              return {
                ...old,
                value: {
                  ...old.value,
                  items: [newItem, ...old.value.items],
                  totalCount: old.value.totalCount + 1,
                },
              };
            }

            return old;
          }
        );

        return {previousData};
      },
      onError: (err, variables, context) => {
        // Restaurar datos en caso de error
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        options?.onError?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        // Invalidar y actualizar con datos reales del servidor
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        queryClient.setQueryData(queryKeys.detail((data.value as any).id), data);
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  const useUpdate = (
    options?: UseMutationOptions<void, Error, { id: number; data: TUpdateData }, UpdateMutationContext>
  ) => {
    return useMutation({
      mutationFn: ({ id, data }) => config.api.update(id, data),
      onMutate: async ({id, data}: { id: number; data: TUpdateData }): Promise<UpdateMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return {previousDetail: null, previousLists: []};
        }

        await queryClient.cancelQueries({queryKey: queryKeys.detail(id)});
        await queryClient.cancelQueries({queryKey: queryKeys.lists()});

        const previousDetail = queryClient.getQueryData(queryKeys.detail(id));
        const previousLists = queryClient.getQueriesData({queryKey: queryKeys.lists()});

        // Update optimista en detalle
        queryClient.setQueryData(queryKeys.detail(id), (old: any) => ({
          ...old,
          value: {
            ...old?.value,
            ...data,
            fechaModificacion: new Date().toISOString(),
            modificadoPor: 'current-user', // Puedes mejorar esto después
          },
        }));

        // Update optimista en listas
        queryClient.setQueriesData(
          {queryKey: queryKeys.lists()},
          (old: any) => {
            if (!old?.value) return old;

            const updateItem = (item: any) =>
              item.id === id ? {...item, ...data} : item;

            if (Array.isArray(old.value)) {
              return {...old, value: old.value.map(updateItem)};
            }

            if (old.value.items) {
              return {
                ...old,
                value: {
                  ...old.value,
                  items: old.value.items.map(updateItem),
                },
              };
            }

            return old;
          }
        );

        return {previousDetail, previousLists};
      },
      onError: (err, variables, context) => {
        // Restaurar datos en caso de error
        if (context?.previousDetail) {
          queryClient.setQueryData(queryKeys.detail(variables.id), context.previousDetail);
        }
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        options?.onError?.(err, variables, context);
      },
      onSuccess: (_, variables, context) => {
        // Invalidar datos para obtener la versión real del servidor
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        options?.onSuccess?.(_, variables, context);
      },
      ...options,
    });
  };

  const useDelete = (
    options?: UseMutationOptions<void, Error, number, DeleteMutationContext>
  ) => {
    return useMutation({
      mutationFn: config.api.delete,
      onMutate: async (id: number): Promise<DeleteMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return {previousLists: []};
        }

        await queryClient.cancelQueries({queryKey: queryKeys.lists()});
        const previousLists = queryClient.getQueriesData({queryKey: queryKeys.lists()});

        // Update optimista - remover de listas
        queryClient.setQueriesData(
          {queryKey: queryKeys.lists()},
          (old: any) => {
            if (!old?.value) return old;

            if (Array.isArray(old.value)) {
              return {...old, value: old.value.filter((item: any) => item.id !== id)};
            }

            if (old.value.items) {
              return {
                ...old,
                value: {
                  ...old.value,
                  items: old.value.items.filter((item: any) => item.id !== id),
                  totalCount: Math.max(0, old.value.totalCount - 1),
                },
              };
            }

            return old;
          }
        );

        return {previousLists};
      },
      onError: (err, id, context) => {
        // Restaurar datos en caso de error
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        options?.onError?.(err, id, context);
      },
      onSuccess: (_, id, context) => {
        // Remover del caché de detalles y refrescar listas
        queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        options?.onSuccess?.(_, id, context);
      },
      ...options,
    });
  };

  // ===============================
  // HOOK PARA MUTACIONES PERSONALIZADAS
  // ===============================

  const useCustomMutation = <TData = void, TVariables = void>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, Error, TVariables> & {
      invalidateQueries?: boolean;
      invalidateDetails?: boolean;
      invalidateLists?: boolean;
    }
  ) => {
    return useMutation({
      mutationFn,
      onSuccess: (data, variables, context) => {
        // Invalidación inteligente basada en opciones
        if (options?.invalidateQueries !== false) {
          if (options?.invalidateLists !== false) {
            queryClient.invalidateQueries({queryKey: queryKeys.lists()});
          }
          if (options?.invalidateDetails !== false) {
            queryClient.invalidateQueries({queryKey: queryKeys.details()});
          }
        }

        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  // ===============================
  // OPERATIONS HOOK COMPUESTO
  // ===============================

  const useOperations = (params?: TParams) => {
    const listQuery = useList(params);
    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    return {
      // Data & Estados
      items: listQuery.data?.value || [],
      isLoading: listQuery.isLoading,
      error: listQuery.error,
      isRefetching: listQuery.isFetching && !listQuery.isLoading,

      // Acciones
      refetch: listQuery.refetch,
      create: (
        data: TCreateData,
        options?: {
          onSuccess?: (result: { value: TEntity }) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        createMutation.mutate(data, {
          onSuccess: (result) => options?.onSuccess?.(result),
          onError: (error) => options?.onError?.(error),
        });
      },
      update: (
        id: number,
        data: TUpdateData,
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ) => {
        updateMutation.mutate(
          { id, data },
          {
            onSuccess: () => options?.onSuccess?.(),
            onError: (error) => options?.onError?.(error),
          },
        );
      },

      delete: (
        id: number,
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ) => {
        deleteMutation.mutate(id, {
          onSuccess: () => options?.onSuccess?.(),
          onError: (error) => options?.onError?.(error),
        });
      },

      // Estados de mutaciones
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,

      // Acceso completo a mutations
      mutations: {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      },
    };
  };

  // 🎯 RECOMENDADO: usePagedOperations como principal
  const usePagedOperations = (params?: TParams) => {
    const pagedQuery = usePaged(params);
    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    return {
      // Data paginada
      items: pagedQuery.data?.value?.items || [],
      totalCount: pagedQuery.data?.value?.totalCount || 0,
      currentPage: pagedQuery.data?.value?.pageNumber || 1,
      totalPages: pagedQuery.data?.value?.totalPages || 0,

      // Información de paginación calculada
      hasNextPage:
        (pagedQuery.data?.value?.pageNumber || 1) < (pagedQuery.data?.value?.totalPages || 1),
      hasPreviousPage: (pagedQuery.data?.value?.pageNumber || 1) > 1,

      // Estados
      isLoading: pagedQuery.isLoading,
      error: pagedQuery.error,
      isRefetching: pagedQuery.isFetching && !pagedQuery.isLoading,

      // Acciones simplificadas
      refetch: pagedQuery.refetch,
      create: (
        data: TCreateData,
        options?: {
          onSuccess?: (result: { value: TEntity }) => void;
          onError?: (error: Error) => void;
        },
      ) => {
        createMutation.mutate(data, {
          onSuccess: (result) => options?.onSuccess?.(result),
          onError: (error) => options?.onError?.(error),
        });
      },

      update: (
        id: number,
        data: TUpdateData,
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ) => {
        updateMutation.mutate(
          { id, data },
          {
            onSuccess: () => options?.onSuccess?.(),
            onError: (error) => options?.onError?.(error),
          },
        );
      },

      delete: (
        id: number,
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ) => {
        deleteMutation.mutate(id, {
          onSuccess: () => options?.onSuccess?.(),
          onError: (error) => options?.onError?.(error),
        });
      },

      // Estados de mutaciones
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,

      // Para casos avanzados
      mutations: {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      },

      // Query original para casos específicos
      query: pagedQuery,
    };
  };

  return {
    // Hooks individuales
    useList,
    usePaged,
    useById,
    useCreate,
    useUpdate,
    useDelete,
    useCustomMutation,

    // 🎯 Hooks compuestos (RECOMENDADOS)
    useOperations,        // Para listas simples
    usePagedOperations,   // Para listas paginadas (MÁS RECOMENDADO)

    // Utilidades
    queryKeys,
    queryClient,
  };
}
