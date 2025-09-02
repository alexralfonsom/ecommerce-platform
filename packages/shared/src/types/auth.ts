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
  idToken?: string;
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
  permissions?: string[];

  // Nuevos campos requeridos para APIM
  userId?: string; // ID del usuario (puede ser diferente del id)
  platform_role?: string; // Rol de plataforma desde Auth0

  // Roles de aplicación NO van en sesión (se cargan on-demand)
  // appRoles?: string[];
  // appPermissions?: string[];

  // organizationId removido por ahora (no se usa)

  // Campos para auditoría
  internalUserId?: string;
  fullName?: string;
  department?: string;
  position?: string;
}

export interface ExtendedSession {
  user: ExtendedUser & DefaultSession['user'];
  // tokens y campos adicionales
  accessToken?: string; // Disponible en la sesión
  tokenExpires?: number;
  error?: string;

  // Auth0 logout data en cookie separada
  auth0Logout?: {
    id_token: string;
    client_id: string;
  };
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

  // Nuevos campos requeridos para APIM
  userId?: string; // ID del usuario para envío al API
  platform_role?: string; // Rol de plataforma desde Auth0
  email?: string; // Email para envío al API

  // Roles y permisos de aplicación (dinámicos)
  appRoles?: string[];
  appPermissions?: string[];

  error?: string;

  // Campos adicionales para auditoría
  internalUserId?: string;
  fullName?: string;
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
