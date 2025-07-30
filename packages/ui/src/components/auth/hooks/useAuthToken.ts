// src/hooks/useAuthToken.ts
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setApiToken } from '@repo/shared/lib/api/client';

export const useAuthToken = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // Establecer el token en el cliente Axios
      setApiToken(session.accessToken);
    } else if (status === 'unauthenticated') {
      // Limpiar el token si no está autenticado
      setApiToken(null);
    }

    // Manejar errores de token
    if (session?.error === 'RefreshAccessTokenError') {
      console.error('Error al refrescar token, redirigiendo al login...');
      // Opcional: forzar logout
      // signOut({ callbackUrl: '/auth/signin' });
    }
  }, [session, status]);

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    token: session?.accessToken,
    user: session?.user,
    error: session?.error,
  };
};
