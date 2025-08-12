/**
 * API Client utilities for communicating with Admin and Business APIs through APIM.
 *
 * Features:
 * - Automatic AuthN/AuthZ using next-auth session (Bearer token + user context headers)
 * - Request validation and required auth gating
 * - Consistent security and telemetry headers (request ID, timestamps, contexts)
 * - Centralized error handling with rich ApiError metadata and UX-friendly messages
 * - Helpers for server-side and client-side API clients with environment validation
 * - Scope and permission helpers for domain-based authorization checks
 *
 * Nota: Este archivo está documentado con JSDoc para facilitar su comprensión y uso.
 */
// src/lib/api/client.ts

import { getSession } from 'next-auth/react';
import { ApiResponse, ApiError, UserContext } from '@/types/api';
import { ExtendedUser, ExtendedSession } from '@/types/auth';

/**
 * Configuración para instanciar un ApiClient.
 * @typedef ApiClientConfig
 * @property {string} name Nombre descriptivo del cliente (p. ej., "Admin API").
 * @property {string} baseURL URL base del endpoint publicado en APIM (sin slash final).
 * @property {string} subscriptionKey Clave de suscripción de APIM (server-side) o pública (client-side).
 * @property {('admin'|'business')} apiType Tipo de API objetivo para ajustar headers/contexto.
 * @property {string} [version] Versión de la API a reportar en headers (por defecto process.env.NEXT_PUBLIC_API_VERSION o '1.0').
 * @property {boolean} [requireAuth=true] Si se debe exigir sesión/token para realizar requests.
 */
interface ApiClientConfig {
  name: string;
  baseURL: string;
  subscriptionKey: string;
  apiType: 'admin' | 'business';
  version?: string;
  requireAuth?: boolean; // Nuevo: forzar autenticación
}

/**
 * Opciones de request extendidas basadas en RequestInit de Fetch API.
 * @typedef RequestOptions
 * @property {boolean} [skipAuth] Si se debe omitir la verificación y anexado de autenticación.
 * @property {number} [timeout] Tiempo máximo en ms antes de abortar la solicitud.
 * @property {boolean} [requireValidSession] Forzar validación de sesión antes del request incluso si skipAuth es true.
 */
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
  requireValidSession?: boolean; // Nuevo: validar session antes de request
}

/**
 * Error lanzado cuando la autenticación es requerida o inválida.
 * Útil para distinguir fallos de auth de otros errores de red o negocio.
 * @extends Error
 */
class AuthenticationError extends Error {
  /**
   * @param {string} [message="Authentication required"] Mensaje descriptivo del error.
   */
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Cliente HTTP para interactuar con APIs administradas por APIM con autenticación y trazabilidad.
 */
class ApiClient {
  private config: ApiClientConfig;
  private abortControllers = new Map<string, AbortController>();

  /**
   * Crea una instancia de ApiClient.
   * @param {ApiClientConfig} config Configuración del cliente.
   */
  constructor(config: ApiClientConfig) {
    this.config = {
      ...config,
      version: config.version || process.env.NEXT_PUBLIC_API_VERSION || '1.0',
      requireAuth: config.requireAuth ?? true, // Por defecto requiere auth
    };
  }

