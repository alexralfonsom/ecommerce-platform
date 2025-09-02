// src/components/auth/AuthGuard.tsx
'use client';

import { useSession } from 'next-auth/react';
import { ExtendedUser } from '@repo/shared/types/auth';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { APP_ROUTES } from '@repo/shared/configs/routes';

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[]; // Opcionalmente verificar roles específicos
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  // Estado para controlar si se ha terminado de hacer las verificaciones iniciales
  const [isChecking, setIsChecking] = useState(true);

  // Validación de ruta pública
  const isPublicRoute = APP_ROUTES.isPublicRoute(pathname, locale);

  useEffect(() => {
    // Si todavía está cargando, no hacer nada
    if (status === 'loading') return;

    // Si está en una ruta pública, no se requiere validación
    if (isPublicRoute) {
      setIsChecking(false);
      return;
    }

    if (status === 'unauthenticated') {
      router.push(
        APP_ROUTES.getSignInRoute(locale) + `?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    // Validación de roles
    console.log(requiredRoles, session);
    if (
      requiredRoles &&
      session &&
      !requiredRoles.includes((session.user as ExtendedUser).role ?? '')
    ) {
      router.push(`/${locale}/auth/error?code=403`);
      return;
    }
    // Terminar la verificación
    setIsChecking(false);
  }, [status, isPublicRoute, session, requiredRoles, router, pathname, locale]);

  // Mostrar un estado de carga mientras se verifica la autenticación o los permisos
  if (status === 'loading' || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm">Verificando sesión...</div>
      </div>
    );
  }

  // Mostrar el contenido protegido solo si está autenticado y tiene los permisos necesarios
  return <>{children}</>;
}
