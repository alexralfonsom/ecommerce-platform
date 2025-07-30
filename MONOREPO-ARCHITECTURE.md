# 🏗️ Arquitectura de Monorepo - Guía para Desarrolladores

## 📋 Índice

- [Principios Fundamentales](#-principios-fundamentales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Reglas de Decisión](#-reglas-de-decisión)
- [Contextos de Resolución](#-contextos-de-resolución)
- [Desafíos de TurboRepo](#-desafíos-de-turborepo)
- [Estrategia de Hot Reload](#-estrategia-de-hot-reload)
- [Stack Tecnológico](#-stack-tecnológico)
- [Mejores Prácticas](#-mejores-prácticas)

---

## 🎯 Principios Fundamentales

### **Jerarquía de Dependencias**
```
apps/super-admin ──→ packages/ui ──→ packages/shared
     ↑ Specific         ↑ Generic       ↑ Utils
```

### **Regla de Oro**
> **Si se reutiliza entre apps → Shared. Si no se reutiliza → App específica.**

### **Contexto de Módulos**
Cada paquete tiene su propio **sandbox de resolución**. Las variables CSS, tipos y dependencias solo están disponibles en su contexto específico.

---

## 📁 Estructura del Proyecto

```
ecommerce-platform/
├── 📱 apps/                           # Aplicaciones frontend
│   ├── super-admin/                   # Dashboard administrativo (puerto 3001)
│   │   ├── app/[lang]/(protected)/    # Rutas protegidas con i18n
│   │   ├── components/                # Componentes específicos de super-admin
│   │   │   ├── layouts/               # Layouts específicos (AdminLayout)
│   │   │   ├── navigation/            # Navegación específica (AdminNavigation)
│   │   │   ├── permissions/           # Guards específicos (SuperAdminGuard)
│   │   │   └── features/              # Solo si NO es reutilizable
│   │   ├── lib/                       # Utilidades específicas de la app
│   │   └── global.css                 # Estilos globales + imports
│   ├── tenant-admin/                  # Dashboard de inquilinos
│   ├── tenant-store/                  # Tienda customer-facing
│   └── storybook/                     # Documentación de componentes
├── 📦 packages/                       # Librerías compartidas
│   ├── ui/                           # Componentes UI + Design System
│   │   ├── src/
│   │   │   ├── components/ui/         # Primitivos (Button, Input, Modal)
│   │   │   ├── components/layout/     # Layouts genéricos (DashboardLayout)
│   │   │   ├── components/auth/       # Componentes de autenticación
│   │   │   ├── configs/               # Design System (⚠️ MIGRADO AQUÍ)
│   │   │   │   └── DesignSystem.ts    # Variables CSS + theme colors
│   │   │   └── styles.css             # Variables CSS de shadcn/ui
│   │   └── dist/                      # Build output
│   ├── shared/                       # Lógica de negocio + utilidades
│   │   ├── src/
│   │   │   ├── features/              # Dominios de negocio reutilizables
│   │   │   │   ├── catalogos/         # Solo si se reutiliza entre apps
│   │   │   │   │   ├── components/    # CatalogoForm, CatalogoList
│   │   │   │   │   ├── hooks/         # useCatalogos, useCatalogosDetalles
│   │   │   │   │   ├── api/           # API calls del dominio
│   │   │   │   │   ├── types/         # TypeScript interfaces
│   │   │   │   │   └── schemas/       # Validaciones Zod
│   │   │   │   ├── usuarios/          # Gestión de usuarios
│   │   │   │   └── productos/         # Gestión de productos
│   │   │   ├── lib/                   # Utilidades compartidas
│   │   │   ├── types/                 # Tipos compartidos
│   │   │   ├── configs/               # Configuraciones (i18n, routes)
│   │   │   └── data/                  # Mocks y datos estáticos
│   │   ├── eslint-config/            # ESLint compartido
│   │   ├── typescript-config/        # Configuraciones TypeScript
│   │   └── tailwind-config/          # ❌ ELIMINADO (migrado a UI)
└── 🛠️ tools/                         # Herramientas de desarrollo
```

---

## ⚖️ Reglas de Decisión

### **🤔 ¿Dónde coloco mi código?**

#### **1. ¿Es reutilizable entre apps?**
```typescript
// ✅ Reutilizable → packages/shared/features/
// Ejemplo: CatalogoForm usado en super-admin Y tenant-admin

// ❌ No reutilizable → apps/app-name/components/
// Ejemplo: SuperAdminDashboard solo usado en super-admin
```

#### **2. ¿Tiene lógica de negocio?**
```typescript
// ✅ Lógica de negocio → packages/shared/
// Ejemplo: useCatalogos (gestiona estado de catálogos)

// ❌ Solo UI → packages/ui/
// Ejemplo: Button (solo apariencia, sin lógica)
```

#### **3. ¿Es específico de una app?**
```typescript
// ✅ App-specific → apps/app-name/
// Ejemplo: AdminLayout (diseño específico de super-admin)

// ❌ Genérico → packages/ui/ o packages/shared/
// Ejemplo: DashboardLayout (layout reutilizable)
```

### **📊 Matriz de Decisión**

| Componente | UI | Shared | App | Razón |
|------------|:--:|:------:|:---:|-------|
| `Button` | ✅ | | | Primitivo sin lógica |
| `DataTable<T>` | ✅ | | | Componente genérico reutilizable |
| `CatalogoForm` | | ✅ | | **Solo si** se usa en múltiples apps |
| `useCatalogos` | | ✅ | | **Solo si** se reutiliza el dominio |
| `AdminLayout` | | | ✅ | Layout específico de super-admin |
| `SuperAdminGuard` | | | ✅ | Permisos específicos de app |
| `AdminNavigation` | | | ✅ | Navegación específica de app |
| `ThemeProvider` | ✅ | | | Sistema de theming genérico |
| `DesignSystem` | ✅ | | | **Migrado** de shared a UI |

---

## 🔍 Contextos de Resolución

### **El Problema del Contexto**

Cada paquete en el monorepo tiene su propio **sandbox de resolución de módulos**:

```typescript
// ❌ PROBLEMA: Cross-context CSS reference
// packages/shared/configs/DesignSystem.ts
export const danger = {
  text: 'text-destructive-foreground' // ← Clase CSS sin variables
}

// packages/ui/src/components/Toast.tsx
import { danger } from '@repo/shared/configs/DesignSystem'
// Las variables CSS están en UI, pero las clases vienen de SHARED
// Resultado: Los estilos no se aplican correctamente
```

### **La Solución: Same-Context Resolution**

```typescript
// ✅ SOLUCIÓN: Same-context reference
// packages/ui/src/configs/DesignSystem.ts (MIGRADO AQUÍ)
export const danger = {
  text: 'text-destructive-foreground' // ← Mismo paquete que las variables
}

// packages/ui/src/components/Toast.tsx
import { danger } from '../configs/DesignSystem' // ← Todo en el mismo contexto
```

### **Por qué funcionó la migración:**

1. **Variables CSS** están en `packages/ui/src/styles.css`
2. **Clases que las referencian** están en `packages/ui/src/configs/DesignSystem.ts`
3. **Componente que las usa** está en `packages/ui/src/components/Toast.tsx`
4. **Todo en el mismo contexto** = Resolución perfecta ✅

---

## ⚠️ Desafíos de TurboRepo

### **1. Dependency Hell**
```json
// ❌ Problema común: Versiones diferentes
{
  "packages/ui": "react@19.1.1",
  "packages/shared": "react@18.2.0",  // ← ¡Conflicto!
  "apps/super-admin": "react@19.1.1"
}
```

**Solución:**
```json
// ✅ Usar peerDependencies consistentes
// packages/ui/package.json
{
  "peerDependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

### **2. Circular Dependencies**
```typescript
// ❌ MALO: Ciclo infinito
// packages/ui/Button.tsx
import { apiClient } from '@repo/shared'

// packages/shared/apiClient.ts  
import { Toast } from '@repo/ui' // ← ¡Ciclo infinito!
```

**Solución:** Respetar la jerarquía `apps → ui → shared`.

### **3. Build Dependencies**
```javascript
// turbo.json - Configuración correcta
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // UI debe buildear antes que apps
      "outputs": ["dist/**"]
    }
  }
}
```

### **4. Type Resolution Issues**
```typescript
// ❌ Los tipos pueden no propagarse
// packages/ui/types.ts
export type Theme = 'light' | 'dark'

// apps/super-admin
import { Theme } from '@repo/ui' // ← Falla si UI no está built
```

**Solución:** Siempre ejecutar `pnpm build --filter=@repo/ui` antes del desarrollo.

---

## ⚡ Estrategia de Hot Reload

### **El Enemigo de la Productividad**

```bash
# 🐌 LENTO: Cambio en packages
packages/ui/Button.tsx → build UI → restart all apps → 30s wait

# ⚡ RÁPIDO: Cambio en apps  
apps/super-admin/page.tsx → hot reload instantáneo → <1s
```

### **Estrategia de Componentes**

#### **✅ Debe ir en `packages/ui/`:**
- **Primitivos:** Button, Input, Card, Modal, Toast
- **Composables genéricos:** DataTable<T>, Form<T>, Layout
- **Design System:** ThemeProvider, DesignSystem, animations

#### **✅ Debe ir en `packages/shared/`:**
- **Dominios reutilizables:** Solo si se usan en múltiples apps
- **Hooks de negocio:** useCatalogos (si es compartido)
- **API clients:** Si se reutilizan entre apps
- **Types y schemas:** Interfaces compartidas

#### **✅ Debe ir en `apps/app-name/`:**
- **Lógica específica:** CatalogoForm (si solo se usa aquí)
- **Componentes de página:** CatalogosPage, DashboardPage
- **Layouts de app:** AdminLayout, TenantLayout
- **Guards específicos:** SuperAdminGuard, TenantGuard

### **Técnica: Factories vs Components**

```typescript
// ✅ Factory pattern para evitar rebuilds
// packages/ui/factories/createCRUDPage.tsx
export function createCRUDPage<T>(config: CRUDConfig<T>) {
  return function CRUDPage(props: CRUDPageProps<T>) {
    // Implementación genérica - cambios aquí rebuildan
  }
}

// apps/super-admin/pages/CatalogosPage.tsx
const CatalogosPage = createCRUDPage({
  entityName: 'catalogos',        // ← Configuración aquí
  api: catalogosApi,              // ← Hot reload rápido
  columns: catalogoColumns,
  permissions: adminPermissions
})
```

---

## 🛠️ Stack Tecnológico

### **Monorepo Management**
- **TurboRepo** `^2.5.5` - Build orchestration y caching
- **PNPM** `^10.13.1` - Package manager con workspaces
- **Node.js** `v22.15.0` - Runtime environment

### **Frontend Framework**
- **Next.js** `15.4.5` - React framework con App Router
- **React** `^19.1.1` - UI library
- **TypeScript** `^5.8.3` - Type safety

### **UI & Styling**
- **Radix UI** - Primitivos accesibles y unstyled
- **Tailwind CSS** `^4.1.11` - Utility-first CSS
- **shadcn/ui** - Design system basado en Radix + Tailwind
- **next-themes** `^0.4.6` - Dark/light mode support

### **State Management**
- **TanStack Query** `^5.83.0` - Server state management
- **React Hook Form** `^7.61.1` - Form state management
- **Zod** `^4.0.13` - Schema validation

### **Authentication**
- **NextAuth.js** `^4.24.11` - Authentication for Next.js
- Soporte dual: Credentials + Azure AD

### **Internationalization**
- **next-intl** `^4.3.4` - Internationalization para Next.js
- Idiomas: Español (default), Inglés

### **Development Tools**
- **ESLint** `^9.32.0` - Code linting
- **Prettier** `^3.6.2` - Code formatting
- **Storybook** `^9.0.18` - Component documentation

---

## 📋 Mejores Prácticas

### **1. Imports y Exports**

```typescript
// ✅ Usar path aliases dentro de packages
// packages/ui/src/components/Toast.tsx
import { DesignSystem } from '@/configs/DesignSystem'

// ✅ Usar workspace imports entre packages
// apps/super-admin/page.tsx
import { Button } from '@repo/ui'
import { useCatalogos } from '@repo/shared/features/catalogos'
```

### **2. Package.json Exports**

```json
// packages/ui/package.json
{
  "exports": {
    ".": "./dist/index.js",
    "./styles.css": "./dist/styles.css",
    "./configs/DesignSystem": "./dist/configs/DesignSystem.js"
  }
}
```

### **3. CSS Variables Strategy**

```css
/* ✅ Variables en el paquete que las define */
/* packages/ui/src/styles.css */
:root {
  --destructive: oklch(0.58 0.22 27.29);
  --destructive-foreground: oklch(1.00 0 0);
}

/* packages/ui/src/configs/DesignSystem.ts */
export const ThemeColors = {
  danger: {
    text: 'text-destructive-foreground' // ← Mismo contexto
  }
}
```

### **4. Generic vs Specific**

```typescript
// ✅ Nivel correcto de abstracción
// packages/ui: Generic DataTable que maneja ANY data
// apps/super-admin: CatalogosTable que configura DataTable para catálogos

// UI: La máquina (genérica)
function DataTable<T>({ columns, data, actions }: Props<T>) {}

// App: La configuración (específica)  
const catalogoColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'estado', label: 'Estado' }
]
```

### **5. Build Strategy**

```bash
# Desarrollo típico
pnpm install                    # Instalar dependencias
pnpm build --filter=@repo/ui   # Build UI primero
pnpm dev                       # Iniciar todas las apps

# Cambios en packages
pnpm build --filter=@repo/ui   # Rebuild UI
# Las apps se reiniciarán automáticamente

# Desarrollo focused
pnpm dev --filter=super-admin  # Solo una app
```

---

## 🚨 Errores Comunes y Soluciones

### **Error: Module not found '@repo/ui/configs/DesignSystem'**
```bash
# Causa: Package no built o export no definido
# Solución:
pnpm build --filter=@repo/ui
# Verificar exports en packages/ui/package.json
```

### **Error: CSS variables not working**
```bash
# Causa: Variables CSS en contexto equivocado
# Solución: Mover DesignSystem.ts al mismo package que styles.css
```

### **Error: Circular dependency detected**
```bash
# Causa: Violación de jerarquía apps → ui → shared
# Solución: Reestructurar imports respetando la jerarquía
```

### **Performance: Hot reload muy lento**
```bash
# Causa: Demasiada lógica específica en packages/
# Solución: Mover lógica específica a apps/, mantener solo genéricos en packages/
```

---

## 🎯 Conclusión

Esta arquitectura está diseñada para:

- ✅ **Máxima reutilización** de código entre aplicaciones
- ✅ **Hot reload rápido** durante el desarrollo
- ✅ **Escalabilidad** para agregar nuevas aplicaciones
- ✅ **Separación clara** entre UI, lógica de negocio y aplicaciones
- ✅ **Type safety** completo con TypeScript
- ✅ **Developer Experience** optimizada

**Recuerda la regla de oro:** *Si se reutiliza entre apps → Shared. Si no se reutiliza → App específica.*

---

*📝 Documento mantenido por el equipo de desarrollo. Última actualización: Enero 2025*