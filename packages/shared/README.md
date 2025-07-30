# @repo/shared - Shared Library

This package contains shared utilities, types, configurations, and business logic used across the ecommerce platform applications.

## Package Architecture

This library implements a **three-tier import system** for optimal developer experience and bundle optimization:

```
@repo/shared/
├── src/
│   ├── index.ts              # Main barrel (ultra-common exports)
│   ├── configs/              # Configuration files
│   │   ├── index.ts          # Config barrel (grouped exports)
│   │   ├── authConfig.ts     # Authentication configuration
│   │   ├── i18n.ts          # Internationalization config
│   │   └── ...
│   ├── lib/                  # Utility libraries
│   │   ├── hooks/           # React hooks
│   │   ├── utils/           # Utility functions
│   │   └── api/             # API clients
│   ├── types/               # TypeScript definitions
│   └── data/                # Mock data and dictionaries
└── dist/                    # Compiled output
```

## Import Strategies

### 1. Ultra-Common Imports (Recommended for frequently used items)

For the most commonly used utilities across the platform:

```typescript
// Main barrel - fastest imports for common utilities
import { cn, formatDate, formatDateTime } from '@repo/shared';
import type { ApiResponse } from '@repo/shared';
```

**Use when:**
- Importing utilities used in 80%+ of components
- Quick prototyping
- Common formatting functions

### 2. Grouped Imports (Recommended for related functionality)

For multiple related items from the same category:

```typescript
// Config barrel - grouped configuration imports
import { 
  Locale, 
  i18n, 
  generalSettings, 
  APP_ROUTES 
} from '@repo/shared/configs/index';

// Hooks barrel - multiple hooks from same category
import { 
  useGenericCRUD, 
  useBreadcrumbs 
} from '@repo/shared/lib/hooks';
```

**Use when:**
- Importing multiple related items
- Setting up configuration in app initialization
- Working with specific feature domains

### 3. Granular Imports (Recommended for optimal tree-shaking)

For specific functionality with maximum bundle optimization:

```typescript
// Direct file imports - best for tree-shaking
import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
import { Locale } from '@repo/shared/configs/i18n';
import { apiClient } from '@repo/shared/lib/api/client';
import type { AuthConfig } from '@repo/shared/types/auth';
```

**Use when:**
- Production builds (better tree-shaking)
- Large applications where bundle size matters
- Importing single specific functions
- Library development

## Available Exports

### Main Package (`@repo/shared`)
```typescript
// Ultra-common utilities
import { cn } from '@repo/shared';
import { formatDate, formatDateTime, capitalize } from '@repo/shared';
import type { ApiResponse } from '@repo/shared';
```

### Configurations (`@repo/shared/configs/*`)
```typescript
// Authentication
import { getCurrentAuthMode, isAuth0Enabled } from '@repo/shared/configs/authConfig';

// Internationalization
import { Locale, i18n } from '@repo/shared/configs/i18n';

// Routes
import { APP_ROUTES } from '@repo/shared/configs/routes';

// General settings
import { generalSettings } from '@repo/shared/configs/generalSettings';

// All configs (barrel)
import { Locale, i18n, APP_ROUTES } from '@repo/shared/configs/index';
```

### Library Functions (`@repo/shared/lib/*`)
```typescript
// Utilities
import { cn } from '@repo/shared/lib/utils/cn';
import { formatDate } from '@repo/shared/lib/utils/format';
import { validateEmail } from '@repo/shared/lib/utils/validation';

// API Client
import { apiClient } from '@repo/shared/lib/api/client';

// Hooks
import { useGenericCRUD } from '@repo/shared/lib/hooks';
import { useMobile } from '@repo/shared/lib/hooks';
import { useBreadcrumbs } from '@repo/shared/lib/hooks';

// Authentication
import { getServerSession } from '@repo/shared/lib/auth/session';
```

### Types (`@repo/shared/types/*`)
```typescript
import type { ApiResponse } from '@repo/shared/types/api';
import type { AuthConfig } from '@repo/shared/types/auth';
import type { BreadcrumbItem } from '@repo/shared/types/BreadcrumbTypes';
import type { NavigationItem } from '@repo/shared/types/navigation';
```

### Data & Mocks (`@repo/shared/data/*`)
```typescript
// Mock data for development
import { MockNavigationItems } from '@repo/shared/data/mocks/MockNavigationItems';
import { MockUserOptions } from '@repo/shared/data/mocks/MockUserOptions';
```

## Best Practices

### ✅ Recommended Patterns

1. **Use granular imports in production components:**
   ```typescript
   import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
   ```

2. **Use grouped imports for feature setup:**
   ```typescript
   import { i18n, Locale, generalSettings } from '@repo/shared/configs/index';
   ```

3. **Use main barrel for common utilities:**
   ```typescript
   import { cn, formatDate } from '@repo/shared';
   ```

4. **Combine strategies as needed:**
   ```typescript
   import { cn } from '@repo/shared';
   import { getCurrentAuthMode } from '@repo/shared/configs/authConfig';
   import type { ApiResponse } from '@repo/shared/types/api';
   ```

### ❌ Avoid These Patterns

1. **Don't use deep imports into dist:**
   ```typescript
   // ❌ Wrong - bypasses package exports
   import { cn } from '@repo/shared/dist/lib/utils/cn';
   ```

2. **Don't import entire package when you need one function:**
   ```typescript
   // ❌ Bad for bundle size
   import * as shared from '@repo/shared';
   const formatted = shared.formatDate(date);
   ```

