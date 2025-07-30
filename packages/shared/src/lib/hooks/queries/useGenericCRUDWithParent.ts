// src/lib/hooks/queries/useGenericCRUDWithParent.ts
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
// TIPOS GENÉRICOS PARA CRUD CON PARENT
// ===============================

export interface GenericCRUDWithParentConfig<TEntity, TCreateData, TUpdateData, TParams> {
  entityName: string;
  entityType?: keyof typeof EntityStaleTime;
  api: {
    // Métodos que requieren parentId
    getAll: (parentId: number, incluirInactivos?: boolean) => Promise<{ value: TEntity[] }>;
    getPaged: (
      parentId: number,
      params?: TParams,
    ) => Promise<{
      value: {
        items: TEntity[];
        totalCount: number;
        pageNumber: number;
        totalPages: number;
      };
    }>;
    // Métodos estándar
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

export interface CreateMutationContextWithParent {
  previousData: [any, any][];
}

export interface UpdateMutationContextWithParent {
  previousDetail: any;
  previousLists: [any, any][];
}

export interface DeleteMutationContextWithParent {
  previousLists: [any, any][];
}

// ===============================
// HOOK GENÉRICO PARA ENTIDADES CON PARENT
// ===============================

export function useGenericCRUDWithParent<TEntity, TCreateData, TUpdateData, TParams>(
  config: GenericCRUDWithParentConfig<TEntity, TCreateData, TUpdateData, TParams>,
) {
  const queryClient = useQueryClient();
  const queryKeys = createEntityQueryKeys(config.entityName);
  const queryOptions = config.entityType
    ? getEntityQueryOptions(config.entityType)
    : getEntityQueryOptions('STANDARD');

  // ===============================
  // QUERIES (READ) CON PARENT ID
  // ===============================

  const useList = (
    parentId: number | null,
    incluirInactivos: boolean = false,
    options?: Omit<UseQueryOptions<{ value: TEntity[] }>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: [...queryKeys.lists(), 'parent', parentId, { incluirInactivos }],
      queryFn: () => config.api.getAll(parentId!, incluirInactivos),
      enabled: !!parentId,
      ...queryOptions,
      ...options,
    });
  };

