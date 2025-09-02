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
} from '@lib/providers/QueryProvider';
import type {
  ApiResponse,
  PagedApiResponse,
  ListApiResponse,
  ApiError,
  ValidationError,
} from '@repo/shared/types/api';

// ===============================
// TIPOS BASE PARA PARÁMETROS CON PARENT SUPPORT
// ===============================

export interface BaseParams {
  parentId?: number;
  [key: string]: any;
}

// ===============================
// TIPOS GENÉRICOS PARA CRUD
// ===============================

export interface GenericCRUDConfig<
  TEntity,
  TCreateData,
  TUpdateData,
  TParams extends BaseParams = BaseParams,
> {
  entityName: string;
  entityType?: keyof typeof EntityStaleTime;
  api: {
    getAll: (params?: TParams) => Promise<ListApiResponse<TEntity>>;
    getPaged: (params?: TParams) => Promise<PagedApiResponse<TEntity>>;
    getById: (id: number) => Promise<ApiResponse<TEntity>>;
    create: (data: TCreateData) => Promise<ApiResponse<TEntity>>;
    update: (id: number, data: TUpdateData) => Promise<ApiResponse<void>>;
    delete: (id: number) => Promise<ApiResponse<void>>;
  };
  options?: {
    enableRealTimeUpdates?: boolean;
    enableOptimisticUpdates?: boolean;
    requiresParent?: boolean; // Si true, parentId es obligatorio
    parentFieldName?: string; // Nombre del campo parent (default: 'parentId')
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
// TIPOS DE ERROR MEJORADOS
// ===============================

export interface CRUDError extends ApiError {
  validationErrors?: ValidationError[];
}

// ===============================
// HOOK GENÉRICO PARA CUALQUIER ENTIDAD
// ===============================

export function useGenericCRUD<
  TEntity,
  TCreateData,
  TUpdateData,
  TParams extends BaseParams = BaseParams,
>(config: GenericCRUDConfig<TEntity, TCreateData, TUpdateData, TParams>) {
  const queryClient = useQueryClient();
  const queryKeys = createEntityQueryKeys(config.entityName);
  const queryOptions = config.entityType
    ? getEntityQueryOptions(config.entityType)
    : getEntityQueryOptions('STANDARD');

  // ===============================
  // HELPER PARA PARENT VALIDATION
  // ===============================

  const validateParentRequirement = (params?: TParams) => {
    if (config.options?.requiresParent && !params?.parentId) {
      throw new Error(`${config.entityName} requires parentId but none provided`);
    }
  };

  // ===============================
  // QUERIES (READ)
  // ===============================

  const useList = (
    params?: TParams,
    options?: Omit<UseQueryOptions<ListApiResponse<TEntity>>, 'queryKey' | 'queryFn'>,
  ) => {
    // ✅ Validación de parent si es requerido
    const shouldEnable = config.options?.requiresParent ? !!params?.parentId : true;

    return useQuery({
      queryKey: queryKeys.list(params as Record<string, any>),
      queryFn: () => {
        validateParentRequirement(params);
        return config.api.getAll(params);
      },
      enabled: shouldEnable && options?.enabled !== false,
      select: (response) => {
        return {
          ...response,
          items: response.value?.items || [],
        };
      },
      ...queryOptions,
      ...options,
    });
  };

  const usePaged = (
    params?: TParams,
    options?: Omit<UseQueryOptions<PagedApiResponse<TEntity>>, 'queryKey' | 'queryFn'>,
  ) => {
    // ✅ Validación de parent si es requerido
    const shouldEnable = config.options?.requiresParent ? !!params?.parentId : true;

    return useQuery({
      queryKey: queryKeys.list(params as Record<string, any>),
      queryFn: () => {
        validateParentRequirement(params);
        return config.api.getPaged(params);
      },
      enabled: shouldEnable && options?.enabled !== false,
      select: (response) => ({
        ...response,
        // ✅ Facilitar acceso a datos paginados con nueva estructura
        items: response.value.items || [],
        totalCount: response.value.metadata?.totalRecords || 0,
        currentPage: response.value.metadata?.pageNumber || 1,
        totalPages: response.value.metadata?.totalPages || 0,
        pageSize: response.value.metadata?.pageSize || 10,
        hasNextPage: response.value.metadata?.hasNext || false,
        hasPreviousPage: response.value.metadata?.hasPrevious || false,
        // Value completa disponible en response.value
      }),
      ...queryOptions,
      ...options,
    });
  };

  const useById = (
    id: number | null,
    options?: Omit<UseQueryOptions<ApiResponse<TEntity>>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery({
      queryKey: queryKeys.detail(id!),
      queryFn: () => config.api.getById(id!),
      enabled: !!id,
      select: (response) => ({
        ...response,
        // ✅ Facilitar acceso al item
        item: response.value,
      }),
      ...queryOptions,
      ...options,
    });
  };

  // ===============================
  // MUTATIONS (CREATE, UPDATE, DELETE), MUTATIONS CON OPTIMISTIC UPDATES
  // ===============================

  const useCreate = (
    options?: UseMutationOptions<
      ApiResponse<TEntity>,
      CRUDError,
      TCreateData,
      CreateMutationContext
    >,
  ) => {
    return useMutation({
      mutationFn: config.api.create,
      onMutate: async (newData: TCreateData): Promise<CreateMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return { previousData: [] };
        }

        await queryClient.cancelQueries({ queryKey: queryKeys.lists() });
        const previousData = queryClient.getQueriesData({ queryKey: queryKeys.lists() });

        queryClient.setQueriesData({ queryKey: queryKeys.lists() }, (old: any) => {
          if (!old?.value) return old;

          const newItem = {
            id: Date.now(), // ID temporal para optimistic update
            ...newData,
            fechaCreacion: new Date().toISOString(),
            creadoPor: 'current-user',
          };

          // ✅ ACTUALIZADO: Manejar tanto arrays como PagedApiResponse con nueva estructura
          if (Array.isArray(old.value)) {
            return { ...old, value: [newItem, ...old.value] };
          }

          // Para PagedApiResponse, value es directamente el array
          if (old.value && old.metadata) {
            return {
              ...old,
              value: [newItem, ...old.value],
              metadata: {
                ...old.metadata,
                totalRecords: old.metadata.totalRecords + 1,
              },
            };
          }

          return old;
        });

        return { previousData };
      },
      onError: (err: CRUDError, variables, context) => {
        // ✅ MEJORADO: Error handling con validación
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        // Log detallado de errores
        console.error(`Error creating ${config.entityName}:`, {
          message: err.message,
          statusCode: err.statusCode,
          validationErrors: err.validationErrors,
          details: err.details,
        });

        options?.onError?.(err, variables, context);
      },
      onSuccess: (data, variables, context) => {
        // ✅ ACTUALIZADO: Usar value de ApiResponse
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        if (data.value && (data.value as any).id) {
          queryClient.setQueryData(queryKeys.detail((data.value as any).id), data);
        }
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    });
  };

  const useUpdate = (
    options?: UseMutationOptions<
      ApiResponse<void>,
      CRUDError,
      { id: number; data: TUpdateData },
      UpdateMutationContext
    >,
  ) => {
    return useMutation({
      mutationFn: ({ id, data }) => config.api.update(id, data),
      onMutate: async ({
        id,
        data,
      }: {
        id: number;
        data: TUpdateData;
      }): Promise<UpdateMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return { previousDetail: null, previousLists: [] };
        }

        await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });
        await queryClient.cancelQueries({ queryKey: queryKeys.lists() });

        const previousDetail = queryClient.getQueryData(queryKeys.detail(id));
        const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.lists() });

        // Update optimista en detalle
        queryClient.setQueryData(queryKeys.detail(id), (old: any) => ({
          ...old,
          value: {
            ...old?.value,
            ...data,
            fechaModificacion: new Date().toISOString(),
            modificadoPor: 'current-user',
          },
        }));

        // Update optimista en listas
        queryClient.setQueriesData({ queryKey: queryKeys.lists() }, (old: any) => {
          if (!old?.value) return old;

          const updateItem = (item: any) => (item.id === id ? { ...item, ...data } : item);

          // ✅ ACTUALIZADO: Manejar tanto arrays como PagedApiResponse con nueva estructura
          if (Array.isArray(old.value)) {
            return { ...old, value: old.value.map(updateItem) };
          }

          // Para PagedApiResponse, value es directamente el array
          if (old.value && old.metadata) {
            return {
              ...old,
              value: old.value.map(updateItem),
            };
          }

          return old;
        });

        return { previousDetail, previousLists };
      },
      onError: (err: CRUDError, variables, context) => {
        // Restaurar datos en caso de error
        if (context?.previousDetail) {
          queryClient.setQueryData(queryKeys.detail(variables.id), context.previousDetail);
        }
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        console.error(`Error updating ${config.entityName}:`, {
          message: err.message,
          statusCode: err.statusCode,
          validationErrors: err.validationErrors,
        });

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
    options?: UseMutationOptions<ApiResponse<void>, CRUDError, number, DeleteMutationContext>,
  ) => {
    return useMutation({
      mutationFn: config.api.delete,
      onMutate: async (id: number): Promise<DeleteMutationContext> => {
        // ✅ SIEMPRE retornar un objeto con tipo específico
        if (!config.options?.enableOptimisticUpdates) {
          return { previousLists: [] };
        }

        await queryClient.cancelQueries({ queryKey: queryKeys.lists() });
        const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.lists() });

        // Update optimista - remover de listas
        queryClient.setQueriesData({ queryKey: queryKeys.lists() }, (old: any) => {
          if (!old?.value) return old;

          // ✅ ACTUALIZADO: Manejar tanto arrays como PagedApiResponse con nueva estructura
          if (Array.isArray(old.value)) {
            return { ...old, value: old.value.filter((item: any) => item.id !== id) };
          }

          // Para PagedApiResponse, value es directamente el array
          if (old.value && old.metadata) {
            return {
              ...old,
              value: old.value.filter((item: any) => item.id !== id),
              metadata: {
                ...old.metadata,
                totalRecords: Math.max(0, old.metadata.totalRecords - 1),
              },
            };
          }

          return old;
        });

        return { previousLists };
      },
      onError: (err: CRUDError, id, context) => {
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        console.error(`Error deleting ${config.entityName}:`, {
          message: err.message,
          statusCode: err.statusCode,
        });

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
    },
  ) => {
    return useMutation({
      mutationFn,
      onSuccess: (data, variables, context) => {
        // Invalidación inteligente basada en opciones
        if (options?.invalidateQueries !== false) {
          if (options?.invalidateLists !== false) {
            queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
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
  // OPERATIONS HOOK COMPUESTO
  // ===============================

  const useOperations = (params?: TParams) => {
    const listQuery = useList(params);
    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    return {
      // Data & Estados
      items: (listQuery.data as any)?.items || [],
      isLoading: listQuery.isLoading,
      error: listQuery.error,
      isRefetching: listQuery.isFetching && !listQuery.isLoading,

      response: listQuery.data?.value, // ApiResponse completa
      isSuccess: listQuery.data?.isSuccess || false,
      apiStatus: listQuery.data?.status,
      apiMessage: listQuery.data?.successMessage,

      // Acciones
      refetch: listQuery.refetch,
      create: (
        data: TCreateData,
        options?: {
          onSuccess?: (result: ApiResponse<TEntity>) => void;
          onError?: (error: CRUDError) => void;
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
          onSuccess?: (result: ApiResponse<void>) => void;
          onError?: (error: CRUDError) => void;
        },
      ) => {
        updateMutation.mutate(
          { id, data },
          {
            onSuccess: (result) => options?.onSuccess?.(result),
            onError: (error) => options?.onError?.(error),
          },
        );
      },
      delete: (
        id: number,
        options?: {
          onSuccess?: (result: ApiResponse<void>) => void;
          onError?: (error: CRUDError) => void;
        },
      ) => {
        deleteMutation.mutate(id, {
          onSuccess: (result) => options?.onSuccess?.(result),
          onError: (error) => options?.onError?.(error),
        });
      },

      // Estados de mutaciones
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,

      // Mutations completas para casos avanzados
      mutations: {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      },

      // Query original
      query: listQuery,
    };
  };

  // RECOMENDADO: usePagedOperations como principal
  const usePagedOperations = (params?: TParams) => {
    const pagedQuery = usePaged(params);
    const createMutation = useCreate();
    const updateMutation = useUpdate();
    const deleteMutation = useDelete();

    // Tipo para las propiedades agregadas por el select de usePaged
    const pagedData = pagedQuery.data as {
      items?: TEntity[];
      totalCount?: number;
      currentPage?: number;
      totalPages?: number;
      pageSize?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };

    return {
      // ✅ ACTUALIZADO: Data usando select transformations
      items: pagedData?.items || [],
      totalCount: pagedData?.totalCount || 0,
      currentPage: pagedData?.currentPage || 1,
      totalPages: pagedData?.totalPages || 0,
      pageSize: pagedData?.pageSize || 10,
      hasNextPage: pagedData?.hasNextPage || false,
      hasPreviousPage: pagedData?.hasPreviousPage || false,

      // Estados
      isLoading: pagedQuery.isLoading,
      error: pagedQuery.error,
      isRefetching: pagedQuery.isFetching && !pagedQuery.isLoading,

      // ✅ MEJORADO: Response completa disponible
      response: pagedQuery.data, // ApiResponse completa
      isSuccess: pagedQuery.data?.isSuccess || false,
      apiStatus: pagedQuery.data?.status,
      apiMessage: pagedQuery.data?.successMessage,

      // Acciones
      refetch: pagedQuery.refetch,
      create: (
        data: TCreateData,
        options?: {
          onSuccess?: (result: ApiResponse<TEntity>) => void;
          onError?: (error: CRUDError) => void;
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
          onSuccess?: (result: ApiResponse<void>) => void;
          onError?: (error: CRUDError) => void;
        },
      ) => {
        updateMutation.mutate(
          { id, data },
          {
            onSuccess: (result) => options?.onSuccess?.(result),
            onError: (error) => options?.onError?.(error),
          },
        );
      },
      delete: (
        id: number,
        options?: {
          onSuccess?: (result: ApiResponse<void>) => void;
          onError?: (error: CRUDError) => void;
        },
      ) => {
        deleteMutation.mutate(id, {
          onSuccess: (result) => options?.onSuccess?.(result),
          onError: (error) => options?.onError?.(error),
        });
      },

      // Estados de mutaciones
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,

      // Mutations completas para casos avanzados
      mutations: {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      },

      // Query original
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

    // Hooks compuestos
    useOperations,
    usePagedOperations,

    // Mutaciones personalizadas
    useCustomMutation,

    // Utilidades
    queryKeys,
    queryClient,
  };
}
