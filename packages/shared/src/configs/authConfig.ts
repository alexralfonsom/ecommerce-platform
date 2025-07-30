// src/configs/authConfig.ts - Nueva configuración centralizada
export type AuthMode = 'credentials' | 'auth0' | 'azureB2C';

interface AuthConfig {
  mode: AuthMode;
  redirectToUniversalLogin: boolean;
  enableCredentials: boolean;
  enableAuth0: boolean;
  enableAzureB2C: boolean;
}

// Función para obtener configuración desde variables de entorno
export function getAuthConfig(): AuthConfig {
  const authMode = (process.env.NEXT_PUBLIC_AUTH_MODE as AuthMode) || 'credentials';

  return {
    mode: authMode,
    redirectToUniversalLogin: authMode === 'auth0',
    enableCredentials:
      authMode === 'credentials' || process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS === 'true',
    enableAuth0: authMode === 'auth0' || process.env.NEXT_PUBLIC_ENABLE_AUTH0 === 'true',
    enableAzureB2C: authMode === 'azureB2C' || process.env.NEXT_PUBLIC_ENABLE_AZURE_B2C === 'true',
  };
}

// Helper para verificar si está habilitado Auth0
export function isAuth0Enabled(): boolean {
  return getAuthConfig().enableAuth0;
}

export function isAzureB2CEnabled(): boolean {
  return getAuthConfig().enableAzureB2C;
}

// Helper para verificar si está habilitado Credentials
export function isCredentialsEnabled(): boolean {
  return getAuthConfig().enableCredentials;
}

// Helper para saber si debe redirigir automáticamente
export function shouldRedirectToUniversalLogin(): boolean {
  return getAuthConfig().redirectToUniversalLogin;
}

// Helper para obtener el modo actual
export function getCurrentAuthMode(): AuthMode {
  return getAuthConfig().mode;
}
