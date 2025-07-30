// src/lib/utils/roleUtils.ts
import { BasicNavigationItem, NavigationItem } from '@/types/navigation';
import { UserMenuEntry } from '@/types/userMenuItems';

// Definir roles disponibles en la aplicación
export type UserRole = 'admin' | 'user' | 'manager' | 'viewer';

// Función para verificar si el usuario tiene acceso a un elemento
export function hasAccess(userRole: string | undefined, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // Si no hay roles especificados, permitir acceso
  }

  if (!userRole) {
    return false; // Si no hay rol de usuario, denegar acceso
  }

  return allowedRoles.includes(userRole as UserRole);
}

// Filtrar elementos de navegación principal basado en roles
export function filterNavigationByRole(
  navigation: NavigationItem[],
  userRole: string | undefined,
): NavigationItem[] {
  return navigation.filter((item) => {
    // Verificar acceso al elemento principal
    if (!hasAccess(userRole, item.allowedRoles)) {
      return false;
    }

    // Si tiene items hijos, filtrarlos también
    if (item.children && item.children.length > 0) {
      item.children = item.children.filter((subItem) => hasAccess(userRole, subItem.allowedRoles));
    }

    return true;
  });
}

// Filtrar proyectos basado en roles
export function filterProjectsByRole(
  projects: BasicNavigationItem[] | undefined,
  userRole: string | undefined,
): BasicNavigationItem[] | undefined {
  if (!projects) return projects;

  return projects.filter((project) => hasAccess(userRole, project.allowedRoles));
}

// Filtrar navegación secundaria basado en roles
export function filterSecondaryNavByRole(
  navSecondary: BasicNavigationItem[] | undefined,
  userRole: string | undefined,
): BasicNavigationItem[] | undefined {
  if (!navSecondary) return navSecondary;

  return navSecondary.filter((item) => hasAccess(userRole, item.allowedRoles));
}

// Filtrar menú de usuario basado en roles
export function filterUserMenuByRole(
  userMenu: UserMenuEntry[],
  userRole: string | undefined,
): UserMenuEntry[] {
  return userMenu.filter((menuItem) => hasAccess(userRole, menuItem.allowedRoles));
}

// Verificar si el usuario es administrador
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === 'admin';
}

// Verificar si el usuario es manager o superior
export function isManagerOrAbove(userRole: string | undefined): boolean {
  return userRole === 'admin' || userRole === 'manager';
}
