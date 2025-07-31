// src/app/[lang]/(protected)/layout.tsx
'use client';

import { AuthGuard } from '@repo/ui';
import { useSession } from 'next-auth/react';
import { useAuthToken } from '@repo/ui';
import { DashboardLayout } from '@repo/ui';
import type { ExtendedSession } from '@repo/shared/types/auth';
import { NavigationItem } from '@repo/shared/types/navigation';
import { generalIconsSVG } from '@repo/ui/configs/DesignSystem';
import { mockNavigation } from '@repo/shared/data/mocks';
import { MockProjectItems } from '@repo/shared/data/mocks';
import { MockNavSecondary } from '@repo/shared/data/mocks';
import { mockUserOptions } from '@repo/shared/data/mocks';
import {
  filterNavigationByRole,
  filterProjectsByRole,
  filterSecondaryNavByRole,
  filterUserMenuByRole,
} from '@repo/shared/lib/utils/roleUtils';

// Configuración de navegación principal
const navigation: NavigationItem[] = mockNavigation;

// Configuración del menú de usuario
const userNavigation = mockUserOptions;
const mckProjects = MockProjectItems;
const mckNavSecondary = MockNavSecondary;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  useAuthToken();
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
