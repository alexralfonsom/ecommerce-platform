// src/components/auth/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Locale } from '@repo/shared/configs/i18n';
import Link from '@components/ui/Link';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Form } from '@components/ui/form';
import { FormFieldWrapper } from '@components/ui/FormField/FormFieldWrapper';
import SocialLogin from '@components/auth/SocialLogin';
import { SignInFormData, signInSchema } from '@components/auth/schemas/authSchema';
import { AuthMode } from '@repo/shared/configs/authConfig';
import { useAuth } from '@components/auth/hooks/useAuth';
import Icon from '@components/ui/Icon';

type LoginFormProps = {
  locale: Locale;
  callbackUrl: string;
  authMode: AuthMode;
};

export default function LoginForm({ locale, callbackUrl, authMode }: LoginFormProps) {
  // ✅ Traducciones client-side
  const tAuth = useTranslations('auth');
  const { signInWithCredentials, isLoading, error, clearError } = useAuth({
    locale,
    callbackUrl,
  });

  // ✅ React Hook Form con validación Zod
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    clearError();
    await signInWithCredentials(data);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">{tAuth('messages.welcome')}</h1>
          <p className="text-balance text-muted-foreground">{tAuth('messages.welcomeSubtitle')}</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Username */}
            <FormFieldWrapper
              name="username"
              control={form.control}
              label={tAuth('login.username')}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder={tAuth('login.usernamePlaceHolder')}
                  className="px-3 py-2"
                  {...field}
                />
              )}
            />

            {/* Campo Password */}
            <FormFieldWrapper
              name="password"
              control={form.control}
              label={tAuth('login.password')}
              labelSuffix={
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-sm underline-offset-2 hover:underline"
                >
                  {tAuth('login.forgotPassword')}
                </Link>
              }
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder={tAuth('login.passwordPlaceHolder')}
                  className="px-3 py-2"
                  {...field}
                />
              )}
            />

            {/* Botón Submit */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                  {tAuth('messages.loading')}
                </span>
              ) : (
                tAuth('login.signIn')
              )}
            </Button>
          </form>
        </Form>

        <SocialLogin />

        <div className="text-center text-sm">
          {tAuth('login.dontHaveAccount')}{' '}
          <Link className="underline underline-offset-4" href={`/${locale}/auth/signup`}>
            {tAuth('login.signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
