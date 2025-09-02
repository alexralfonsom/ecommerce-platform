import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Locale } from '@repo/shared/configs/i18n';
import { LoginForm } from '@repo/ui';
import { APP_ROUTES } from '@repo/shared/configs/routes';
import { Card, CardContent } from '@repo/ui';
import {
  getCurrentAuthMode,
  shouldRedirectToUniversalLogin,
} from '@repo/shared/configs/authConfig';
import { UniversalLoginRedirect } from '@repo/ui';

type SignInPageProps = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignIn(props: SignInPageProps) {
  // Esperar a que se resuelvan params y searchParams
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const authMode = getCurrentAuthMode();

  // Obtener callbackUrl
  let callbackUrl = APP_ROUTES.getDefaultRouteForLocale(resolvedParams.lang);
  const callbackUrlParam = resolvedSearchParams?.callbackUrl;

  if (typeof callbackUrlParam === 'string' && callbackUrlParam) {
    callbackUrl = callbackUrlParam;
  } else if (Array.isArray(callbackUrlParam) && callbackUrlParam.length > 0) {
    callbackUrl = callbackUrlParam[0] || APP_ROUTES.getSignInRoute(resolvedParams.lang);
  }

  // ✅ Server-side translations
  const tAuth = await getTranslations('auth');

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {authMode === 'auth0' && shouldRedirectToUniversalLogin() ? (
            <UniversalLoginRedirect locale={resolvedParams.lang} callbackUrl={callbackUrl} />
          ) : (
            <LoginForm locale={resolvedParams.lang} callbackUrl={callbackUrl} authMode={authMode} />
          )}
          <div className="relative hidden bg-muted md:block">
            <Image
              width="400"
              height="400"
              src="/images/login.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        {tAuth.rich('login.footerAgreement', {
          privacyPolicy: () => (
            <a href="#" target="_blank" rel="noopener noreferrer">
              {tAuth('login.privacyPolicy')}
            </a>
          ),
          termsOfService: () => (
            <a href="#" target="_blank" rel="noopener noreferrer">
              {tAuth('login.termsOfService')}
            </a>
          ),
        })}
      </div>
    </div>
  );
}
