import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import {
  type CatalogoDetalleFormData,
  catalogoDetalleFormSchema,
  transformToCreateRequest,
  transformToUpdateRequest,
} from '@components/features/catalogos/schemas/catalogoDetallesSchema';
import {
  ICreateMaestroCatalogoDetalleRequest,
  IMaestroCatalogoDetalle,
  IUpdateMaestroCatalogoDetalleRequest,
} from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';

// ===============================
// 🎯 TIPOS PARA EL HOOK
// ===============================

type FormMode = 'create' | 'edit';

interface UseCatalogoDetallesFormProps {
  mode: FormMode;
  initialData?: IMaestroCatalogoDetalle;
  idMaestro?: number; // Para modo create
  onSubmit: (
    data: ICreateMaestroCatalogoDetalleRequest | IUpdateMaestroCatalogoDetalleRequest,
  ) => void;
  onCancel?: () => void;
}

interface UseCatalogoDetallesFormReturn {
  form: ReturnType<typeof useForm<CatalogoDetalleFormData>>;
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
  handleSubmit: () => void;
  handleReset: () => void;
  handleCancel: () => void;
  getFieldError: (fieldName: keyof CatalogoDetalleFormData) => string | undefined;
  isFieldInvalid: (fieldName: keyof CatalogoDetalleFormData) => boolean;
  formData: CatalogoDetalleFormData;
}

export function useCatalogoDetallesForm({
  mode,
  initialData,
  idMaestro,
  onSubmit,
  onCancel,
}: UseCatalogoDetallesFormProps): UseCatalogoDetallesFormReturn {
  // ===============================
  // 🎛️ CONFIGURACIÓN DEL FORMULARIO
  // ===============================
  const form = useForm<CatalogoDetalleFormData>({
    resolver: zodResolver(catalogoDetalleFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      activo: true,
      codigo: '',
      evento: '',
      idMaestro: 0,
    },
  });

  // ===============================
  // 🔄 EFECTOS PARA INICIALIZACIÓN
  // ===============================

  // Cargar datos iniciales cuando están disponibles
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        nombre: initialData.nombre || '',
        activo: initialData.activo ?? true,
        codigo: initialData.codigo || '',
        evento: initialData.evento || '',
        idMaestro: initialData.idMaestro,
      });
    } else if (mode === 'create') {
      const maestroId = idMaestro || initialData?.idMaestro;
      if (!maestroId) {
        console.error('idMaestro es requerido para crear un detalle');
        return;
      }
      form.reset({
        nombre: '',
        activo: true,
        codigo: '',
        evento: '',
        idMaestro: maestroId,
      });
    }
  }, [mode, initialData, idMaestro, form]);

  // ===============================
  // 📊 ESTADOS DERIVADOS
  // ===============================

  const { formState, watch } = form;
  const formData = watch();

  const isValid = formState.isValid;
  const isDirty = formState.isDirty;
  const hasErrors = Object.keys(formState.errors).length > 0;

  // ===============================
  // 🎯 FUNCIONES DE UTILIDAD
  // ===============================

  const getFieldError = useCallback(
    (fieldName: keyof CatalogoDetalleFormData): string | undefined => {
      return formState.errors[fieldName]?.message;
    },
    [formState.errors],
  );

  const isFieldInvalid = useCallback(
    (fieldName: keyof CatalogoDetalleFormData): boolean => {
      return !!formState.errors[fieldName];
    },
    [formState.errors],
  );

  // ===============================
  // 🚀 MANEJADORES DE ACCIONES
  // ===============================
  const handleSubmit = useCallback(() => {
    form.handleSubmit((data) => {
      try {
        if (mode === 'create') {
          const createData = transformToCreateRequest(data);
          onSubmit(createData);
        } else if (mode === 'edit' && initialData) {
          const updateData = transformToUpdateRequest(data, initialData.id);
          onSubmit(updateData);
        } else {
          console.error('Configuración inválida para envío del formulario');
        }
      } catch (error) {
        console.error('Error al procesar datos del formulario:', error);
      }
    })();
  }, [form, mode, initialData, onSubmit]);

  const handleReset = useCallback(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        nombre: initialData.nombre || '',
        activo: initialData.activo ?? true,
        codigo: initialData.codigo || '',
        evento: initialData.evento || '',
        idMaestro: initialData.idMaestro,
      });
    } else if (mode === 'create') {
      const maestroId = idMaestro || initialData?.idMaestro;
      form.reset({
        nombre: '',
        activo: true,
        codigo: '',
        evento: '',
        idMaestro: maestroId || 0,
      });
    }
  }, [form, mode, initialData, idMaestro]);

  const handleCancel = useCallback(() => {
    handleReset();
    onCancel?.();
  }, [handleReset, onCancel]);

  // ===============================
  // 📤 RETORNO DEL HOOK
  // ===============================
  return {
    form,
    isValid,
    isDirty,
    hasErrors,
    handleSubmit,
    handleReset,
    handleCancel,
    getFieldError,
    isFieldInvalid,
    formData,
  };
}