3. **Don't mix import styles unnecessarily:**
   ```typescript
   // ❌ Inconsistent
   import { cn } from '@repo/shared';
   import { formatDate } from '@repo/shared/lib/utils/format';
   // ✅ Better
   import { cn, formatDate } from '@repo/shared';
   ```

## Development Guidelines

### Adding New Exports

1. **Add to appropriate file** in `src/` directory
2. **Update barrel files** if the export should be grouped
3. **Update main index.ts** only for ultra-common utilities
4. **Run build** to ensure exports are compiled: `pnpm build`

### File Organization

- **configs/**: Application configuration, settings, constants
- **lib/**: Reusable functions, hooks, API clients
- **types/**: TypeScript type definitions and interfaces
- **data/**: Mock data, dictionaries, static content

### TypeScript Integration

The package is fully typed with automatic `.d.ts` generation. All exports include proper type definitions for excellent IDE support.

## Performance Considerations

### Bundle Optimization
- **Granular imports** provide the best tree-shaking
- **Grouped imports** are good for related functionality
- **Main barrel** should only contain truly common utilities

### Development Experience
- Use **grouped imports** during development for convenience
- Switch to **granular imports** for production optimization
- IDE auto-complete works perfectly with all import styles

## Examples by Use Case

### Setting up authentication in an app:
```typescript
import { getCurrentAuthMode, isAuth0Enabled } from '@repo/shared/configs/authConfig';

const authMode = getCurrentAuthMode();
const useAuth0 = isAuth0Enabled();
```

### Building a data table component:
```typescript
import { cn } from '@repo/shared';
import { useGenericCRUD } from '@repo/shared/lib/hooks';
import type { ApiResponse } from '@repo/shared/types/api';
```

### Internationalization setup:
```typescript
import { 
  Locale, 
  i18n, 
  getLTRLocales, 
  getRTLLocales 
} from '@repo/shared/configs/index';
```

### Quick utility usage:
```typescript
import { cn, formatDate, capitalize } from '@repo/shared';
```

## Migration Guide

If you're coming from a traditional barrel-only approach:

1. **Keep existing imports** - they still work
2. **Gradually migrate** to granular imports for better performance
3. **Use grouped imports** when working with multiple related items
4. **Reserve main barrel** for your most common utilities

This three-tier system provides the perfect balance of developer experience, bundle optimization, and maintainability.

## NextAuth Integration for Monorepos

### Problem
NextAuth.js requires global type declarations to extend the default `Session`, `User`, and `JWT` interfaces. In monorepos, these extensions need to be shared across multiple projects while maintaining type safety.

### Solution
This package provides shared NextAuth type extensions that can be easily integrated into any project using NextAuth.

### Setting up NextAuth Types in New Projects

When creating a new project that uses NextAuth.js, follow these steps:

#### 1. Create Global Types File
Create a `types/auth.d.ts` file in your project root:

```typescript
// types/auth.d.ts
// Global type declarations for NextAuth
// This file re-exports the shared auth types to make them globally available

export * from '@repo/shared/types/auth';
```

#### 2. Update TypeScript Configuration
Add the types directory to your `tsconfig.json`:

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
    "types/**/*"  // Add this line
  ]
}
```

#### 3. Use Extended Types
Now you can use the extended session properties throughout your project:

```typescript
import { useSession } from 'next-auth/react';

export function useAuthToken() {
  const { data: session, status } = useSession();
  
  // ✅ session.accessToken is now properly typed
  if (status === 'authenticated' && session?.accessToken) {
    return session.accessToken;
  }
  
  return null;
}
```

### Available Extended Properties

The shared auth types extend NextAuth with the following properties:

#### Session Extensions
```typescript
interface Session {
  accessToken?: string;      // JWT token from your API
  tokenExpires?: number;     // Token expiration timestamp
  id_token?: string;         // OpenID Connect ID token
  client_id?: string;        // OAuth client ID
  error?: string;           // Authentication error
  user: {
    id: string;             // User ID
    role?: string;          // User role
    provider?: string;      // Auth provider used
    sub?: string;           // Auth0 user ID
    picture?: string;       // Auth0 profile picture
    // ... plus all default NextAuth user properties
  }
}
```

#### JWT Extensions
```typescript
interface JWT {
  id?: string;              // User ID
  auth0Id?: string;         // Auth0 user ID
  role?: string;            // User role
  provider?: string;        // Auth provider
  accessToken?: string;     // API access token
  refreshToken?: string;    // Refresh token
  tokenExpires?: number;    // Token expiration
  error?: string;           // Error state
}
```

### Integration Examples

#### Basic Authentication Check
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

#### Protected API Calls
```typescript
import { getSession } from 'next-auth/react';

export async function authenticatedFetch(url: string, options = {}) {
  const session = await getSession();
  
  if (!session?.accessToken) {
    throw new Error('No access token available');
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

#### Server-Side Authentication
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-configs';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // ✅ session.accessToken is properly typed
  if (!session?.accessToken) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  return { props: { session } };
}
```

### Benefits

- **Type Safety**: Full TypeScript support for extended session properties
- **Consistency**: Shared type definitions across all projects
- **Maintainability**: Central location for authentication type updates
- **Scalability**: Easy to add to new projects without duplicating types
- **IDE Support**: Perfect IntelliSense and autocomplete for all auth properties

### Important Notes

1. **Global Scope**: The `types/auth.d.ts` file must be in the TypeScript include path for module declarations to work
2. **Build Order**: Ensure `@repo/shared` is built before projects that depend on it
3. **Consistency**: Always use the shared types rather than duplicating declarations
4. **Updates**: When updating auth types, rebuild the shared package and dependent projects

This approach ensures that all NextAuth integrations across your monorepo remain consistent and type-safe.