# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo-based e-commerce platform built with a modern frontend-focused architecture. The project uses TurboRepo for build orchestration and PNPM workspaces for dependency management.

## Architecture Overview

### High-Level Structure

```
ecommerce-platform/
├── apps/                    # Frontend applications
│   ├── super-admin/         # Super admin dashboard (port 3001)
│   ├── tenant-admin/        # Tenant admin dashboard
│   ├── tenant-store/        # Customer-facing store
│   └── storybook/          # Component documentation
├── packages/               # Shared libraries
│   ├── ui/                 # UI components (Radix UI + Tailwind)
│   ├── shared/             # Business logic and utilities
│   ├── eslint-config/      # ESLint configuration
│   ├── typescript-config/  # TypeScript configurations
│   └── tailwind-config/    # Tailwind CSS configuration
└── tools/                  # Development tools
```

### Package Manager and Build System

- **Package Manager**: PNPM (enforced via `packageManager` field)
- **Build System**: TurboRepo with workspace filtering
- **Node Version**: Managed via package.json `packageManager` field (pnpm@10.13.1)

## Development Commands

### Root-Level Commands (Monorepo)

```bash
# Install dependencies across all workspaces
pnpm install

# Development (all apps)
pnpm dev

# Build all packages and apps
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Format all files
pnpm format

# Clean all build artifacts and node_modules
pnpm clean
```

### Application-Specific Commands

```bash
# Run specific applications
pnpm dev:admin      # tenant-admin
pnpm dev:store      # tenant-store  
pnpm dev:super      # super-admin

# Build specific applications
pnpm build:admin    # tenant-admin
pnpm build:store    # tenant-store
pnpm build:super    # super-admin

# Lint specific applications
pnpm lint:admin     # tenant-admin
```

### Using Turbo Filters

```bash
# Run dev for specific workspace
turbo dev --filter=super-admin

# Run build for specific workspace  
turbo build --filter=tenant-admin

# Run multiple workspaces
turbo dev --filter=super-admin --filter=tenant-admin
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: NextAuth.js v4
- **Internationalization**: next-intl
- **Forms**: React Hook Form
- **Validation**: Zod
- **TypeScript**: v5.8.3

### Generic CRUD Pattern

The platform implements a sophisticated generic CRUD system through `useGenericCRUD` hook:

```typescript
// Located in: packages/shared/src/lib/hooks/queries/useGenericCRUD.ts
const catalogsOperations = useGenericCRUD({
  entityName: 'maestroCatalogos',
  entityType: 'STANDARD',
  api: maestroCatalogosApi,
  options: {
    enableOptimisticUpdates: true,
    enableRealTimeUpdates: false,
  },
});
```

**Key Features:**
- Optimistic updates for better UX
- Automatic cache invalidation
- Generic pagination support
- Error handling with rollback
- TanStack Query integration

### API Layer Architecture

All API calls follow a consistent pattern:

```typescript
// Located in: packages/shared/src/lib/api/endpoints/
export const entityApi = {
  getAll: (params?) => Promise<{ value: Entity[] }>,
  getPaged: (params?) => Promise<{ value: { items: Entity[], totalCount: number, pageNumber: number, totalPages: number } }>,
  getById: (id) => Promise<{ value: Entity }>,
  create: (data) => Promise<{ value: Entity }>,
  update: (id, data) => Promise<void>,
  delete: (id) => Promise<void>,
};
```

### UI Components (packages/ui)

Built on Radix UI primitives with Tailwind CSS:

- **Base Components**: Button, Input, Card, Dialog, etc.
- **Data Components**: DataTable with sorting, filtering, pagination
- **Form Components**: FormField wrapper with validation
- **Layout Components**: Sidebar, Navigation, Breadcrumbs
- **Authentication**: AuthGuard, LoginForm, SocialLogin

### Shared Library (packages/shared)

Contains reusable business logic:

- **Hooks**: Generic CRUD operations, authentication, mobile detection
- **API Client**: Axios-based client with interceptors
- **Utilities**: Formatting, validation, i18n helpers
- **Types**: Shared TypeScript interfaces
- **Mocks**: Development data for testing

## Development Patterns

### Feature Organization

Each feature follows this structure:
```
packages/shared/src/
├── lib/
│   ├── api/endpoints/          # API layer
│   ├── hooks/queries/          # TanStack Query hooks
│   └── types/                  # TypeScript interfaces
├── data/
│   ├── mocks/                  # Mock data
│   └── dictionaries/           # i18n translations
└── configs/                    # Configuration files
```

### Generic CRUD Usage

1. **Define API endpoints** following the standard interface
2. **Configure useGenericCRUD** with entity-specific settings
3. **Use composed hooks** like `usePagedOperations` for complete functionality
4. **Enable optimistic updates** for better UX

### Authentication Flow

- **NextAuth.js** configuration in shared package
- **Session management** with JWT strategy
- **Protected routes** using AuthGuard component
- **Multi-provider support** (credentials, social login)

## Configuration Management

### TypeScript Configuration

Multiple configurations in `packages/typescript-config/`:
- `base.json` - Base TypeScript settings
- `nextjs.json` - Next.js specific settings
- `react-library.json` - React library settings

### ESLint Configuration

Centralized in `packages/eslint-config/` with Next.js and React rules.

### Tailwind Configuration

Shared configuration in `packages/tailwind-config/` with design system tokens.

## Testing Strategy

### Frontend Testing

- **Component Testing**: Storybook for component documentation
- **Type Checking**: `pnpm type-check` for TypeScript validation
- **Linting**: `pnpm lint` for code quality

### Package-Specific Testing

```bash
# Test UI components
cd packages/ui && pnpm lint && pnpm check-types

