// src/hooks/useAuthToken.ts
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { getUniversalBusinessApiClient } from '@repo/shared/lib/api';
import { ExtendedSession } from '@repo/shared/types/auth';

export const useAuthToken = () => {
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession | null;

  useEffect(() => {
    // Manejar errores de token
    if (extendedSession?.error === 'RefreshAccessTokenError') {
      console.error('Error al refrescar token, redirigiendo al login...');
      // Forzar logout cuando el token no se puede refrescar
      signOut({ 
        callbackUrl: '/auth/signin?error=token_refresh_failed',
        redirect: true 
      });
    }
  }, [extendedSession]);

  // Función para validar si las APIs pueden conectarse
  const validateApiConnection = async (): Promise<boolean> => {
    try {
      if (status !== 'authenticated' || !extendedSession?.accessToken) {
        return false;
      }
      
      // Validar que el cliente puede hacer requests
      const isValid = await getUniversalBusinessApiClient().validateCurrentSession();
      return isValid;
    } catch (error) {
      console.error('API validation failed:', error);
      return false;
    }
  };

  return {
    isAuthenticated: status === 'authenticated' && !!extendedSession?.accessToken,
    isLoading: status === 'loading',
    token: extendedSession?.accessToken,
    user: extendedSession?.user,
    error: extendedSession?.error,
    // Nuevas utilidades
    validateApiConnection,
    hasValidToken: !!extendedSession?.accessToken,
    isTokenExpired: extendedSession?.error === 'RefreshAccessTokenError',
  };
};
