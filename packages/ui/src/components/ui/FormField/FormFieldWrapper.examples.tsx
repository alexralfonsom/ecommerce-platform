// Ejemplos de uso del FormFieldWrapper - COMPLETAMENTE REUTILIZABLE
// Este archivo muestra cómo usar el wrapper en diferentes contextos

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField } from '@components/ui/form';
import { FormFieldWrapper } from './FormFieldWrapper';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Button } from '@components/ui/button';
import Link from '@components/ui/Link';
import Icon from '@components/ui/Icon';

// ===============================
// EJEMPLO 1: FORMULARIO DE CONTACTO
// ===============================
const contactSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'Mensaje debe tener al menos 10 caracteres'),
});

export function ContactFormExample() {
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
    <Form {...form}>
      <form className="max-w-md space-y-4">
        {/* Campo obligatorio simple */}
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

        {/* Campo con descripción */}
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

        {/* Campo opcional */}
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

        {/* Textarea */}
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
      </form>
    </Form>
  );
}

// ===============================
// EJEMPLO 2: FORMULARIO DE PERFIL DE USUARIO
// ===============================
const profileSchema = z.object({
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
  bio: z.string().max(160, 'Bio no puede exceder 160 caracteres').optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

export function ProfileFormExample() {
  const form = useForm({
    resolver: zodResolver(profileSchema),
  });

  return (
    <Form {...form}>
      <form className="max-w-md space-y-4">
        {/* Campo con labelSuffix */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormFieldWrapper
              label="Nombre de usuario"
              required
              labelSuffix={
                <span className="text-muted-foreground text-xs">Solo letras y números</span>
              }
              helpText="Este será tu identificador único"
            >
              <Input placeholder="juanperez123" {...field} />
            </FormFieldWrapper>
          )}
        />

        {/* Campo con contador de caracteres */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormFieldWrapper
              label="Biografía"
              labelSuffix={
                <span className="text-muted-foreground text-xs">
                  {field.value?.length || 0}/160
                </span>
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

        {/* Campo con icono en labelSuffix */}
        <FormField
          control={form.control}
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
      </form>
    </Form>
  );
}

// ===============================
// EJEMPLO 3: FORMULARIO DE CONFIGURACIÓN
// ===============================
interface SettingsFormData {
  apiKey: string;
  notifications: boolean;
  theme: string;
}

export function SettingsFormExample() {
  const form = useForm<SettingsFormData>({
    defaultValues: {
      apiKey: '',
      notifications: true,
      theme: 'light',
    },
  });

  return (
    <Form {...form}>
      <form className="max-w-md space-y-4">
        {/* Campo con link de ayuda */}
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormFieldWrapper
              label="API Key"
              required
              labelSuffix={
                <Link href="/docs/api" className="text-xs underline">
                  ¿Cómo obtenerla?
                </Link>
              }
              description="Tu clave para acceder a la API"
            >
              <Input type="password" placeholder="sk-..." {...field} />
            </FormFieldWrapper>
          )}
        />
      </form>
    </Form>
  );
}

// ===============================
// EJEMPLO 4: FORMULARIO DE REGISTRO
// ===============================
const signupSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export function SignUpFormExample() {
  const form = useForm({
    resolver: zodResolver(signupSchema),
  });

  return (
    <Form {...form}>
      <form className="max-w-md space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormFieldWrapper label="Correo electrónico" required>
              <Input type="email" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormFieldWrapper
              label="Contraseña"
              required
              helpText="Mínimo 8 caracteres, incluye números y símbolos"
            >
              <Input type="password" {...field} />
            </FormFieldWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormFieldWrapper label="Confirmar contraseña" required>
              <Input type="password" {...field} />
            </FormFieldWrapper>
          )}
        />

        <Button type="submit" className="w-full">
          Crear cuenta
        </Button>
      </form>
    </Form>
  );
}