# Test shared library
cd packages/shared && pnpm type-check
```

## TurboRepo Configuration

### Build Dependencies

The `turbo.json` configuration defines:
- **Build dependencies**: Apps depend on packages being built first
- **Caching**: Optimized for development and build performance
- **Outputs**: Defined for `.next/**`, `dist/**`, and `storybook-static/**`

### Environment Variables

- `NODE_ENV` - Environment setting
- `NEXT_PUBLIC_*` - Public environment variables for frontend

## Package Development

### Creating New Packages

1. Create package directory in `packages/`
2. Add to `pnpm-workspace.yaml`
3. Configure `package.json` with workspace dependencies
4. Add to relevant TurboRepo tasks

### Workspace Dependencies

Use workspace protocol for internal dependencies:
```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/shared": "workspace:*"
  }
}
```

## Common Development Tasks

### Adding New Features

1. **Define API endpoints** in `packages/shared/src/lib/api/endpoints/`
2. **Create TypeScript types** for request/response interfaces
3. **Implement CRUD hooks** using `useGenericCRUD`
4. **Build UI components** in relevant app using shared UI package
5. **Add i18n translations** in `packages/shared/src/data/dictionaries/`

### Working with Multi-Tenant Architecture

The platform supports multiple tenant types:
- **Super Admin**: Platform-wide administration
- **Tenant Admin**: Tenant-specific administration  
- **Tenant Store**: Customer-facing interface

Each runs on different ports and may have different feature sets.

## Performance Considerations

### TurboRepo Optimization

- **Incremental builds**: Only rebuilds changed packages
- **Parallel execution**: Runs tasks across packages simultaneously
- **Caching**: Aggressive caching for development speed

### Frontend Optimization

- **Code splitting**: Automatic via Next.js App Router
- **Optimistic updates**: Immediate UI feedback
- **Query caching**: TanStack Query for server state
- **Component lazy loading**: Dynamic imports where appropriate

## Important Notes

### Database Integration

The current codebase shows integration with external APIs but no backend implementation is present. The API layer assumes a REST API with standard response formats.

### Internationalization

Full i18n support with Spanish and English translations. All user-facing text should be externalized to dictionary files.

### Authentication

NextAuth.js v4 is configured but requires environment variables for different providers. Check individual app configurations for specific auth setup.

### Development Workflow

1. **Start with monorepo setup**: `pnpm install`
2. **Run specific apps**: Use filtered commands or TurboRepo filters
3. **Develop packages**: Changes automatically picked up via workspace linking
4. **Test thoroughly**: Use type checking and linting before commits
5. **Build for production**: Use `pnpm build` for all packages

This architecture provides a scalable foundation for multi-tenant e-commerce applications with strong type safety, reusable components, and efficient development workflows.