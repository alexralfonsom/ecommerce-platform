import * as z from 'zod';

// ===============================
// 🎯 SCHEMA BASE PARA CATÁLOGO DETALLE
// ===============================

export const baseCatalogoDetalleSchema = z.object({
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
  codigo: z
    .string()
    .max(255, 'El código no puede tener más de 255 caracteres') // ✅ Corregido mensaje
    .regex(
      /^[a-zA-Z0-9\s\-_.]+$/,
      'El código solo puede contener letras, números y algunos caracteres especiales',
    )
    .optional()
    .or(z.literal('')),
});

export const createCatalogoDetalleSchema = baseCatalogoDetalleSchema.extend({
  idMaestro: z.number().positive('ID del maestro debe ser un número positivo'),
  evento: z
    .string()
    .max(500, 'El evento no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export const updateCatalogoDetalleSchema = baseCatalogoDetalleSchema.extend({
  id: z.number().positive('ID debe ser un número positivo'),
  evento: z
    .string()
    .max(500, 'El evento no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export const catalogoDetalleFormSchema = z.object({
  idMaestro: z.number().positive('ID del maestro debe ser un número positivo'),
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
  codigo: z
    .string()
    .max(255, 'Máximo 255 caracteres')
    .regex(
      /^[a-zA-Z0-9\s\-_.]*$/,
      'El código solo puede contener letras, números y algunos caracteres especiales',
    ) // ✅ Permite vacío con *
    .optional()
    .or(z.literal('')),
  evento: z
    .string()
    .max(500, 'El evento no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type CreateCatalogoDetalleFormData = z.infer<typeof createCatalogoDetalleSchema>;
export type UpdateCatalogoDetalleFormData = z.infer<typeof updateCatalogoDetalleSchema>;
export type CatalogoDetalleFormData = z.infer<typeof catalogoDetalleFormSchema>;

export const transformToCreateRequest = (
  data: CatalogoDetalleFormData,
): CreateCatalogoDetalleFormData => {
  return {
    nombre: data.nombre.trim(), // ✅ Agregado .trim()
    activo: data.activo,
    codigo: data.codigo?.trim() || undefined,
    evento: data.evento?.trim() || undefined,
    idMaestro: data.idMaestro,
  };
};

export const transformToUpdateRequest = (
  formData: CatalogoDetalleFormData, // ✅ Corregido tipo del primer parámetro
  id: number,
): UpdateCatalogoDetalleFormData => {
  // ✅ Agregado tipo de retorno explícito
  return {
    id,
    nombre: formData.nombre.trim(),
    activo: formData.activo,
    codigo: formData.codigo?.trim() || undefined,
    evento: formData.evento?.trim() || undefined,
  };
};

export const validateCatalogoDetalleName = (name: string, idMaestro: number): boolean => {
  try {
    createCatalogoDetalleSchema.pick({ nombre: true, idMaestro: true }).parse({
      nombre: name,
      idMaestro,
    });
    return true;
  } catch {
    return false;
  }
};

export const getCatalogoDetalleValidationErrors = (data: any): Record<string, string> => {
  try {
    catalogoDetalleFormSchema.parse(data);
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
