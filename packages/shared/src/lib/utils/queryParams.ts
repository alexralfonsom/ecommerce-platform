/**
 * Utilidad para construir query parameters de forma consistente
 */

/**
 * Construye una cadena de query parameters a partir de un objeto
 * @param params - Objeto con los parámetros a convertir
 * @returns Query string (sin el '?') o cadena vacía si no hay parámetros válidos
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) {
    return '';
  }

  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  return queryParams.toString();
}

/**
 * Construye una URL completa con query parameters
 * @param baseUrl - URL base
 * @param params - Objeto con los parámetros a convertir
 * @returns URL completa con query string o URL base si no hay parámetros
 */
export function buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
  const queryString = buildQueryString(params);
  
  if (!queryString) {
    return baseUrl;
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Añade parámetros adicionales a una URL que ya puede tener query string
 * @param url - URL que puede contener query parameters
 * @param additionalParams - Parámetros adicionales a añadir
 * @returns URL con los parámetros adicionales
 */
export function appendQueryParams(url: string, additionalParams: Record<string, any>): string {
  return buildUrlWithParams(url, additionalParams);
}