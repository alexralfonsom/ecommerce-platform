// src/lib/utils/validation.ts
/**
 * Utilidades de validación
 */

/**
 * Valida si un email es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una URL es válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida longitud de texto
 */
export const validateTextLength = (
  text: string,
  minLength: number = 0,
  maxLength: number = Infinity,
): { isValid: boolean; error?: string } => {
  if (text.length < minLength) {
    return {
      isValid: false,
      error: `Debe tener al menos ${minLength} caracteres`,
    };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `No puede tener más de ${maxLength} caracteres`,
    };
  }

  return { isValid: true };
};

/**
 * Valida que un campo sea requerido
 */
export const validateRequired = (value: any): { isValid: boolean; error?: string } => {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  return {
    isValid: !isEmpty,
    error: isEmpty ? 'Este campo es requerido' : undefined,
  };
};

/**
 * Valida un número dentro de un rango
 */
export const validateNumberRange = (
  value: number,
  min: number = -Infinity,
  max: number = Infinity,
): { isValid: boolean; error?: string } => {
  if (isNaN(value)) {
    return {
      isValid: false,
      error: 'Debe ser un número válido',
    };
  }

  if (value < min) {
    return {
      isValid: false,
      error: `Debe ser mayor o igual a ${min}`,
    };
  }

  if (value > max) {
    return {
      isValid: false,
      error: `Debe ser menor o igual a ${max}`,
    };
  }

  return { isValid: true };
};

/**
 * Valida múltiples campos usando un esquema
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => { isValid: boolean; error?: string };
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = <T extends Record<string, any>>(data: T, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required validation
    if (rules.required) {
      const requiredResult = validateRequired(value);
      if (!requiredResult.isValid) {
        errors[field] = requiredResult.error!;
        continue;
      }
    }

    // Skip other validations if value is empty and not required
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // String validations
    if (typeof value === 'string') {
      // Length validation
      if (rules.minLength !== undefined || rules.maxLength !== undefined) {
        const lengthResult = validateTextLength(value, rules.minLength, rules.maxLength);
        if (!lengthResult.isValid) {
          errors[field] = lengthResult.error!;
          continue;
        }
      }

      // Email validation
      if (rules.email && !isValidEmail(value)) {
        errors[field] = 'Debe ser un email válido';
        continue;
      }

      // URL validation
      if (rules.url && !isValidUrl(value)) {
        errors[field] = 'Debe ser una URL válida';
        continue;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = 'Formato inválido';
        continue;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined || rules.max !== undefined) {
        const rangeResult = validateNumberRange(value, rules.min, rules.max);
        if (!rangeResult.isValid) {
          errors[field] = rangeResult.error!;
          continue;
        }
      }
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (!customResult.isValid) {
        errors[field] = customResult.error!;
        continue;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitiza una cadena de texto
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';

  return str
    .trim()
    .replace(/\s+/g, ' ') // Reemplaza múltiples espacios con uno solo
    .replace(/[<>]/g, ''); // Remueve caracteres HTML básicos
};

/**
 * Valida si una cadena contiene solo caracteres alfanuméricos
 */
export const isAlphanumeric = (str: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
};

/**
 * Valida código postal (formato simple)
 */
export const isValidPostalCode = (code: string): boolean => {
  // Formato básico: 5 dígitos o 5 dígitos-4 dígitos
  const postalCodeRegex = /^\d{5}(-\d{4})?$/;
  return postalCodeRegex.test(code);
};

/**
 * Valida número de teléfono (formato básico)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Formato básico internacional
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};
