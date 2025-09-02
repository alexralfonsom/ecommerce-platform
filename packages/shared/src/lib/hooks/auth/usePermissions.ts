// hooks/auth/usePermissions.ts
import React from 'react';
import { useSession } from 'next-auth/react';
import { ExtendedSession } from '@/types/auth';

export interface PermissionCheck {
  // Permisos de plataforma (Auth0)
  canRead: (resource: 'admin' | 'saas' | 'system') => boolean;
  canCreate: (resource: 'admin' | 'saas') => boolean;
  canUpdate: (resource: 'admin' | 'saas' | 'system') => boolean;
  canDelete: (resource: 'admin' | 'saas') => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getUserPermissions: () => string[];

  // Roles y permisos de aplicación
  hasAppRole: (role: string) => boolean;
  hasAnyAppRole: (roles: string[]) => boolean;
  hasAppPermission: (permission: string) => boolean;
  hasAnyAppPermission: (permissions: string[]) => boolean;
  getAppRoles: () => string[];
  getAppPermissions: () => string[];

  // Roles de plataforma
  hasPlatformRole: (role: 'super-admin' | 'tenant-admin' | 'tenant-user') => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isTenantAdmin: () => boolean;
}

/**
 * Hook para verificar permisos del usuario autenticado
 *
 * @example
 * ```tsx
 * function CatalogsList() {
 *   const { canCreate, canDelete, hasPermission } = usePermissions();
 *
 *   return (
 *     <div>
 *       {canCreate('saas') && <CreateCatalogButton />}
 *       {canDelete('saas') && <DeleteCatalogButton />}
 *       {hasPermission('read:system:audit-logs') && <AuditLogsButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): PermissionCheck {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;
  const userPermissions = extendedSession?.user?.permissions || [];
  const platformRole = extendedSession?.user?.role || '';

  // App roles se consultan on-demand para reducir tamaño de sesión
  const [appRoles, setAppRoles] = React.useState<string[]>([]);
  const [appPermissions, setAppPermissions] = React.useState<string[]>([]);

  // Cargar app roles cuando sea necesario
  React.useEffect(() => {
    if (extendedSession?.user?.tenantId && extendedSession?.user?.id) {
      // TODO: Implementar fetch a API para cargar roles dinámicamente
      // fetch('/api/user/app-roles').then(...)
    }
  }, [extendedSession?.user?.tenantId, extendedSession?.user?.id]);

  // Permisos de plataforma (Auth0)
  const canRead = (resource: 'admin' | 'saas' | 'system'): boolean => {
    if (resource === 'system') {
      return userPermissions.some((permission) => permission.startsWith('read:system:'));
    }
    return userPermissions.includes(`read:${resource}`);
  };

  const canCreate = (resource: 'admin' | 'saas'): boolean => {
    return userPermissions.includes(`create:${resource}`);
  };

  const canUpdate = (resource: 'admin' | 'saas' | 'system'): boolean => {
    if (resource === 'system') {
      return userPermissions.some((permission) => permission.startsWith('update:system:'));
    }
    return userPermissions.includes(`update:${resource}`);
  };

  const canDelete = (resource: 'admin' | 'saas'): boolean => {
    return userPermissions.includes(`delete:${resource}`);
  };

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => userPermissions.includes(permission));
  };

  const getUserPermissions = (): string[] => {
    return [...userPermissions];
  };

  // Roles de aplicación (dinámicos)
  const hasAppRole = (role: string): boolean => {
    return appRoles.includes(role);
  };

  const hasAnyAppRole = (roles: string[]): boolean => {
    return roles.some((role) => appRoles.includes(role));
  };

  const hasAppPermission = (permission: string): boolean => {
    return appPermissions.includes(permission);
  };

  const hasAnyAppPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => appPermissions.includes(permission));
  };

  const getAppRoles = (): string[] => {
    return [...appRoles];
  };

  const getAppPermissions = (): string[] => {
    return [...appPermissions];
  };

  // Roles de plataforma
  const hasPlatformRole = (role: 'super-admin' | 'tenant-admin' | 'tenant-user'): boolean => {
    return platformRole === role;
  };

  const isAdmin = (): boolean => {
    return hasPlatformRole('tenant-admin') || isSuperAdmin();
  };

  const isSuperAdmin = (): boolean => {
    return hasPlatformRole('super-admin');
  };

  const isTenantAdmin = (): boolean => {
    return hasPlatformRole('tenant-admin');
  };

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    hasAppRole,
    hasAnyAppRole,
    hasAppPermission,
    hasAnyAppPermission,
    getAppRoles,
    getAppPermissions,
    hasPlatformRole,
    isAdmin,
    isSuperAdmin,
    isTenantAdmin,
  };
}

/**
 * Hook para verificar si el usuario tiene roles específicos
 */
export function useRoles() {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;
  const userRoles = extendedSession?.user?.role ? [extendedSession.user.role] : [];

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => userRoles.includes(role));
  };

  const getUserRoles = (): string[] => {
    return [...userRoles];
  };

  return {
    hasRole,
    hasAnyRole,
    getUserRoles,
  };
}

/**
 * Componente de protección para renderizar condicionalmente basado en permisos
 *
 * @example
 * ```tsx
 * <ProtectedComponent
 *   permissions={['create:saas']}
 *   fallback={<div>No tienes permisos</div>}
 * >
 *   <CreateButton />
 * </ProtectedComponent>
 * ```
 */
interface ProtectedComponentProps {
  children: React.ReactNode;
  permissions?: string[];
  requireAll?: boolean; // Si true, requiere todos los permisos. Si false, requiere al menos uno
  fallback?: React.ReactNode;
  roles?: string[];
}

export function ProtectedComponent({
  children,
  permissions = [],
  requireAll = false,
  fallback = null,
  roles = [],
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const { hasRole, hasAnyRole } = useRoles();

  // Verificar permisos
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = hasAllPermissions(permissions);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissions);
    }
  }

  // Verificar roles
  let hasRequiredRoles = true;
  if (roles.length > 0) {
    hasRequiredRoles = hasAnyRole(roles);
  }

  if (hasRequiredPermissions && hasRequiredRoles) {
    return React.createElement(React.Fragment, null, children);
  }

  return React.createElement(React.Fragment, null, fallback);
}