  /**
   * Valida que exista una sesión activa con token y usuario válido.
   * @returns {Promise<boolean>} true si la sesión es válida.
   */
  private async validateSession(): Promise<boolean> {
    try {
      const session = (await getSession()) as ExtendedSession | null;
      return !!(session?.accessToken && session?.user);
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el contexto de usuario desde la sesión para auditoría (IDs, email, tenant, permisos).
   * @returns {Promise<UserContext|null>} Contexto de usuario o null si no está disponible.
   */
  private async getUserContext(): Promise<UserContext | null> {
    try {
      const session = await getSession();
      if (!session?.user) return null;
      const user = session?.user as ExtendedUser;

      return {
        userId: user.id || user.sub || '',
        email: user.email || '',
        name: user.name || user.fullName || '',
        tenantId: user.tenantId,
        permissions: user.permissions || [],
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Determina el valor del header X-Client-Type según el tipo de API.
   * @returns {string} Identificador del tipo de cliente.
   */
  private getClientTypeHeader(): string {
    // Headers específicos por tipo de API para mejor auditoría y control
    const clientTypes = {
      admin: 'NextJS-AdminPortal',
      business: 'NextJS-BusinessApp',
    };

    return clientTypes[this.config.apiType] || `NextJS-${this.config.apiType}`;
  }

  /**
   * Construye headers de seguridad generales y específicos por contexto (admin/business).
   * @returns {Record<string,string>} Headers de seguridad a incluir en cada request.
   */
  private getSecurityHeaders(): Record<string, string> {
    // Headers de seguridad específicos por tipo de API
    const baseSecurityHeaders = {
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      'X-Environment': process.env.NODE_ENV || 'development',
    };

    // Headers específicos por contexto de API
    const contextHeaders = {
      admin: {
        'X-Admin-Level': 'portal', // Diferencia entre portal vs API directo
        'X-Security-Context': 'high-privilege',
      },
      business: {
        'X-Business-Context': 'tenant-operations',
        'X-Security-Context': 'standard',
      },
    };

    return {
      ...baseSecurityHeaders,
      ...(contextHeaders[this.config.apiType] || {}),
    };
  }

  /**
   * Genera headers comunes y de autenticación/contexto de usuario cuando corresponde.
   * Lanza AuthenticationError si requireAuth y no existe sesión/token o contexto de usuario.
   * @param {RequestOptions} [options]
   * @returns {Promise<Record<string,string>>}
   * @throws {AuthenticationError}
   */
  private async getHeaders(options: RequestOptions = {}): Promise<Record<string, string>> {
    // Client Type específico basado en el tipo de API
    const clientType = this.getClientTypeHeader();
    const securityHeaders = this.getSecurityHeaders();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
      'X-API-Version': this.config.version!,
      'X-Client-Type': clientType,
      'X-API-Context': this.config.apiType, // Contexto adicional
      'X-Request-ID': crypto.randomUUID(),
      'X-Request-Timestamp': new Date().toISOString(),
      ...securityHeaders, // Headers de seguridad específicos
    };

    // Validación obligatoria de autenticación
    if (!options.skipAuth && this.config.requireAuth) {
      const hasValidSession = await this.validateSession();

      if (!hasValidSession) {
        throw new AuthenticationError('Valid session required for API access');
      }

      const session = (await getSession()) as ExtendedSession | null;

      if (!session?.accessToken) {
        throw new AuthenticationError('Access token not found in session');
      }

      headers['Authorization'] = `Bearer ${session.accessToken}`;

      // Agregar contexto de usuario para auditoría (OBLIGATORIO)
      const userContext = await this.getUserContext();
      if (userContext) {
        headers['X-User-ID'] = userContext.userId;
        headers['X-User-Email'] = userContext.email;
        headers['X-User-Name'] = encodeURIComponent(userContext.name);

        if (userContext.tenantId) {
          headers['X-Tenant-ID'] = userContext.tenantId;
        }
      } else {
        throw new AuthenticationError('User context not available');
      }
    }

    return headers;
  }

  /**
   * Construye la URL completa del request a partir del endpoint relativo.
   * @param {string} endpoint Endpoint relativo (con o sin slash inicial).
   * @returns {string} URL absoluta a invocar.
   */
  private getRequestUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.config.baseURL}/${cleanEndpoint}`;
    //return `${this.config.baseURL}/${this.config.version}/${cleanEndpoint}`;
  }

  /**
   * Maneja la respuesta HTTP: parsea JSON/Text, mapea errores comunes y adjunta metadatos.
   * Si la respuesta encaja con ApiResponse, retorna el objeto completo (no sólo value).
   * @template T
   * @param {Response} response Respuesta cruda de fetch.
   * @returns {Promise<T>} Datos parseados.
   * @throws {AuthenticationError|Error}
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';

      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details || '';
        } catch {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
        }
      }

      const apiError: ApiError = {
        message: errorMessage,
        statusCode: response.status,
        details: errorDetails,
        type: response.type,
        traceId:
          response.headers.get('X-Trace-ID') || response.headers.get('X-Request-ID') || undefined,
        timestamp: new Date().toISOString(),
      };

      // Manejar errores específicos con mejor UX
      switch (response.status) {
        case 401:
          // Limpiar session y redirigir
          if (typeof window !== 'undefined') {
            // Trigger de revalidación de session
            await fetch('/api/auth/session', { method: 'DELETE' });
            window.location.href =
              '/auth/signin?error=session_expired&returnUrl=' +
              encodeURIComponent(window.location.pathname);
          }
          throw new AuthenticationError('Sesión expirada. Redirigiendo al login...');

        case 403: {
          let error403 = new Error('Permisos insuficientes para esta operación.');
          (error403 as any).apiError = apiError;
          throw error403;
        }
        case 404: {
          const error404 = new Error('Recurso no encontrado.');
          (error404 as any).apiError = apiError;
          throw error404;
        }
        case 429: {
          const retryAfter = response.headers.get('Retry-After');
          const error429 = new Error(
            `Límite de solicitudes excedido. ${retryAfter ? `Reintente en ${retryAfter} segundos.` : 'Intente más tarde.'}`,
          );
          (error429 as any).apiError = apiError;
          throw error429;
        }
        case 500: {
          const error500 = new Error('Error interno del servidor. Contacte soporte técnico.');
          (error500 as any).apiError = apiError;
          throw error500;
        }

        case 502:
        case 503:
        case 504: {
          const error5xx = new Error('Servicio temporalmente no disponible. Intente más tarde.');
          (error5xx as any).apiError = apiError;
          throw error5xx;
        }

        default: {
          const errorDefault = new Error(apiError.message);
          (errorDefault as any).apiError = apiError;
          throw errorDefault;
        }
      }
    }

    if (!isJson) {
      return response.text() as T;
    }

    const data = await response.json();

    // Si la respuesta tiene el formato de ApiResponse, verificar éxito pero retornar toda la estructura
    if (data && typeof data === 'object' && 'value' in data && 'isSuccess' in data) {
      const apiResponse = data as ApiResponse<T>;
      if (!apiResponse.isSuccess) {
        throw new Error(apiResponse.successMessage || 'Error en la respuesta de la API');
      }
      // Retornar toda la ApiResponse, no solo el value
      return data as T;
    }

    return data;
  }

  // Validación previa obligatoria para todos los requests
  /**
   * Validación previa obligatoria: exige sesión válida si requireAuth o requireValidSession.
   * @param {RequestOptions} [options]
   * @returns {Promise<void>}
   * @throws {AuthenticationError}
   */
  private async validateRequest(options: RequestOptions = {}): Promise<void> {
    if (options.requireValidSession || (!options.skipAuth && this.config.requireAuth)) {
      const isValid = await this.validateSession();
      if (!isValid) {
        throw new AuthenticationError('Session validation failed. Please authenticate.');
      }
    }
  }

  /**
   * Realiza un request HTTP genérico con headers, timeout, abort y manejo de respuesta.
   * @template T
   * @param {string} endpoint Endpoint relativo.
   * @param {RequestOptions} [options] Opciones de la solicitud (método, headers, body, timeout...).
   * @returns {Promise<T>} Resultado parseado.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Validación previa OBLIGATORIA
    await this.validateRequest(options);

    const requestId = crypto.randomUUID();
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    try {
      const headers = await this.getHeaders(options);
      const url = this.getRequestUrl(endpoint);

      // Configurar timeout si se especifica
      if (options.timeout) {
        setTimeout(() => controller.abort(), options.timeout);
      }

      // Logging detallado para debugging (sin tokens)
      const logHeaders = Object.fromEntries(
        Object.entries(headers).filter(
          ([key]) =>
            !key.toLowerCase().includes('authorization') &&
            !key.toLowerCase().includes('subscription') &&
            !key.toLowerCase().includes('claims'),
        ),
      );

      console.log(`🌐 API Request [${this.config.apiType}]:`, {
        method: options.method || 'GET',
        url,
        headers: logHeaders,
        hasAuth: !!headers['Authorization'],
        hasSubscription: !!headers['Ocp-Apim-Subscription-Key'],
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      const result = await this.handleResponse<T>(response);

      console.log(`✅ API Response [${this.config.apiType}]:`, {
        status: response.status,
        url,
        success: true,
        hasTraceId: !!response.headers.get('X-Trace-ID'),
      });

      return result;
    } catch (error) {
      console.error(`❌ API Error [${this.config.apiType}]:`, {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof AuthenticationError ? 'AUTH_ERROR' : 'API_ERROR',
      });
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  // Métodos específicos con validación obligatoria
  /**
   * Realiza un GET con validación de sesión.
   * @template T
   * @param {string} endpoint
   * @param {Omit<RequestOptions,'method'|'body'>} [options]
   * @returns {Promise<T>}
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', requireValidSession: true });
  }

  /**
   * Realiza un POST con validación de sesión.
   * @template T
   * @param {string} endpoint
   * @param {any} [data] Cuerpo JSON serializable.
   * @param {Omit<RequestOptions,'method'>} [options]
   * @returns {Promise<T>}
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requireValidSession: true,
    });
  }

  /**
   * Realiza un PUT con validación de sesión.
   * @template T
   * @param {string} endpoint
   * @param {any} [data]
   * @param {Omit<RequestOptions,'method'>} [options]
   * @returns {Promise<T>}
   */
  async put<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireValidSession: true,
    });
  }

  /**
   * Realiza un PATCH con validación de sesión.
   * @template T
   * @param {string} endpoint
   * @param {any} [data]
   * @param {Omit<RequestOptions,'method'>} [options]
   * @returns {Promise<T>}
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      requireValidSession: true,
    });
  }

  /**
   * Realiza un DELETE con validación de sesión.
   * @template T
   * @param {string} endpoint
   * @param {Omit<RequestOptions,'method'|'body'>} [options]
   * @returns {Promise<T>}
   */
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', requireValidSession: true });
  }

  /**
   * Request para endpoints públicos (omite autenticación) pero conserva headers comunes.
   * @template T
   * @param {string} endpoint
   * @param {Omit<RequestOptions,'skipAuth'>} [options]
   * @returns {Promise<T>}
   */
  async publicRequest<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'skipAuth'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, skipAuth: true });
  }

  /**
   * Valida manualmente la sesión actual.
   * @returns {Promise<boolean>} true si la sesión es válida.
   */
  async validateCurrentSession(): Promise<boolean> {
    return this.validateSession();
  }

  /**
   * Cancela todas las solicitudes pendientes mediante AbortController.
   * @returns {void}
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Obtiene la configuración pública del cliente (sin datos sensibles como subscriptionKey).
   * @returns {Omit<ApiClientConfig,'subscriptionKey'>}
   */
  getConfig(): Omit<ApiClientConfig, 'subscriptionKey'> {
    return {
      name: this.config.name,
      baseURL: this.config.baseURL,
      apiType: this.config.apiType,
      version: this.config.version,
      requireAuth: this.config.requireAuth,
    };
  }
}

// Configuración de la Logical API única con scopes namespaceados
/**
 * Configuración de la API lógica y sus scopes por dominio.
 */
export const LOGICAL_API_CONFIG = {
  // Una sola audience que representa ambas APIs
  audience: process.env.AUTH0_AUDIENCE || 'saas-system-api',

  // Scopes namespaceados por dominio de negocio
  scopes: {
    // Business API scopes (operaciones de negocio)
    business: ['read:saas', 'create:saas', 'update:saas', 'delete:saas'],

    // Admin API scopes (administración del sistema)
    admin: ['read:admin', 'create:admin', 'update:admin', 'delete:admin'],

    // Scopes generales del sistema
    system: [
      'read:system:profile',
      'update:system:profile',
      'read:system:notifications',
      'read:system:audit-logs',
    ],
  },
};

// Función para obtener todos los scopes en una sola string
/**
 * Retorna todos los scopes requeridos por el sistema (incluye openid, profile, email).
 * @returns {string} Scopes concatenados en una sola string separados por espacio.
 */
export function getAllScopes(): string {
  const allScopes = [
    'openid',
    'profile',
    'email',
    ...LOGICAL_API_CONFIG.scopes.business,
    ...LOGICAL_API_CONFIG.scopes.admin,
    ...LOGICAL_API_CONFIG.scopes.system,
  ];

  return allScopes.join(' ');
}

// Función para obtener scopes específicos por dominio
/**
 * Obtiene scopes específicos por dominio (business | admin | system).
 * @param {keyof typeof LOGICAL_API_CONFIG.scopes} domain Dominio.
 * @returns {string[]} Lista de scopes.
 */
export function getScopesByDomain(domain: keyof typeof LOGICAL_API_CONFIG.scopes): string[] {
  return LOGICAL_API_CONFIG.scopes[domain] || [];
}

// Función para verificar permisos con scopes namespaceados
/**
 * Verifica si el usuario posee un permiso específico compuesto por dominio:acción[:recurso].
 * @param {string[]} userPermissions Lista de permisos del usuario.
 * @param {string} domain Dominio (p. ej., system, admin, business).
 * @param {string} action Acción (read, create, update, delete).
 * @param {string} resource Recurso opcional para granularidad adicional.
 * @returns {boolean}
 */
export function hasPermission(
  userPermissions: string[],
  domain: string,
  action: string,
  resource: string,
): boolean {
  const requiredPermission = resource ? `${domain}:${action}:${resource}` : `${domain}:${action}`;

  return userPermissions.includes(requiredPermission);
}

// Validar configuración de environment (mejorado)
/**
 * Valida que las variables de entorno requeridas estén presentes.
 * En server-side, también valida las subscription keys privadas.
 * @throws {Error} Si faltan variables requeridas.
 */
function validateEnvironment() {
  const requiredVars = ['NEXT_PUBLIC_APIM_ADMIN_BASE_URL', 'NEXT_PUBLIC_APIM_BUSINESS_BASE_URL'];

  // Variables que deben estar en server-side
  const serverVars = ['APIM_ADMIN_SUBSCRIPTION_KEY', 'APIM_BUSINESS_SUBSCRIPTION_KEY'];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (typeof window === 'undefined') {
    // En servidor, validar también las keys de subscription
    missing.push(...serverVars.filter((varName) => !process.env[varName]));
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Validar al inicializar (solo en servidor)
if (typeof window === 'undefined') {
  validateEnvironment();
}

// Factory function para crear clientes seguros
/**
 * Crea un ApiClient con requireAuth forzado a true.
 * @param {ApiClientConfig} config
 * @returns {ApiClient}
 */
export function createSecureApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient({
    ...config,
    requireAuth: true, // Siempre requerir auth para clients seguros
  });
}

// Factory functions para crear clientes dinámicamente
/**
 * Crea un ApiClient para la Admin API (server-side) usando variables privadas.
 * @returns {ApiClient}
 * @throws {Error} Si faltan variables de entorno.
 */
export function createAdminApiClient(): ApiClient {
  const baseURL = process.env.NEXT_PUBLIC_APIM_ADMIN_BASE_URL;
  const subscriptionKey = process.env.APIM_ADMIN_SUBSCRIPTION_KEY;

  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_APIM_ADMIN_BASE_URL environment variable is required');
  }
  if (!subscriptionKey) {
    throw new Error('APIM_ADMIN_SUBSCRIPTION_KEY environment variable is required');
  }

  return createSecureApiClient({
    name: 'Admin API',
    baseURL,
    subscriptionKey,
    apiType: 'admin',
  });
}

/**
 * Crea un ApiClient para la Business API (server-side) usando variables privadas.
 * @returns {ApiClient}
 * @throws {Error} Si faltan variables de entorno.
 */
export function createBusinessApiClient(): ApiClient {
  const baseURL = process.env.NEXT_PUBLIC_APIM_BUSINESS_BASE_URL;
  const subscriptionKey = process.env.APIM_BUSINESS_SUBSCRIPTION_KEY;

  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_APIM_BUSINESS_BASE_URL environment variable is required');
  }
  if (!subscriptionKey) {
    throw new Error('APIM_BUSINESS_SUBSCRIPTION_KEY environment variable is required');
  }

  return createSecureApiClient({
    name: 'Business API',
    baseURL,
    subscriptionKey,
    apiType: 'business',
  });
}

// Singleton pattern para reutilización (solo en servidor)
let adminClientInstance: ApiClient | null = null;
let businessClientInstance: ApiClient | null = null;

/**
 * Retorna un singleton de ApiClient para Admin API (server-side only).
 * @returns {ApiClient}
 * @throws {Error} Si se invoca desde el cliente.
 */
export function getAdminApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    throw new Error('Admin API client can only be used on the server side');
  }

  if (!adminClientInstance) {
    adminClientInstance = createAdminApiClient();
  }
  return adminClientInstance;
}

/**
 * Retorna un singleton de ApiClient para Bussines API (server-side only).
 * @returns {ApiClient}
 * @throws {Error} Si se invoca desde el cliente.
 */
export function getBusinessApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    throw new Error('Business API client can only be used on the server side');
  }

  if (!businessClientInstance) {
    businessClientInstance = createBusinessApiClient();
  }
  return businessClientInstance;
}

// ===============================
// CLIENT-SIDE API CLIENTS
// ===============================

// Para uso en cliente, usa las mismas URLs pero sin subscription keys server-side
export function createClientApiClient(apiType: 'admin' | 'business'): ApiClient {
  if (typeof window === 'undefined') {
    throw new Error('Client API clients can only be used on the client side');
  }

  // En el cliente, usar las mismas URLs públicas que en servidor
  const baseURL =
    apiType === 'admin'
      ? process.env.NEXT_PUBLIC_APIM_ADMIN_BASE_URL
      : process.env.NEXT_PUBLIC_APIM_BUSINESS_BASE_URL;

  if (!baseURL) {
    throw new Error(
      `NEXT_PUBLIC_APIM_${apiType.toUpperCase()}_BASE_URL environment variable is required`,
    );
  }

  // Usar la subscription key pública correspondiente al tipo de API
  const subscriptionKey =
    apiType === 'admin'
      ? process.env.NEXT_PUBLIC_APIM_ADMIN_SUBSCRIPTION_KEY
      : process.env.NEXT_PUBLIC_APIM_BUSINESS_SUBSCRIPTION_KEY;

  if (!subscriptionKey) {
    throw new Error(
      `NEXT_PUBLIC_APIM_${apiType.toUpperCase()}_SUBSCRIPTION_KEY environment variable is required`,
    );
  }

  return new ApiClient({
    name: `Client ${apiType.toUpperCase()} API`,
    baseURL,
    subscriptionKey,
    apiType,
    requireAuth: true,
  });
}

export function getClientBusinessApiClient(): ApiClient {
  return createClientApiClient('business');
}

export function getClientAdminApiClient(): ApiClient {
  return createClientApiClient('admin');
}

// ===============================
// UNIVERSAL API CLIENT GETTER
// ===============================

// Esta función decide automáticamente si usar server-side o client-side
export function getUniversalBusinessApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    // Cliente: usar API routes
    return getClientBusinessApiClient();
  } else {
    // Servidor: usar directamente
    return getBusinessApiClient();
  }
}

export function getUniversalAdminApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    // Cliente: usar API routes
    return getClientAdminApiClient();
  } else {
    // Servidor: usar directamente
    return getAdminApiClient();
  }
}

// Export por defecto (universal function)
export default getUniversalBusinessApiClient;

// Export de tipos para uso externo
export type { ApiClientConfig, RequestOptions };
export { AuthenticationError };
