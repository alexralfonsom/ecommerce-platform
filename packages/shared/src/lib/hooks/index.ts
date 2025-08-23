// Hooks barrel - hooks más usados
export { useGenericCRUD } from './queries/useGenericCRUD';
export { 
  useMenuHierarchy, 
  useMenuNavigationItems, 
  useMenuHierarchyWithStatus,
  createMenuQueryKeys 
} from './queries/useMenuHierarchy';
export { useDynamicRouteConfig, routeConfigUtils } from './queries/useDynamicRouteConfig';
export { useIsMobile } from './use-mobile';
export { useDeleteDialogDescription } from './useDeleteDialogDescription';

// Auth hooks
export { usePermissions, useRoles, ProtectedComponent } from './auth/usePermissions';
export { getAuth0LogoutCookie, removeAuth0LogoutCookie, type Auth0LogoutData } from './auth/useAuth0LogoutCookie';