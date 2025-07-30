import { DefaultSession } from 'next-auth';

// Tipos base del sistema
export interface BaseUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string;
}

// Tipos específicos de autenticación
export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  tokenExpires?: number;
}

//  Tipos de proveedores
export interface ProviderInfo {
  provider?: string;
  sub?: string; // Auth0/OAuth provider ID
  picture?: string; // Provider picture URL
}

// 👤 Usuario extendido completo
export interface ExtendedUser extends BaseUser, AuthTokens, ProviderInfo {
  role?: string;

  // Campos específicos de API .NET Core
  tenantId?: string;
  organizationId?: string;
  permissions?: string[];
}

export interface ExtendedSession {
  user: ExtendedUser & DefaultSession['user'];
  // tokens y campos adicionales
  accessToken?: string; // Disponible en la sesión
  tokenExpires?: number;
  id_token?: string; // idToken
  client_id?: string; // Client ID
  error?: string;
}

export interface ExtendedJWT extends AuthTokens {
  id?: string;
  auth0Id?: string;
  role?: string;
  provider?: string;
  // Campos específicos de API .NET Core
  tenantId?: string;
  organizationId?: string;
  permissions?: string[];
  error?: string;
}

// Note: Global module declarations are now handled in the consuming package's .d.ts files
// to avoid conflicts and ensure proper type resolution in monorepo setup

// Tipos para la respuesta de tu API .NET Core
export interface ApiAuthResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId?: string;
    organizationId?: string;
    permissions?: string[];
  };
}

// Tipos para credenciales de login
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  email: string;
  confirmPassword: string;
}

// 🎭 Tipos para diferentes roles de usuario
export interface AdminUser extends ExtendedUser {
  adminLevel: number;
  canManageTenants: boolean;
}

export interface TenantUser extends ExtendedUser {
  tenantId: string;
  tenantName: string;
  tenantRole: string;
}