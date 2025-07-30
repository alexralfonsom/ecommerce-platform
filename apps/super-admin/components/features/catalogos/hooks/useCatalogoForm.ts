// src/components/features/catalogos/hooks/useCatalogoForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import {
  ICreateMaestroCatalogoRequest,
  IMaestroCatalogo,
  IUpdateMaestroCatalogoRequest,
} from '@components/features/catalogos/types/MaestroCatalogosTypes';
import {
  type CatalogoFormData,
  catalogoFormSchema,
  transformToCreateRequest,
  transformToUpdateRequest,
} from '@components/features/catalogos/schemas/catalogoSchema';

// ===============================
// 🎯 TIPOS PARA EL HOOK
// ===============================

type FormMode = 'create' | 'edit';

interface UseCatalogoFormProps {
  mode: FormMode;
  initialData?: IMaestroCatalogo;
  onSubmit: (data: ICreateMaestroCatalogoRequest | IUpdateMaestroCatalogoRequest) => void;
  onCancel?: () => void;
}

interface UseCatalogoFormReturn {
  // React Hook Form
  form: ReturnType<typeof useForm<CatalogoFormData>>;

  // Estados derivados
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;

  // Acciones
  handleSubmit: () => void;
  handleReset: () => void;
  handleCancel: () => void;

  // Utilidades
  getFieldError: (fieldName: keyof CatalogoFormData) => string | undefined;
  isFieldInvalid: (fieldName: keyof CatalogoFormData) => boolean;

  // Estado del formulario
  formData: CatalogoFormData;

  // Configuración
  submitButtonText: string;
  titleText: string;
}

// ===============================
// 🪝 HOOK PRINCIPAL
// ===============================

export function useCatalogoForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: UseCatalogoFormProps): UseCatalogoFormReturn {
  // ===============================
  // 🎛️ CONFIGURACIÓN DEL FORMULARIO
  // ===============================

  const form = useForm<CatalogoFormData>({
    resolver: zodResolver(catalogoFormSchema),
    mode: 'onChange', // Validación en tiempo real
    reValidateMode: 'onChange',
    defaultValues: {
      nombre: '',
      activo: true,
    },
  });

  // ===============================
  // 🔄 EFECTOS PARA INICIALIZACIÓN
  // ===============================

  // Cargar datos iniciales cuando están disponibles
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        nombre: initialData.nombre,
        activo: initialData.activo,
      });
    } else if (mode === 'create') {
      form.reset({
        nombre: '',
        activo: true,
      });
    }
  }, [mode, initialData, form]);

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
    (fieldName: keyof CatalogoFormData): string | undefined => {
      return formState.errors[fieldName]?.message;
    },
    [formState.errors],
  );

  const isFieldInvalid = useCallback(
    (fieldName: keyof CatalogoFormData): boolean => {
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
        }
      } catch (error) {
        console.error('Error al procesar datos del formulario:', error);
      }
    })();
  }, [form, mode, initialData, onSubmit]);

  const handleReset = useCallback(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        nombre: initialData.nombre,
        activo: initialData.activo,
      });
    } else {
      form.reset({
        nombre: '',
        activo: true,
      });
    }
  }, [form, mode, initialData]);

  const handleCancel = useCallback(() => {
    handleReset();
    onCancel?.();
  }, [handleReset, onCancel]);

  // ===============================
  // 📝 TEXTOS DINÁMICOS
  // ===============================

  const submitButtonText = mode === 'create' ? 'Crear Catálogo' : 'Actualizar Catálogo';
  const titleText = mode === 'create' ? 'Nuevo Catálogo' : 'Editar Catálogo';

  // ===============================
  // 📤 RETORNO DEL HOOK
  // ===============================

  return {
    // React Hook Form
    form,

    // Estados derivados
    isValid,
    isDirty,
    hasErrors,

    // Acciones
    handleSubmit,
    handleReset,
    handleCancel,

    // Utilidades
    getFieldError,
    isFieldInvalid,

    // Estado del formulario
    formData,

    // Configuración
    submitButtonText,
    titleText,
  };
}

// ===============================
// 🎛️ HOOK SIMPLIFICADO PARA CASOS BÁSICOS
// ===============================

export function useSimpleCatalogoForm(mode: FormMode, initialData?: IMaestroCatalogo) {
  return useForm<CatalogoFormData>({
    resolver: zodResolver(catalogoFormSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: mode === 'edit' ? initialData?.nombre || '' : '',
      activo: mode === 'edit' ? (initialData?.activo ?? true) : true,
    },
  });
}
