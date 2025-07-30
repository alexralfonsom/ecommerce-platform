import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@repo/ui';
import { FormField } from '@repo/ui';
import { FormFieldWrapper } from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Button } from '@repo/ui';
import { Link } from '@repo/ui';
import { Icon } from '@repo/ui';
import React from 'react';

const meta: Meta<typeof FormFieldWrapper> = {
  title: 'UI/FormFieldWrapper',
  component: FormFieldWrapper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
FormFieldWrapper es un componente reutilizable que combina lo mejor de shadcn/ui forms con UX mejorada:

- ✅ Asterisco automático para campos requeridos
- ✅ Icono de error automático con AlertCircle
- ✅ Help text inteligente que se oculta cuando hay errores
- ✅ Label suffix para elementos adicionales
- ✅ Accesibilidad completa heredada de shadcn/ui
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormFieldWrapper>;

// Schema para ejemplos básicos
const basicSchema = z.object({
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  bio: z.string().max(160, 'Bio no puede exceder 160 caracteres').optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

// Componente wrapper para Storybook
function FormStoryWrapper({
  children,
  schema = basicSchema,
}: {
  children: React.ReactNode;
  schema?: any;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      bio: '',
      website: '',
    },
  });

  return (
    <div className="mx-auto max-w-md">
      <Form {...form}>
        <form className="space-y-4">
          {children}
          <Button type="submit" className="w-full">
            Enviar
          </Button>
        </form>
      </Form>
    </div>
  );
}

export const BasicRequired: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="username"
        render={({ field }) => (
          <FormFieldWrapper label="Nombre de usuario" required>
            <Input placeholder="juanperez123" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="email"
        render={({ field }) => (
          <FormFieldWrapper
            label="Correo electrónico"
            required
            description="Usaremos este email para contactarte"
          >
            <Input type="email" placeholder="juan@ejemplo.com" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="password"
        render={({ field }) => (
          <FormFieldWrapper
            label="Contraseña"
            required
            helpText="Mínimo 8 caracteres, incluye números y símbolos"
          >
            <Input type="password" placeholder="********" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const WithLabelSuffix: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="password"
        render={({ field }) => (
          <FormFieldWrapper
            label="Contraseña"
            required
            labelSuffix={
              <Link href="/forgot" className="text-xs underline">
                ¿Olvidaste tu contraseña?
              </Link>
            }
          >
            <Input type="password" placeholder="********" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const WithCharacterCounter: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="bio"
        render={({ field }) => (
          <FormFieldWrapper
            label="Biografía"
            labelSuffix={
              <span className="text-muted-foreground text-xs">{field.value?.length || 0}/160</span>
            }
            description="Cuéntanos un poco sobre ti"
          >
            <Textarea
              placeholder="Me gusta la programación y el café..."
              maxLength={160}
              {...field}
            />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const WithIconInSuffix: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="website"
        render={({ field }) => (
          <FormFieldWrapper
            label="Sitio web"
            labelSuffix={<Icon name="ExternalLink" className="text-muted-foreground h-4 w-4" />}
            helpText="Tu página personal o portafolio"
          >
            <Input type="url" placeholder="https://tuwebsite.com" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

export const OptionalField: Story = {
  render: () => (
    <FormStoryWrapper>
      <FormField
        name="website"
        render={({ field }) => (
          <FormFieldWrapper
            label="Teléfono"
            helpText="Opcional - Solo si prefieres que te llamemos"
          >
            <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
          </FormFieldWrapper>
        )}
      />
    </FormStoryWrapper>
  ),
};

// Schema para demostrar errores
const errorSchema = z.object({
  username: z.string().min(10, 'Username debe tener al menos 10 caracteres'),
});

export const WithValidationError: Story = {
  render: () => {
    const form = useForm({
      resolver: zodResolver(errorSchema),
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
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Nombre de usuario"
                  required
                  helpText="Este texto se oculta cuando hay error"
                >
                  <Input placeholder="Escribe algo corto para ver el error" {...field} />
                </FormFieldWrapper>
              )}
            />
          </form>
        </Form>
      </div>
    );
  },
};

// Formulario completo de ejemplo
const contactSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'Mensaje debe tener al menos 10 caracteres'),
});

export const ContactFormExample: Story = {
  render: () => {
    const form = useForm({
      resolver: zodResolver(contactSchema),
      defaultValues: {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      },
    });

    return (
      <div className="mx-auto max-w-md">
        <h3 className="mb-4 text-lg font-semibold">Formulario de Contacto</h3>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Nombre completo"
                  required
                  helpText="Ingresa tu nombre y apellido"
                >
                  <Input placeholder="Juan Pérez" {...field} />
                </FormFieldWrapper>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Correo electrónico"
                  required
                  description="Usaremos este email para responderte"
                >
                  <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                </FormFieldWrapper>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Teléfono"
                  helpText="Opcional - Solo si prefieres que te llamemos"
                >
                  <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                </FormFieldWrapper>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormFieldWrapper label="Asunto" required>
                  <Input placeholder="¿En qué podemos ayudarte?" {...field} />
                </FormFieldWrapper>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormFieldWrapper
                  label="Mensaje"
                  required
                  description="Cuéntanos en qué podemos ayudarte"
                >
                  <Textarea placeholder="Escribe tu mensaje aquí..." rows={4} {...field} />
                </FormFieldWrapper>
              )}
            />

            <Button type="submit" className="w-full">
              Enviar mensaje
            </Button>
          </form>
        </Form>
      </div>
    );
  },
};
