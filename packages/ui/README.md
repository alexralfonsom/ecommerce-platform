# @repo/ui - Paquete de Componentes UI

Este paquete contiene todos los componentes de UI reutilizables para el proyecto e-commerce-platform.

## Configuración y Estructura

### Configuración del Package.json

El paquete está configurado para ser consumido por otros workspaces con la siguiente configuración:

```json
{
  "name": "@repo/ui",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./styles.css": "./dist/styles-ui.css"
  }
}
```

### Scripts de Build

- `build:components`: Ejecuta TypeScript compiler (tsc) + post-procesamiento automático
- `build:styles`: Genera CSS desde Tailwind
- `build`: Ejecuta build:styles + build:components (proceso completo)
- `type-check`: Verificación de tipos sin generar archivos
- `lint`: Linting con ESLint

**Proceso automatizado**: El script `build:components` ahora incluye:
1. Compilación TypeScript (`tsc`)
2. Copia automática de archivos principales (`index.js`, `index.d.ts`)
3. Corrección automática de paths via `scripts/post-build.js`

**🌐 Multiplataforma**: El script `post-build.js` usa Node.js puro, funciona en:
- ✅ Windows (PowerShell, CMD, Git Bash)
- ✅ macOS (Terminal, Zsh, Bash)  
- ✅ Linux (Bash, Zsh)

## Estructura de Archivos

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── layout/         # Componentes de layout
│   │   ├── providers/      # Providers (Query, Session, Theme)
│   │   └── ui/             # Componentes base de UI
│   ├── index.ts           # Punto de entrada principal
│   └── styles.css         # Estilos base
├── dist/                  # Archivos compilados
│   ├── index.js          # Bundle JavaScript principal
│   ├── index.d.ts        # Definiciones de tipos principales
│   └── ui/src/           # Archivos compilados con estructura original
└── package.json
```

## Cómo Agregar Nuevos Componentes

### 1. Crear el Componente

Crea tu componente en la carpeta apropiada dentro de `src/components/`:

```typescript
// src/components/ui/MiNuevoComponente/MiNuevoComponente.tsx
import React from 'react';

export interface MiNuevoComponenteProps {
  mensaje: string;
  variant?: 'primary' | 'secondary';
}

export const MiNuevoComponente: React.FC<MiNuevoComponenteProps> = ({
  mensaje,
  variant = 'primary'
}) => {
  return (
    <div className={`componente ${variant}`}>
      {mensaje}
    </div>
  );
};

export default MiNuevoComponente;
```

### 2. Crear el archivo index.ts del módulo (si es necesario)

```typescript
// src/components/ui/MiNuevoComponente/index.ts
export { default as MiNuevoComponente } from './MiNuevoComponente';
export type { MiNuevoComponenteProps } from './MiNuevoComponente';
```

### 3. Exportar desde el index.ts principal

Agrega la exportación en `src/index.ts`:

```typescript
// Para componentes individuales
export { MiNuevoComponente, type MiNuevoComponenteProps } from './components/ui/MiNuevoComponente';

// Para módulos completos (recomendado)
export * from './components/ui/MiNuevoComponente';
```

### 4. Compilar el Paquete

```bash
cd packages/ui
pnpm build:components
```

**¡Importante!** Ya no necesitas ejecutar comandos `cp` manuales. El proceso de build es completamente automatizado y incluye:
- ✅ Compilación TypeScript
- ✅ Copia automática de archivos principales
- ✅ Corrección automática de paths

### 5. Verificar la Compilación

Después de compilar, puedes verificar que todo esté correcto:

```bash
# Verificar que los archivos principales existan
ls -la dist/index.*

# Verificar que el componente se pueda importar
grep "ToastProvider" dist/index.d.ts
```

## Configuración TypeScript

El archivo `tsconfig.json` está configurado para:

```json
{
  "extends": "@repo/typescript-configs/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true
  }
}
```

## Uso en Aplicaciones

### Importación Básica

```typescript
import { ToastProvider, Button, Card } from '@repo/ui';
```

### Importación de Estilos

```typescript
import '@repo/ui/styles.css';
```

## Componentes Disponibles

### Autenticación
- `AuthGuard`
- `LoginForm`
- `CreateAccount`
- `LogoutSpinner`
- `LogoutEnded`
- `SocialLogin`
- `UniversalLoginRedirect`

### Layout
- `DashboardLayout`
- `AdminSidebar`
- `BreadcrumbControl`
- `HeaderActionsGroup`
- `Logo`
- `ModeToggleLightDark`
- `LanguageSwitcher`

### Providers
- `QueryProvider`
- `SessionWrapper`
- `ThemeProvider`
- `ToastProvider`

### UI Base (Radix UI + shadcn/ui)
- `Button`, `Card`, `Dialog`, `Input`
- `DataTable` (con paginación, filtros, etc.)
- `Toast` y `ToastProvider`
- `Form`, `Select`, `Checkbox`
- Y muchos más...

## Resolución de Problemas

### Error: "Cannot find module @repo/ui"

1. **Verificar que el paquete esté compilado**:
   ```bash
   cd packages/ui && pnpm build:components
   ```

2. **Verificar que los archivos principales existan**:
   ```bash
   ls -la packages/ui/dist/index.*
   ```

3. **Verificar la configuración de exports en package.json**:
   - Debe apuntar a `./dist/index.js` y `./dist/index.d.ts`

### Error: "Module has no exported member"

1. **Verificar que el componente esté exportado en src/index.ts**
2. **Recompilar el paquete**
3. **Verificar que los paths en dist/index.d.ts sean correctos**

### Paths Incorrectos en Archivos Compilados

Si los paths no apuntan correctamente a `./ui/src/components/...`, necesitas:

1. **Ajustar manualmente los paths en dist/index.d.ts**:
   ```bash
   sed -i '' 's|from "./components/|from "./ui/src/components/|g' dist/index.d.ts
   sed -i '' 's|from "./components/|from "./ui/src/components/|g' dist/index.js
   ```

## Mejores Prácticas

1. **Siempre exporta tipos junto con componentes**
2. **Usa exports named en lugar de default cuando sea posible**
3. **Mantén la estructura de carpetas organizada por función**
4. **Compila siempre después de hacer cambios**
5. **Verifica que los imports funcionen en las aplicaciones que consumen el paquete**

## Scripts de Desarrollo

Para desarrollo activo, puedes usar:

```bash
# Watch mode para TypeScript
pnpm dev:components

# Watch mode para estilos
pnpm dev:styles
```

Este setup permite que las aplicaciones consumidoras vean los cambios inmediatamente gracias al workspace linking de PNPM.