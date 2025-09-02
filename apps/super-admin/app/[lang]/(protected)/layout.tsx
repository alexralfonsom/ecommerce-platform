// src/app/[lang]/(protected)/layout.tsx
'use client';

import { AuthGuard } from '@repo/ui';
import { useSession } from 'next-auth/react';
import { useAuthToken } from '@repo/ui';
import { DashboardLayout } from '@repo/ui';
import type { ExtendedSession } from '@repo/shared/types/auth';
import { NavigationItem } from '@repo/shared/types/navigation';
import { generalIconsSVG } from '@repo/ui/configs/DesignSystem';
import { useMenuNavigationItems } from '@repo/shared/lib/hooks';
import {
  filterNavigationByRole,
  filterProjectsByRole,
  filterSecondaryNavByRole,
  filterUserMenuByRole,
} from '@repo/shared/lib/utils';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  useAuthToken();

  // 🔄 Cargar menús dinámicamente desde la API con fallback a mocks (PARALELO)
  const dynamicNavigation = useMenuNavigationItems({
    menuTypeCode: 'MAIN_MENU',
    fallbackToMocks: true,
    enableCache: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔄 Cargar menú secundario dinámicamente (PARALELO con el anterior)
  const dynamicNavSecondary = useMenuNavigationItems({
    menuTypeCode: 'SECONDARY_MENU',
    fallbackToMocks: true,
    enableCache: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔄 Cargar menú de proyectos/administrativo dinámicamente (PARALELO con los anteriores)
  const dynamicProjects = useMenuNavigationItems({
    menuTypeCode: 'MENU_GLOBAL_ADMINISTRATIVE',
    fallbackToMocks: true,
    enableCache: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // 🔄 Cargar menú de usuario dinámicamente (PARALELO con todos los anteriores)
  const dynamicUserNavigation = useMenuNavigationItems({
    menuTypeCode: 'USER_MENU',
    fallbackToMocks: true,
    enableCache: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Configuración de navegación - ahora TODOS son dinámicos 🎉
  const navigation: NavigationItem[] = dynamicNavigation;
  const mckNavSecondary: NavigationItem[] = dynamicNavSecondary;
  const mckProjects: NavigationItem[] = dynamicProjects;
  const userNavigation: NavigationItem[] = dynamicUserNavigation;

  // Mapear datos de Auth0 a tipos NextAuth
  const user = session?.user
    ? {
        id: session.user.id || session.user.sub || 'unknown',
        name: session.user.name || 'Usuario',
        email: session.user.email || 'example@email.com',
        image: session.user.image || session.user.picture || generalIconsSVG.emptyUser,
        picture: session.user.image || session.user.picture || generalIconsSVG.emptyUser,
        role: session.user.role,
        provider: session.user.provider,
      }
    : undefined;

  // Filtrar elementos de navegación basado en el rol del usuario
  const userRole = session?.user?.role;
  const filteredNavigation = filterNavigationByRole(navigation, userRole);
  const filteredProjects = filterProjectsByRole(mckProjects, userRole);
  const filteredNavSecondary = filterSecondaryNavByRole(mckNavSecondary, userRole);
  const filteredUserNavigation = filterUserMenuByRole(userNavigation, userRole);

  return (
    <AuthGuard>
      <DashboardLayout
        navigation={filteredNavigation}
        userNavigation={filteredUserNavigation}
        projects={filteredProjects}
        navSecondary={filteredNavSecondary}
        user={user}
      >
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
