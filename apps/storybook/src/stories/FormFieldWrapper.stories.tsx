import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { Form, FormFieldWrapper, Input, Textarea, Button, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import React from 'react';

const meta: Meta<typeof FormFieldWrapper> = {
  title: 'UI/FormFieldWrapper',
  component: FormFieldWrapper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## FormFieldWrapper - Componente unificado para formularios

Wrapper completo para React Hook Form que proporciona:

- ✅ **Integración nativa** con React Hook Form
- ✅ **Type-safe** con TypeScript generics
- ✅ **Errores automáticos** del form state
- ✅ **Required automático** basado en schema Zod
- ✅ **Cualquier control HTML5** - Input, Textarea, Select, Checkbox, etc.
- ✅ **Help text inteligente** que se oculta cuando hay errores
- ✅ **Label suffix** para elementos adicionales
- ✅ **Accesibilidad completa** heredada de shadcn/ui

### Patrón único para toda la aplicación:
\`\`\`tsx
<FormFieldWrapper
  name="fieldName"
  control={control}
  label="Field Label" 
  render={({ field }) => <Input {...field} />}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormFieldWrapper>;

// ================================
// COMPONENTE WRAPPER PARA STORIES
// ================================

function StoryWrapper({ 
  children, 
  schema 
}: { 
  children: (form: any) => React.ReactNode; 
  schema: any;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  return (
    <div className="mx-auto max-w-md">
      <Form {...form}>
        <form className="space-y-4">
          {children(form)}
        </form>
      </Form>
    </div>
  );
}

// ================================
// STORIES - CASOS DE USO
// ================================

export const BasicInput: Story = {
  render: () => {
    const schema = z.object({
      name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="name"
            control={form.control}
            label="Nombre completo"
            render={({ field }) => (
              <Input {...field} placeholder="Juan Pérez" />
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const schema = z.object({
      email: z.string().email('Email inválido'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="email"
            control={form.control}
            label="Correo electrónico"
            description="Usaremos este email para contactarte"
            render={({ field }) => (
              <Input {...field} type="email" placeholder="juan@ejemplo.com" />
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const WithHelpText: Story = {
  render: () => {
    const schema = z.object({
      password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="password"
            control={form.control}
            label="Contraseña"
            helpText="Mínimo 8 caracteres, incluye números y símbolos"
            render={({ field }) => (
              <Input {...field} type="password" placeholder="********" />
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const WithLabelSuffix: Story = {
  render: () => {
    const schema = z.object({
      password: z.string().min(1, 'Contraseña requerida'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="password"
            control={form.control}
            label="Contraseña"
            labelSuffix={
              <button type="button" className="text-xs underline text-blue-600">
                ¿Olvidaste tu contraseña?
              </button>
            }
            render={({ field }) => (
              <Input {...field} type="password" placeholder="********" />
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const TextAreaExample: Story = {
  render: () => {
    const schema = z.object({
      message: z.string().min(10, 'Mensaje debe tener al menos 10 caracteres').max(500, 'Máximo 500 caracteres'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="message"
            control={form.control}
            label="Mensaje"
            description="Cuéntanos en qué podemos ayudarte"
            labelSuffix={
              <span className="text-xs text-gray-500">
                {form.watch('message')?.length || 0}/500
              </span>
            }
            render={({ field }) => (
              <Textarea {...field} placeholder="Escribe tu mensaje aquí..." rows={4} />
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const CheckboxExample: Story = {
  render: () => {
    const schema = z.object({
      terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="terms"
            control={form.control}
            label="Términos y condiciones"
            description="Lee y acepta nuestros términos de servicio"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm">Acepto los términos y condiciones</span>
              </div>
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const SelectExample: Story = {
  render: () => {
    const schema = z.object({
      role: z.string().min(1, 'Debe seleccionar un rol'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <FormFieldWrapper
            name="role"
            control={form.control}
            label="Rol"
            helpText="Selecciona tu rol en la empresa"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Desarrollador</SelectItem>
                  <SelectItem value="designer">Diseñador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        )}
      </StoryWrapper>
    );
  },
};

export const WithValidationError: Story = {
  render: () => {
    const schema = z.object({
      username: z.string().min(10, 'Usuario debe tener al menos 10 caracteres'),
    });

    const form = useForm({
      resolver: zodResolver(schema),
      defaultValues: { username: 'abc' }, // Valor que causará error
    });

    // Trigger validation para mostrar el error
    React.useEffect(() => {
      form.trigger();
    }, [form]);

    return (
      <div className="mx-auto max-w-md">
        <Form {...form}>
          <form className="space-y-4">
            <FormFieldWrapper
              name="username"
              control={form.control}
              label="Nombre de usuario"
              helpText="Este texto se oculta cuando hay error"
              render={({ field }) => (
                <Input {...field} placeholder="Escribe algo corto para ver el error" />
              )}
            />
          </form>
        </Form>
      </div>
    );
  },
};

// ================================
// FORMULARIO COMPLETO DE EJEMPLO
// ================================

export const CompleteFormExample: Story = {
  render: () => {
    const schema = z.object({
      name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      phone: z.string().optional(),
      role: z.string().min(1, 'Debe seleccionar un rol'),
      bio: z.string().max(200, 'Biografía no puede exceder 200 caracteres').optional(),
      terms: z.boolean().refine(val => val === true, 'Debe aceptar los términos'),
    });

    return (
      <StoryWrapper schema={schema}>
        {(form) => (
          <>
            <h3 className="text-lg font-semibold mb-4">Registro de Usuario</h3>
            
            <FormFieldWrapper
              name="name"
              control={form.control}
              label="Nombre completo"
              render={({ field }) => (
                <Input {...field} placeholder="Juan Pérez" />
              )}
            />

            <FormFieldWrapper
              name="email"
              control={form.control}
              label="Correo electrónico"
              description="Usaremos este email para contactarte"
              render={({ field }) => (
                <Input {...field} type="email" placeholder="juan@ejemplo.com" />
              )}
            />

            <FormFieldWrapper
              name="phone"
              control={form.control}
              label="Teléfono"
              helpText="Opcional - Solo si prefieres que te llamemos"
              render={({ field }) => (
                <Input {...field} type="tel" placeholder="+1 (555) 123-4567" />
              )}
            />

            <FormFieldWrapper
              name="role"
              control={form.control}
              label="Rol"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Desarrollador</SelectItem>
                    <SelectItem value="designer">Diseñador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <FormFieldWrapper
              name="bio"
              control={form.control}
              label="Biografía"
              labelSuffix={
                <span className="text-xs text-gray-500">
                  {form.watch('bio')?.length || 0}/200
                </span>
              }
              render={({ field }) => (
                <Textarea {...field} placeholder="Cuéntanos sobre ti..." rows={3} />
              )}
            />

            <FormFieldWrapper
              name="terms"
              control={form.control}
              label="Términos y condiciones"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Acepto los términos y condiciones</span>
                </div>
              )}
            />

            <Button type="submit" className="w-full">
              Crear cuenta
            </Button>
          </>
        )}
      </StoryWrapper>
    );
  },
};