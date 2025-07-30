'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Locale } from '@repo/shared/configs/i18n';
import { useToast } from '@components/ui/Toast/ToastProvider';
import {
  ForgotPasswordFormData,
  SignInFormData,
  SignUpFormData,
} from '@components/auth/schemas/authSchema';

interface UseAuthOptions {
  locale: Locale;
  callbackUrl?: string;
  redirectTo?: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

export function useAuth({ locale, callbackUrl, redirectTo }: UseAuthOptions = { locale: 'es' }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  const router = useRouter();
  const tAuth = useTranslations('auth');
  const { success, danger } = useToast();

  // Función para limpiar errores
  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  // Función para manejar el estado de loading
  const setLoading = (loading: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading: loading }));
  };

  // Función para manejar errores
  const setError = (error: string) => {
    setAuthState((prev) => ({ ...prev, error, isLoading: false }));
  };

  // Sign In con NextAuth
  const signInWithCredentials = async (data: SignInFormData) => {
    clearError();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(tAuth('messages.invalidCredentials'));
        danger('Error de autenticación', tAuth('messages.invalidCredentials'));
        return { success: false, error: result.error };
      }

      // Construir URL de redirección correcta
      const finalCallbackUrl = callbackUrl?.includes(`/${locale}`)
        ? callbackUrl
        : `/${locale}${callbackUrl?.startsWith('/') ? callbackUrl : `/${callbackUrl || ''}`}`;

      success('Inicio de sesión exitoso', tAuth('messages.welcome'));

      setLoading(false);
      router.push(finalCallbackUrl || redirectTo || `/${locale}/dashboard`);
      return { success: true };
    } catch (err) {
      const errorMessage = tAuth('messages.error');
      setError(errorMessage);
      danger('Error', errorMessage, { variant: 'danger', autoClose: false });
      console.error('Login error:', err);
      return { success: false, error: errorMessage };
    }
  };

  // Sign Up (registro de usuario)
  const signUp = async (data: SignUpFormData) => {
    clearError();
    setLoading(true);

    try {
      // TODO: Implementar llamada al API de registro
      // Por ahora, simulamos el registro
      await new Promise((resolve) => setTimeout(resolve, 1000));

      success(
        'Cuenta creada exitosamente',
        'Tu cuenta ha sido creada. Puedes iniciar sesión ahora.',
      );

      setLoading(false);
      router.push(`/${locale}/auth/signin`);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Error al crear la cuenta';
      setError(errorMessage);
      danger('Error', errorMessage);
      console.error('Signup error:', err);
      return { success: false, error: errorMessage };
    }
  };

  // Recuperación de contraseña
  const forgotPassword = async (data: ForgotPasswordFormData) => {
    clearError();
    setLoading(true);

    try {
      // TODO: Implementar llamada al API de recuperación
      // Por ahora, simulamos el envío del email
      await new Promise((resolve) => setTimeout(resolve, 1000));

      success(
        'Email enviado',
        'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
      );

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = 'Error al enviar el email de recuperación';
      setError(errorMessage);
      danger('Error', errorMessage);
      console.error('Forgot password error:', err);
      return { success: false, error: errorMessage };
    }
  };

  return {
    // Estado
    ...authState,

    // Acciones
    signInWithCredentials,
    signUp,
    forgotPassword,
    clearError,

    // Utilidades
    setLoading,
    setError,
  };
}