  const usePaged = (
    parentId: number | null,
    params?: TParams,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: [...queryKeys.lists(), 'parent', parentId, 'paged', params],
      queryFn: () => config.api.getPaged(parentId!, params),
      enabled: !!parentId,
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
  // MUTATIONS CON INVALIDACIÓN ESPECÍFICA PARA PARENT
  // ===============================

  const useCreate = (
    parentId: number | null,
    options?: UseMutationOptions<{ value: TEntity }, Error, TCreateData, CreateMutationContextWithParent>,
  ) => {
    return useMutation({
      mutationFn: config.api.create,
      onMutate: async (newData: TCreateData): Promise<CreateMutationContextWithParent> => {
        if (!config.options?.enableOptimisticUpdates || !parentId) {
          return { previousData: [] };
        }

        // Cancelar queries relacionadas con este parent
        const parentQueryKeys = [...queryKeys.lists(), 'parent', parentId];
        await queryClient.cancelQueries({ queryKey: parentQueryKeys });

        const previousData = queryClient.getQueriesData({ queryKey: parentQueryKeys });

        // Update optimista para todas las queries de este parent
        queryClient.setQueriesData({ queryKey: parentQueryKeys }, (old: any) => {
          if (!old?.value) return old;

          const newItem = {
            id: Date.now(), // ID temporal
            ...newData,
            fechaCreacion: new Date().toISOString(),
          };

          if (Array.isArray(old.value)) {
            return { ...old, value: [newItem, ...old.value] };
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
        });

        return { previousData };
      },
      onError: (err, variables, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        options?.onError?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        // Invalidar todas las queries relacionadas con este parent
        if (parentId) {
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.lists(), 'parent', parentId],
          });
        }
        queryClient.setQueryData(queryKeys.detail((data.value as any).id), data);
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  const useUpdate = (
    parentId: number | null,
    options?: UseMutationOptions<
      void,
      Error,
      { id: number; data: TUpdateData },
      UpdateMutationContextWithParent
    >,
  ) => {
    return useMutation({
      mutationFn: ({ id, data }) => config.api.update(id, data),
      onMutate: async ({ id, data }): Promise<UpdateMutationContextWithParent> => {
        if (!config.options?.enableOptimisticUpdates || !parentId) {
          return { previousDetail: null, previousLists: [] };
        }

        // Cancelar queries
        await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
        const parentQueryKeys = [...queryKeys.lists(), 'parent', parentId];
        await queryClient.cancelQueries({ queryKey: parentQueryKeys });

        const previousDetail = queryClient.getQueryData(queryKeys.detail(id));
        const previousLists = queryClient.getQueriesData({ queryKey: parentQueryKeys });

        // Update optimista para el detalle
        queryClient.setQueryData(queryKeys.detail(id), (old: any) => {
          if (!old?.value) return old;
          return { ...old, value: { ...old.value, ...data } };
        });

        // Update optimista para las listas del parent
        queryClient.setQueriesData({ queryKey: parentQueryKeys }, (old: any) => {
          if (!old?.value) return old;

          const updateItem = (item: any) => (item.id === id ? { ...item, ...data } : item);

          if (Array.isArray(old.value)) {
            return { ...old, value: old.value.map(updateItem) };
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
        });

        return { previousDetail, previousLists };
      },
      onError: (err, variables, context) => {
        // Restaurar datos
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
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
        if (parentId) {
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.lists(), 'parent', parentId],
          });
        }
        options?.onSuccess?.(_, variables, context);
      },
      ...options,
    });
  };

  const useDelete = (
    parentId: number | null,
    options?: UseMutationOptions<void, Error, number, DeleteMutationContextWithParent>,
  ) => {
    return useMutation({
      mutationFn: config.api.delete,
      onMutate: async (id: number): Promise<DeleteMutationContextWithParent> => {
        if (!config.options?.enableOptimisticUpdates || !parentId) {
          return { previousLists: [] };
        }

        const parentQueryKeys = [...queryKeys.lists(), 'parent', parentId];
        await queryClient.cancelQueries({ queryKey: parentQueryKeys });
        const previousLists = queryClient.getQueriesData({ queryKey: parentQueryKeys });

        // Update optimista - remover de listas del parent
        queryClient.setQueriesData({ queryKey: parentQueryKeys }, (old: any) => {
          if (!old?.value) return old;

          if (Array.isArray(old.value)) {
            return { ...old, value: old.value.filter((item: any) => item.id !== id) };
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
        });

        return { previousLists };
      },
      onError: (err, id, context) => {
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        options?.onError?.(err, id, context);
      },
      onSuccess: (_, id, context) => {
        // Remover del caché y refrescar
        queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
        if (parentId) {
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.lists(), 'parent', parentId],
          });
        }
        options?.onSuccess?.(_, id, context);
      },
      ...options,
    });
  };

  // ===============================
  // HOOK PARA MUTACIONES PERSONALIZADAS
  // ===============================

  const useCustomMutation = <TData = void, TVariables = void>(
    parentId: number | null,
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, Error, TVariables> & {
      invalidateQueries?: boolean;
      invalidateDetails?: boolean;
      invalidateLists?: boolean;
    },
  ) => {
    return useMutation({
      mutationFn,
      onSuccess: (data, variables, context) => {
        if (options?.invalidateQueries !== false && parentId) {
          if (options?.invalidateLists !== false) {
            queryClient.invalidateQueries({
              queryKey: [...queryKeys.lists(), 'parent', parentId],
            });
          }
          if (options?.invalidateDetails !== false) {
            queryClient.invalidateQueries({ queryKey: queryKeys.details() });
          }
        }
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  // ===============================
  // OPERATIONS HOOKS COMPUESTOS
  // ===============================

  const useOperations = (parentId: number | null, incluirInactivos: boolean = false) => {
    const listQuery = useList(parentId, incluirInactivos);
    const createMutation = useCreate(parentId);
    const updateMutation = useUpdate(parentId);
    const deleteMutation = useDelete(parentId);

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

  const usePagedOperations = (parentId: number | null, params?: TParams) => {
    const pagedQuery = usePaged(parentId, params);
    const createMutation = useCreate(parentId);
    const updateMutation = useUpdate(parentId);
    const deleteMutation = useDelete(parentId);

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

      // Acceso completo a mutations
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
    useOperations, // Para listas simples
    usePagedOperations, // Para listas paginadas (MÁS RECOMENDADO)

    // Utilidades
    queryKeys,
    queryClient,
  };
}
