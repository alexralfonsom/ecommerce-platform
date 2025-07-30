// src/types/api.ts

// ===============================
// TIPOS BASE
// ===============================

export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  status: 'Ok' | 'NotFound' | 'Invalid' | 'Error';
  errors: string[];
  validationErrors: ValidationError[];
  location?: string;
  title?: string;
  correlationId?: string;
}

export interface ValidationError {
  propertyName: string;
  errorMessage: string;
  attemptedValue: any;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
