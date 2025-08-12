// src/lib/api/client.ts

import { getSession } from 'next-auth/react';
import { ApiResponse, ApiError, UserContext } from '@/types/api';
import { ExtendedUser, ExtendedSession } from '@/types/auth';

interface ApiClientConfig {
  name: string;
  baseURL: string;
  subscriptionKey: string;
  apiType: 'admin' | 'business';
  version?: string;
  requireAuth?: boolean; // Nuevo: forzar autenticación
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
  requireValidSession?: boolean; // Nuevo: validar session antes de request
}

// Error personalizado para autenticación
class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ApiClient {
  private config: ApiClientConfig;
  private abortControllers = new Map<string, AbortController>();

  constructor(config: ApiClientConfig) {
    this.config = {
      ...config,
      version: config.version || process.env.NEXT_PUBLIC_API_VERSION || '1.0',
      requireAuth: config.requireAuth ?? true, // Por defecto requiere auth
    };
  }

  private async validateSession(): Promise<boolean> {
    try {
      const session = (await getSession()) as ExtendedSession | null;
      return !!(session?.accessToken && session?.user);
    } catch {
      return false;
    }
  }

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

  private getClientTypeHeader(): string {
    // Headers específicos por tipo de API para mejor auditoría y control
    const clientTypes = {
      admin: 'NextJS-AdminPortal',
      business: 'NextJS-BusinessApp',
    };

    return clientTypes[this.config.apiType] || `NextJS-${this.config.apiType}`;
  }

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

  private async getHeaders(options: RequestOptions = {}): Promise<Record<string, string>> {
    // Client Type específico basado en el tipo de API
    const clientType = this.getClientTypeHeader();
    const securityHeaders = this.getSecurityHeaders();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      //'Ocp-Apim-Subscription-Key': 'b5ab8d094a014fb6a5efec10dcace918',
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

      //TODO:OJO Bearer ${session.accessToken}
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

        // Headers adicionales para Azure APIM
        headers['X-User-Claims'] = btoa(
          JSON.stringify({
            sub: userContext.userId,
            email: userContext.email,
            tenant: userContext.tenantId,
          }),
        );
      } else {
        throw new AuthenticationError('User context not available');
      }
    }

    return headers;
  }

  private getRequestUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.config.baseURL}/${cleanEndpoint}`;
    //return `${this.config.baseURL}/${this.config.version}/${cleanEndpoint}`;
  }

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

        case 403:
          const error403 = new Error('Permisos insuficientes para esta operación.');
          (error403 as any).apiError = apiError;
          throw error403;

        case 404:
          const error404 = new Error('Recurso no encontrado.');
          (error404 as any).apiError = apiError;
          throw error404;

        case 429:
          const retryAfter = response.headers.get('Retry-After');
          const error429 = new Error(
            `Límite de solicitudes excedido. ${retryAfter ? `Reintente en ${retryAfter} segundos.` : 'Intente más tarde.'}`,
          );
          (error429 as any).apiError = apiError;
          throw error429;

        case 500:
          const error500 = new Error('Error interno del servidor. Contacte soporte técnico.');
          (error500 as any).apiError = apiError;
          throw error500;

        case 502:
        case 503:
        case 504:
          const error5xx = new Error('Servicio temporalmente no disponible. Intente más tarde.');
          (error5xx as any).apiError = apiError;
          throw error5xx;

        default:
          const errorDefault = new Error(apiError.message);
          (errorDefault as any).apiError = apiError;
          throw errorDefault;
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
  private async validateRequest(options: RequestOptions = {}): Promise<void> {
    if (options.requireValidSession || (!options.skipAuth && this.config.requireAuth)) {
      const isValid = await this.validateSession();
      if (!isValid) {
        throw new AuthenticationError('Session validation failed. Please authenticate.');
      }
    }
  }

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
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', requireValidSession: true });
  }

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

  async put<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireValidSession: true,
    });
  }

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

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', requireValidSession: true });
  }

  // Método especial para endpoints públicos (sin auth)
  async publicRequest<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'skipAuth'> = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, skipAuth: true });
  }

  // Método para validar session manualmente
  async validateCurrentSession(): Promise<boolean> {
    return this.validateSession();
  }

  // Método para cancelar todas las solicitudes pendientes
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  // Método para obtener información de configuración (sin datos sensibles)
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
export function getScopesByDomain(domain: keyof typeof LOGICAL_API_CONFIG.scopes): string[] {
  return LOGICAL_API_CONFIG.scopes[domain] || [];
}

// Función para verificar permisos con scopes namespaceados
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
export function createSecureApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient({
    ...config,
    requireAuth: true, // Siempre requerir auth para clients seguros
  });
}

// Factory functions para crear clientes dinámicamente
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

export function getAdminApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    throw new Error('Admin API client can only be used on the server side');
  }

  if (!adminClientInstance) {
    adminClientInstance = createAdminApiClient();
  }
  return adminClientInstance;
}

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
