import * as z from 'zod';

// Schema para Sign In
export const signInSchema = z.object({
  username: z
    .string()
    .min(1, 'El usuario es requerido')
    .min(4, 'El usuario debe tener al menos 4 caracteres')
    .max(50, 'El usuario no puede exceder 50 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(4, 'La contraseña debe tener al menos 4 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

// Schema para Sign Up
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Ingrese un correo electrónico válido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme su contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Schema para recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido'),
});

// Tipos TypeScript derivados de los schemas
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
