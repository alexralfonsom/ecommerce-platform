# @repo/shared - Librería Compartida

Este paquete contiene utilidades compartidas, tipos, configuraciones y lógica de negocio utilizada en todas las aplicaciones de la plataforma de ecommerce.

## Arquitectura del Paquete

Esta librería implementa un **sistema de imports de tres niveles** para una experiencia de desarrollo óptima y optimización de bundles:

```
@repo/shared/
├── src/
│   ├── index.ts              # Barrel principal (exports ultra-comunes)
│   ├── configs/              # Archivos de configuración
│   │   ├── index.ts          # Barrel de configs (exports agrupados)
│   │   ├── authConfig.ts     # Configuración de autenticación
│   │   ├── i18n.ts          # Configuración de internacionalización
│   │   └── ...
│   ├── lib/                  # Librerías de utilidades
│   │   ├── hooks/           # Hooks de React
│   │   ├── utils/           # Funciones de utilidad
│   │   └── api/             # Clientes de API
│   ├── types/               # Definiciones de TypeScript
│   └── data/                # Datos mock y diccionarios
└── dist/                    # Salida compilada
```

## Estrategias de Importación

### 1. Imports Ultra-Comunes (Recomendado para elementos frecuentemente usados)

Para las utilidades más comúnmente usadas en toda la plataforma:

```typescript
// Barrel principal - imports más rápidos para utilidades comunes
import { cn, formatDate, formatDateTime } from '@repo/shared';
import type { ApiResponse } from '@repo/shared';
```

**Usar cuando:**
- Importas utilidades usadas en el 80%+ de los componentes
- Prototipado rápido
- Funciones de formateo comunes

### 2. Imports Agrupados (Recomendado para funcionalidad relacionada)

Para múltiples elementos relacionados de la misma categoría:

```typescript
// Barrel de configs - imports de configuración agrupados
import { 
  Locale, 
  i18n, 
  generalSettings, 
  APP_ROUTES 
} from '@repo/shared/configs/index';

// Barrel de hooks - múltiples hooks de la misma categoría
import { 
  useGenericCRUD, 
  useBreadcrumbs 
} from '@repo/shared/lib/hooks';
```

**Usar cuando:**
- Importas múltiples elementos relacionados
- Configurando la aplicación en la inicialización
- Trabajando con dominios de características específicas

### 3. Imports Granulares (Recomendado para tree-shaking óptimo)

Para funcionalidad específica con máxima optimización de bundle:

```typescript
// Imports directos de archivo - mejor para tree-shaking
import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
import { Locale } from '@repo/shared/configs/i18n';
import { useGenericCRUD } from '@repo/shared/lib/hooks';
import { apiClient } from '@repo/shared/lib/api/client';
import type { AuthConfig } from '@repo/shared/types/auth';
```

**Usar cuando:**
- Builds de producción (mejor tree-shaking)
- Aplicaciones grandes donde el tamaño del bundle importa
- Importando funciones específicas individuales
- Desarrollo de librerías

## Exports Disponibles

### Paquete Principal (`@repo/shared`)
```typescript
// Utilidades ultra-comunes
import { cn } from '@repo/shared';
import { formatDate, formatDateTime, capitalize } from '@repo/shared';
import type { ApiResponse } from '@repo/shared';
```

### Configuraciones (`@repo/shared/configs/*`)
```typescript
// Autenticación
import { getCurrentAuthMode, isAuth0Enabled } from '@repo/shared/configs/authConfig';

// Internacionalización
import { Locale, i18n } from '@repo/shared/configs/i18n';

// Rutas
import { APP_ROUTES } from '@repo/shared/configs/routes';

// Configuraciones generales
import { generalSettings } from '@repo/shared/configs/generalSettings';

// Todas las configs (barrel)
import { Locale, i18n, APP_ROUTES } from '@repo/shared/configs/index';
```

### Funciones de Librería (`@repo/shared/lib/*`)
```typescript
// Utilidades
import { cn } from '@repo/shared/lib/utils/cn';
import { formatDate } from '@repo/shared/lib/utils/format';
import { validateEmail } from '@repo/shared/lib/utils/validation';

// Cliente API
import { apiClient } from '@repo/shared/lib/api/client';

// Hooks
import { useGenericCRUD } from '@repo/shared/lib/hooks';
import { useMobile } from '@repo/shared/lib/hooks';
import { useBreadcrumbs } from '@repo/shared/lib/hooks';

// Autenticación
import { getServerSession } from '@repo/shared/lib/auth/session';
```

### Tipos (`@repo/shared/types/*`)
```typescript
import type { ApiResponse } from '@repo/shared/types/api';
import type { AuthConfig } from '@repo/shared/types/auth';
import type { BreadcrumbItem } from '@repo/shared/types/BreadcrumbTypes';
import type { NavigationItem } from '@repo/shared/types/navigation';
```

