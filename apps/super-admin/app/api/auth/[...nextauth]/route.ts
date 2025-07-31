// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Auth0Provider from 'next-auth/providers/auth0';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';
import { i18n } from '@repo/shared/configs/i18n';
import { generalSettings } from '@repo/shared/configs/generalSettings';
import { isAuth0Enabled, isAzureB2CEnabled, isCredentialsEnabled } from '@repo/shared/configs/authConfig';
import { ExtendedUser } from '@repo/shared/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getProviders() {
  const providers = [];

  // Añadir Credentials provider si está habilitado
  if (isCredentialsEnabled()) {
    providers.push(
      CredentialsProvider({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          // Tu lógica existente de validación
          if (credentials?.username === 'admin' && credentials?.password === 'admin') {
            return {
              id: '1',
              name: 'Admin',
              email: 'admin@example.com',
              role: 'admin',
              provider: 'credentials',
            };
          }

          // Aquí puedes añadir validación con tu API
          try {
            const response = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            });

            if (response.ok) {
              const user = await response.json();
              return {
                ...user,
                provider: 'credentials',
              };
            }
          } catch (error) {
            console.error('Error durante la autenticación:', error);
          }

          return null;
        },
      }),
    );
  }

  // Añadir Auth0 provider si está habilitado
  if (isAuth0Enabled() && process.env.AUTH0_CLIENT_ID) {
    providers.push(
      Auth0Provider({
        clientId: process.env.AUTH0_CLIENT_ID!,
        clientSecret: process.env.AUTH0_CLIENT_SECRET!,
        issuer: process.env.AUTH0_ISSUER_BASE_URL!,
        authorization: {
          params: {
            audience: process.env.AUTH0_AUDIENCE,
            scope: 'openid profile email',
          },
        },
      }),
    );
  }

  if (isAzureB2CEnabled() && process.env.AZURE_AD_CLIENT_ID) {
    providers.push(
      AzureADB2CProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID || '',
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
        tenantId: process.env.AZURE_AD_TENANT_ID || undefined,
        primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
        authorization: { params: { scope: 'offline_access openid' } },
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: getProviders(),
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.access_token) {
          token.accessToken = account.access_token;
          token.expiresAt = (account.expires_at as number) * 1000; // Convertir a milisegundos
          token.refreshToken = account.refresh_token;
        } else {
          // Para credentials provider, generar token temporal
          token.accessToken = `temp_token_${user.id}_${Date.now()}`;
          token.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días
        }

        token.nickname = account.nickname || user.name || user.email;
        token.id = user.id || user.sub || 'unknown';
        token.provider = account.provider;

        // Guardar id_token y client_id para Auth0 logout
        if (account.provider === 'auth0') {
          token.id_token = account.id_token;
          token.client_id = process.env.AUTH0_CLIENT_ID;
        }

        console.log(token.accessToken);
        console.log(
          `Token created - Expires at: ${new Date(token.expiresAt as number).toISOString()}`,
        );
        console.log(`Current time: ${new Date().toISOString()}`);
        console.log(
          `Time until expiry: ${((token.expiresAt as number) - Date.now()) / 1000 / 60} minutes`,
        );

        // if (account?.id_token) {
        //   const decoded = jwtDecode(account.id_token);
        //   token.roles = decoded['https://your-app.com/roles'] || [];
        // }

        // Si viene de Auth0, sincronizar con tu API
        if (account.provider === 'auth0') {
          //  await syncAuth0User(user, account);
        }
        // Sincronizar usuario con tu base de datos .NET Core
        // const syncResult = await syncUserWithDotNetAPI({
        //   auth0Id: user.id!,
        //   email: user.email!,
        //   name: user.name!,
        //   picture: user.image,
        //   provider: account.provider,
        //   organizationId: profile?.org_id,
        //   roles: profile?.['https://yourapp.com/roles'] || ['user'],
        //   accessToken: account.access_token!,
        // });

        // Añadir ID interno de tu sistema
        // token.internalUserId = syncResult?.internalUserId;
        // token.isNewUser = syncResult?.isNewUser;
      }

      // Verificar si el token necesita renovación (token.expiresAt ya está en milisegundos)
      if (Date.now() >= (token.expiresAt as number)) {
        console.log('Token expired, refreshing...');
        const refreshedToken = await refreshAuth0Token(token);

        // Si la renovación falló, retornar token con error para forzar re-login
        if (refreshedToken.error) {
          console.error('Token refresh failed, user will need to re-authenticate');
          return refreshedToken;
        }

        console.log('Token refreshed successfully');
        return refreshedToken;
      }

      // Token aún válido, no necesita renovación
      return token;
    },
    async session({ session, token }) {
      const user = session.user as ExtendedUser;
      if (token && user) {
        user.id = token.id || user.id || '';
        user.role = token.role;
        user.provider = token.provider;
        session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
        session.id_token = typeof token.id_token === 'string' ? token.id_token : undefined;
        session.client_id = typeof token.client_id === 'string' ? token.client_id : undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Manejar redirecciones con internacionalización
      if (url.startsWith('/')) {
        if (url.match(/^\/[a-z]{2}\//)) {
          return `${baseUrl}${url}`;
        }
        return `${baseUrl}/${i18n.defaultLocale}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/${i18n.defaultLocale}/dashboard`;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`🔐 User signed in: ${user.email} (New: ${isNewUser})`);
      console.log(user, account, profile);

      // Aquí puedes añadir lógica adicional para nuevos usuarios
      if (isNewUser) {
        console.log('🎉 Welcome new user!');
        // Enviar email de bienvenida, crear datos iniciales, etc.
      }
    },

    async signOut({ session }) {
      console.log(`👋 User signed out...`);
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: generalSettings.cookies.sessionMaxAge, // 7 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Función para sincronizar usuario con tu API .NET Core
async function syncUserWithDotNetAPI({
  auth0Id,
  email,
  name,
  picture,
  provider,
  organizationId,
  roles,
  accessToken,
}: {
  auth0Id: string;
  email: string;
  name: string;
  picture?: string | null;
  provider: string;
  organizationId?: string | null;
  roles: string[];
  accessToken: string;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth0Id,
        email,
        name,
        picture,
        provider,
        organizationId,
        roles,
        lastLogin: new Date().toISOString(),
        metadata: {
          locale: 'es', // Default locale
          timezone: 'America/Bogota',
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        internalUserId: result.userId,
        isNewUser: result.isNewUser,
        organizationId: result.organizationId,
      };
    }

    console.error('Error syncing user with .NET API:', response.statusText);
    return null;
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

// NUEVA función para sincronizar usuarios Auth0
// async function syncAuth0User(user: any, account: any) {
//   try {
//     await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync-auth0-user`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         auth0Id: user.id,
//         email: user.email,
//         name: user.name,
//         provider: account.provider,
//         accessToken: account.access_token,
//       }),
//     });
//   } catch (error) {
//     console.error('Error syncing Auth0 user:', error);
//   }
// }

// Función para renovar token de Auth0
async function refreshAuth0Token(token: any) {
  try {
    if (!token.refreshToken) {
      console.error('No refresh token available');
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

    console.log('Attempting to refresh Auth0 token...');

    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token', // Corregido: era 'authorization_code'
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        refresh_token: token.refreshToken,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      throw tokens;
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000, // Mantener en milisegundos
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing Auth0 token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Función para autenticar con tu API .NET Core
/*async function authenticateWithApi(credentials: LoginCredentials): Promise<ApiAuthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Asumiendo que tu API devuelve algo como:
    // { token: "...", refreshToken: "...", expiresAt: "...", user: {...} }
    return data;
  } catch (error) {
    console.error('Error autenticando con API:', error);
    return null;
  }
}

// Función para refrescar el token
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}*/
