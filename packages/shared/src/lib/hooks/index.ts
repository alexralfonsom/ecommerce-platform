// Hooks barrel - hooks más usados
export { useGenericCRUD } from './queries/useGenericCRUD';
export { useIsMobile } from './use-mobile';
export { useDeleteDialogDescription } from './useDeleteDialogDescription';

// Auth hooks
export { usePermissions, useRoles, ProtectedComponent } from './auth/usePermissions';
export { getAuth0LogoutCookie, removeAuth0LogoutCookie, type Auth0LogoutData } from './auth/useAuth0LogoutCookie';