### Datos y Mocks (`@repo/shared/data/*`)
```typescript
// Datos mock para desarrollo
import { MockNavigationItems } from '@repo/shared/data/mocks/MockNavigationItems';
import { MockUserOptions } from '@repo/shared/data/mocks/MockUserOptions';
```

## Mejores Prácticas

### ✅ Patrones Recomendados

1. **Usa imports granulares en componentes de producción:**
   ```typescript
   import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
   ```

2. **Usa imports agrupados para configuración de características:**
   ```typescript
   import { i18n, Locale, generalSettings } from '@repo/shared/configs/index';
   ```

3. **Usa el barrel principal para utilidades comunes:**
   ```typescript
   import { cn, formatDate } from '@repo/shared';
   ```

4. **Combina estrategias según sea necesario:**
   ```typescript
   import { cn } from '@repo/shared';
   import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
   import type { ApiResponse } from '@repo/shared/types/api';
   ```

### ❌ Evita Estos Patrones

1. **No uses imports profundos en dist:**
   ```typescript
   // ❌ Incorrecto - evita los exports del paquete
   import { cn } from '@repo/shared/dist/lib/utils/cn';
   ```

2. **No importes todo el paquete cuando necesitas una función:**
   ```typescript
   // ❌ Malo para el tamaño del bundle
   import * as shared from '@repo/shared';
   const formatted = shared.formatDate(date);
   ```

3. **No mezcles estilos de import innecesariamente:**
   ```typescript
   // ❌ Inconsistente
   import { cn } from '@repo/shared';
   import { formatDate } from '@repo/shared/lib/utils/format';
   // ✅ Mejor
   import { cn, formatDate } from '@repo/shared';
   ```

## Guías de Desarrollo

### Agregando Nuevos Exports

1. **Agregar al archivo apropiado** en el directorio `src/`
2. **Actualizar archivos barrel** si el export debe ser agrupado
3. **Actualizar main index.ts** solo para utilidades ultra-comunes
4. **Ejecutar build** para asegurar que los exports se compilen: `pnpm build`

### Organización de Archivos

- **configs/**: Configuración de aplicación, settings, constantes
- **lib/**: Funciones reutilizables, hooks, clientes API
- **types/**: Definiciones de tipos e interfaces de TypeScript
- **data/**: Datos mock, diccionarios, contenido estático

### Integración con TypeScript

El paquete está completamente tipado con generación automática de `.d.ts`. Todos los exports incluyen definiciones de tipos apropiadas para excelente soporte de IDE.

## Consideraciones de Performance

### Optimización de Bundle
- **Imports granulares** proporcionan el mejor tree-shaking
- **Imports agrupados** son buenos para funcionalidad relacionada
- **Barrel principal** debe contener solo utilidades verdaderamente comunes

### Experiencia de Desarrollo
- Usa **imports agrupados** durante el desarrollo por conveniencia
- Cambia a **imports granulares** para optimización de producción
- El auto-complete de IDE funciona perfectamente con todos los estilos de import

## Ejemplos por Caso de Uso

### Configurando autenticación en una app:
```typescript
import { getCurrentAuthMode, isAuth0Enabled } from '@repo/shared/configs/authConfig';

const authMode = getCurrentAuthMode();
const useAuth0 = isAuth0Enabled();
```

### Construyendo un componente de tabla de datos:
```typescript
import { cn } from '@repo/shared';
import { useGenericCRUD } from '@repo/shared/lib/hooks';
import type { ApiResponse } from '@repo/shared/types/api';
```

### Configuración de internacionalización:
```typescript
import { 
  Locale, 
  i18n, 
  getLTRLocales, 
  getRTLLocales 
} from '@repo/shared/configs/index';
```

### Uso rápido de utilidades:
```typescript
import { cn, formatDate, capitalize } from '@repo/shared';
```

## Guía de Migración

Si vienes de un enfoque tradicional de solo-barrel:

1. **Mantén los imports existentes** - aún funcionan
2. **Migra gradualmente** a imports granulares para mejor performance
3. **Usa imports agrupados** cuando trabajas con múltiples elementos relacionados
4. **Reserva el barrel principal** para tus utilidades más comunes

Este sistema de tres niveles proporciona el equilibrio perfecto entre experiencia de desarrollador, optimización de bundle y mantenibilidad.

## Integración de NextAuth para Monorepos

### Problema
NextAuth.js requiere declaraciones de tipos globales para extender las interfaces por defecto de `Session`, `User` y `JWT`. En monorepos, estas extensiones necesitan ser compartidas entre múltiples proyectos manteniendo la seguridad de tipos.

### Solución
Este paquete proporciona extensiones de tipos compartidas de NextAuth que pueden ser fácilmente integradas en cualquier proyecto que use NextAuth.

### Configuración de Tipos de NextAuth en Nuevos Proyectos

Al crear un nuevo proyecto que use NextAuth.js, sigue estos pasos:

#### 1. Crear Archivo de Tipos Global
Crea un archivo `types/auth.d.ts` en la raíz de tu proyecto:

```typescript
// types/auth.d.ts
// Declaraciones de tipos globales para NextAuth
// Este archivo re-exporta los tipos compartidos para hacerlos disponibles globalmente

export * from '@repo/shared/types/auth';
```

#### 2. Actualizar Configuración de TypeScript
Agrega el directorio types a tu `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-configs/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*",
    "types/**/*"  // Agrega esta línea
  ]
}
```

#### 3. Usar Tipos Extendidos
Ahora puedes usar las propiedades extendidas de sesión en todo tu proyecto:

```typescript
import { useSession } from 'next-auth/react';

