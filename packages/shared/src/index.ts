// Main exports - solo los más usados
export { cn } from './lib/utils/cn';
export { formatDate, formatDateTime, capitalize } from './lib/utils/format';
export type {
  BaseApiResponse,
  ApiResponse,
  PagedApiResponse,
  ListApiResponse,
  PaginationMetadata,
} from './types/api';

// Query Provider and utilities
export {
  QueryProvider,
  createEntityQueryKeys,
  EntityStaleTime,
  getEntityQueryOptions,
} from './lib/providers/QueryProvider';

// Auth utilities
export {
  getAuth0LogoutCookie,
  removeAuth0LogoutCookie,
  type Auth0LogoutData,
} from './lib/hooks/auth/useAuth0LogoutCookie';
