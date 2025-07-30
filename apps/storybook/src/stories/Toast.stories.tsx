// src/components/ui/Toast/Toast.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toast } from '@repo/ui';
// Mock function para acciones de Storybook
const mockAction = () => {
  console.log('Toast action triggered');
  // En un entorno real, aquí iría la lógica de la acción
};

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 🍞 Toast Component

Sistema completo de notificaciones toast reutilizable, flexible y altamente configurable.

### Características principales:
- ✅ **4 variantes de estado** (success, danger, warning, info)
- ✅ **Iconos configurables** (con icono, sin icono, iconos personalizados)  
- ✅ **Acciones interactivas** (botones, links externos)
- ✅ **Auto-close** configurable
- ✅ **Dark mode** compatible
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'danger', 'warning', 'info'],
      description: 'Variante visual del toast',
    },
    title: {
      control: 'text',
      description: 'Título principal del toast',
    },
    description: {
      control: 'text',
      description: 'Descripción o mensaje secundario',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Mostrar botón de cerrar',
    },
    autoClose: {
      control: 'boolean',
      description: 'Cierre automático del toast',
    },
    autoCloseDelay: {
      control: { type: 'range', min: 1000, max: 10000, step: 500 },
      description: 'Tiempo de auto-cierre en milisegundos',
    },
    showAccentBorder: {
      control: 'boolean',
      description: 'Mostrar borde lateral de color',
    },
    onClose: { action: 'closed' },
  },
  args: {
    onClose: mockAction,
    isVisible: true, // Para que se vea en Storybook
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 🟢 Historia de éxito
export const Success: Story = {
  args: {
    variant: 'success',
    title: '¡Operación exitosa!',
    description: 'El catálogo ha sido creado correctamente',
    showCloseButton: true,
    autoClose: false, // Desactivar para Storybook
    showAccentBorder: true,
  },
};

// 🔴 Historia de error
export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Error en la operación',
    description: 'No se pudo conectar con el servidor. Inténtalo nuevamente.',
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: true,
  },
};

// 🟡 Historia de advertencia
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Atención requerida',
    description: 'Algunos campos están incompletos. Revisa antes de continuar.',
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: true,
  },
};

// 🔵 Historia informativa
export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Información',
    description: 'Nueva actualización disponible. Recarga la página para verla.',
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: true,
  },
};

// 🎯 Toast con acciones
export const WithActions: Story = {
  args: {
    variant: 'info',
    title: 'Confirmación requerida',
    description: '¿Estás seguro de que quieres eliminar este catálogo?',
    showCloseButton: false,
    autoClose: false,
    showAccentBorder: true,
    actions: [
      {
        label: 'Confirmar',
        onClick: mockAction,
        variant: 'default',
      },
      {
        label: 'Cancelar',
        onClick: mockAction,
        variant: 'outline',
      },
    ],
  },
};

// 📝 Solo título
export const OnlyTitle: Story = {
  args: {
    variant: 'success',
    title: 'Guardado exitosamente',
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: false,
  },
};

// 🚫 Sin icono
export const NoIcon: Story = {
  args: {
    variant: 'info',
    title: 'Mensaje simple',
    description: 'Este toast no tiene icono',
    icon: false,
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: false,
  },
};

// 🎨 Contenido personalizado
export const CustomContent: Story = {
  args: {
    variant: 'success',
    autoClose: false,
    showCloseButton: true,
    children: (
      <div className="space-y-2">
        <h4 className="font-bold text-green-800 dark:text-green-200">🎉 ¡Bienvenido al sistema!</h4>
        <p className="text-sm text-green-700 dark:text-green-300">
          Tu cuenta ha sido configurada exitosamente.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-800 dark:text-green-200">
            Admin
          </span>
          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200">
            Catálogos
          </span>
        </div>
      </div>
    ),
  },
};

// 🌙 Ejemplo en modo oscuro
export const DarkMode: Story = {
  args: {
    variant: 'info',
    title: 'Modo oscuro activado',
    description: 'Perfecto para trabajar en ambientes con poca luz',
    showCloseButton: true,
    autoClose: false,
    showAccentBorder: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="rounded-lg bg-slate-900 p-8">
          <Story />
        </div>
      </div>
    ),
  ],
};