export function useAuthToken() {
  const { data: session, status } = useSession();
  
  // ✅ session.accessToken está ahora correctamente tipado
  if (status === 'authenticated' && session?.accessToken) {
    return session.accessToken;
  }
  
  return null;
}
```

### Propiedades Extendidas Disponibles

Los tipos compartidos de autenticación extienden NextAuth con las siguientes propiedades:

#### Extensiones de Session
```typescript
interface Session {
  accessToken?: string;      // Token JWT de tu API
  tokenExpires?: number;     // Timestamp de expiración del token
  id_token?: string;         // Token ID de OpenID Connect
  client_id?: string;        // ID del cliente OAuth
  error?: string;           // Error de autenticación
  user: {
    id: string;             // ID del usuario
    role?: string;          // Rol del usuario
    provider?: string;      // Proveedor de auth usado
    sub?: string;           // ID de usuario Auth0
    picture?: string;       // Foto de perfil Auth0
    // ... más todas las propiedades por defecto de NextAuth
  }
}
```

#### Extensiones de JWT
```typescript
interface JWT {
  id?: string;              // ID del usuario
  auth0Id?: string;         // ID de usuario Auth0
  role?: string;            // Rol del usuario
  provider?: string;        // Proveedor de auth
  accessToken?: string;     // Token de acceso a API
  refreshToken?: string;    // Token de refresco
  tokenExpires?: number;    // Expiración del token
  error?: string;           // Estado de error
}
```

### Ejemplos de Integración

#### Verificación Básica de Autenticación
```typescript
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    accessToken: session?.accessToken,
    userRole: session?.user?.role,
    isLoading: status === 'loading'
  };
}
```

#### Llamadas API Protegidas
```typescript
import { getSession } from 'next-auth/react';

export async function authenticatedFetch(url: string, options = {}) {
  const session = await getSession();
  
  if (!session?.accessToken) {
    throw new Error('No hay token de acceso disponible');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.accessToken}`
    }
  });
}
```

#### Autenticación del Lado del Servidor
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-configs';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // ✅ session.accessToken está correctamente tipado
  if (!session?.accessToken) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  return { props: { session } };
}
```

### Beneficios

- **Seguridad de Tipos**: Soporte completo de TypeScript para propiedades extendidas de sesión
- **Consistencia**: Definiciones de tipos compartidas en todos los proyectos
- **Mantenibilidad**: Ubicación central para actualizaciones de tipos de autenticación
- **Escalabilidad**: Fácil de agregar a nuevos proyectos sin duplicar tipos
- **Soporte de IDE**: IntelliSense y autocompletado perfecto para todas las propiedades de auth

### Notas Importantes

1. **Alcance Global**: El archivo `types/auth.d.ts` debe estar en el path de include de TypeScript para que las declaraciones de módulo funcionen
2. **Orden de Build**: Asegúrate de que `@repo/shared` esté compilado antes que los proyectos que dependen de él
3. **Consistencia**: Siempre usa los tipos compartidos en lugar de duplicar declaraciones
4. **Actualizaciones**: Al actualizar tipos de auth, recompila el paquete shared y los proyectos dependientes

Este enfoque asegura que todas las integraciones de NextAuth en tu monorepo permanezcan consistentes y con tipos seguros.

## Comandos Útiles

```bash
# Construir el paquete
pnpm build

# Desarrollar con watch mode
pnpm dev

# Verificar tipos
pnpm type-check

# Limpiar build
pnpm clean
```

## Soporte y Contribuciones

Para agregar nuevas funcionalidades o reportar problemas:

1. Seguir la estructura de carpetas establecida
2. Actualizar los barrels apropiados
3. Agregar tests si es necesario
4. Documentar nuevos exports en este README

Este enfoque asegura que el paquete shared sea escalable, mantenible y eficiente para todo el equipo de desarrollo.