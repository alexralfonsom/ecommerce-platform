// API barrel - cliente y endpoints principales
export {
  // Universal clients (recomendado)
  getUniversalBusinessApiClient,
  getUniversalAdminApiClient,

  // Server-only clients
  getBusinessApiClient,
  getAdminApiClient,

  // Client-only clients
  getClientBusinessApiClient,
  getClientAdminApiClient,

  // Factory functions
  createSecureApiClient,

  // Error classes
  AuthenticationError,

  // API Configs
  LOGICAL_API_CONFIG,
  getAllScopes,
  getScopesByDomain,
  hasPermission,
} from './client';

export type { ApiClientConfig, RequestOptions } from './client';

// Default export - universal business client
export { default } from './client';
