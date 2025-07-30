// src/components/ui/button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@repo/ui'; // Ajusta la ruta según tu estructura
import { fn } from 'storybook/test';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Botón por defecto
export const Default: Story = {
  args: {
    children: 'Botón por defecto',
  },
};

// Botón primario
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Crear catálogo',
  },
};

// Botón destructivo
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Eliminar catálogo',
  },
};

// Botón outline
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancelar',
  },
};

// Botón secundario
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Editar',
  },
};

// Botón fantasma
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ver detalles',
  },
};

// Botón como link
export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Ir a documentación',
  },
};

// Tamaños
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Botón pequeño',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Botón grande',
  },
};

// Estados
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Botón deshabilitado',
  },
};

// Botones con iconos (si usas lucide-react)
export const WithIcon: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar elemento
      </div>
    ),
  },
};

// Grupo de botones
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">Guardar</Button>
      <Button variant="outline">Cancelar</Button>
      <Button variant="destructive">Eliminar</Button>
    </div>
  ),
};
