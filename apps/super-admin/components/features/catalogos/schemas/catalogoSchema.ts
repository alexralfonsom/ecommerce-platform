// src/lib/schemas/catalogoSchema.ts
import * as z from "zod";

// ===============================
// 🎯 SCHEMAS BASE PARA CATÁLOGOS
// ===============================

export const baseCatalogoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(250, 'El nombre no puede tener más de 250 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_.áéíóúÁÉÍÓÚñÑ]+$/,
      'El nombre solo puede contener letras, números, espacios y algunos caracteres especiales',
    ),

  activo: z.boolean().default(true),
});

// ===============================
// 🆕 SCHEMA PARA CREAR CATÁLOGO
// ===============================

export const createCatalogoSchema = baseCatalogoSchema;

// ===============================
// ✏️ SCHEMA PARA EDITAR CATÁLOGO
// ===============================

export const updateCatalogoSchema = baseCatalogoSchema.extend({
  id: z.number().positive('ID debe ser un número positivo'),
});

// ===============================
// 📝 SCHEMA PARA FORMULARIO (UI)
// ===============================

// Este schema es para el formulario en la UI, más flexible
export const catalogoFormSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(250, 'Máximo 250 caracteres')
    .refine(
      (val) => val.trim().length >= 3,
      'El nombre debe tener al menos 3 caracteres sin espacios',
    ),

  activo: z.boolean(),
});

// ===============================
// 🔄 TIPOS DERIVADOS DE ZOD
// ===============================

export type CreateCatalogoFormData = z.infer<typeof createCatalogoSchema>;
export type UpdateCatalogoFormData = z.infer<typeof updateCatalogoSchema>;
export type CatalogoFormData = z.infer<typeof catalogoFormSchema>;

// ===============================
// 🎛️ UTILIDADES DE VALIDACIÓN
// ===============================

export const validateCatalogoName = (name: string): boolean => {
  try {
    baseCatalogoSchema.pick({ nombre: true }).parse({ nombre: name });
    return true;
  } catch {
    return false;
  }
};

export const getCatalogoValidationErrors = (data: any): Record<string, string> => {
  try {
    catalogoFormSchema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce(
        (acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    return {};
  }
};

// ===============================
// 🔧 FUNCIONES DE TRANSFORMACIÓN
// ===============================

export const transformToCreateRequest = (formData: CatalogoFormData): CreateCatalogoFormData => {
  return {
    nombre: formData.nombre.trim(),
    activo: formData.activo,
  };
};

export const transformToUpdateRequest = (
  formData: CatalogoFormData,
  id: number,
): UpdateCatalogoFormData => {
  return {
    id,
    nombre: formData.nombre.trim(),
    activo: formData.activo,
  };
};
