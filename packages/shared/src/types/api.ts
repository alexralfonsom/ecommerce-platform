// src/types/api.ts

// ===============================
// TIPOS BASE
// ===============================

// Base para todas las respuestas del API
export interface BaseApiResponse {
  isSuccess: boolean;
  status: 'Ok' | 'NotFound' | 'Invalid' | 'Error';
  title?: string;
  successMessage?: string;
  correlationId?: string;
  location?: string;
  errors: string[];
  validationErrors: ValidationError[];
}

// Estructura para errores de validación
// Utilizada en respuestas de error o validación
// Ejemplo: cuando se envían datos inválidos al API
// o cuando se valida un modelo y hay errores de validación
export interface ValidationError {
  propertyName: string;
  errorMessage: string;
  attemptedValue: any;
}

// Respuesta genérica con value
// Utilizada para respuestas exitosas que devuelven un valor específico
// Ejemplo: al crear un recurso, obtener un objeto por ID, etc.
// Esta es la estructura que se espera en las respuestas exitosas del API
// Contiene un campo "value" que es el resultado de la operación
// y puede ser de cualquier tipo T
export interface ApiResponse<T> extends BaseApiResponse {
  value: T;
}

// Metadata para respuestas paginadas
// Utilizada en listados paginados
export interface PaginationMetadata {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Estructura para value con items y metadata (listados paginados)
export interface PagedValue<T> {
  items: T[];
  metadata: PaginationMetadata;
}

// Estructura para value con solo items (listados simples)
export interface ListValue<T> {
  items: T[];
}

// Respuesta para listados paginados
export interface PagedApiResponse<T> extends BaseApiResponse {
  value: PagedValue<T>; // 👈 Contiene items + metadata
}

// Respuesta para listados simples (getAll)
export interface ListApiResponse<T> extends BaseApiResponse {
  value: ListValue<T>; // 👈 Contiene solo items
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: string;
  traceId?: string;
  timestamp: string;
  type: string;
}

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  tenantId?: string;
  permissions: string[];
}

export interface AuditInfo {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}
