// src/hooks/useSecureLogout.ts
'use client';
import { useCallback, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ExtendedSession, ExtendedUser } from '@repo/shared/types/auth';
import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
import { APP_ROUTES } from '@repo/shared/configs/routes';

interface UseSecureLogoutOptions {
  redirectTo?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onLogoutError?: (error: Error) => void;
}

interface UseSecureLogoutReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  error: string | null;
}

export function useSecureLogout(options: UseSecureLogoutOptions = {}): UseSecureLogoutReturn {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authMode = getCurrentAuthMode();

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setError(null);
    options.onLogoutStart?.();

    try {
      console.log('entro al logout', session);
      if (authMode === 'auth0' && session?.user?.provider === 'auth0') {
        console.log('entro al logout de Auth0');
        // Construir URL de logout de Auth0
        const redirectUrl = `${baseUrl}${APP_ROUTES.getSignOutRoute(locale)}`;
        const auth0LogoutUrl = `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oidc/logout?id_token_hint=${session?.id_token}&client_id=${session?.client_id}&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;

        console.log('Redirecting to Auth0 logout:', auth0LogoutUrl);
        // Hacer signOut de NextAuth primero
        await signOut({
          redirect: false,
        });
        // Redirigir al usuario a Auth0 para cerrar sesión SSO
        window.location.href = auth0LogoutUrl;
      }

      options.onLogoutComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during logout';
      setError(errorMessage);
      options.onLogoutError?.(err instanceof Error ? err : new Error(errorMessage));

      // Forzar logout básico aunque haya errores
      try {
        await signOut({
          redirect: true,
          callbackUrl: options.redirectTo ?? APP_ROUTES.getSignOutRoute(locale),
        });
      } catch (forceLogoutError) {
        console.error('Force logout also failed:', forceLogoutError);
        // Último recurso: reload de la página
        window.location.href = APP_ROUTES.getSignOutRoute(locale);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, session, authMode, options, baseUrl, locale]);

  return {
    logout,
    isLoggingOut,
    error,
  };
}
