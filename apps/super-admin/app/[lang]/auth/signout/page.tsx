'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Locale } from '@repo/shared/configs/i18n';
import { Card, CardContent } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { LogoutEnded } from '@repo/ui';
import { LogoutSpinner } from '@repo/ui';
import { useSecureLogout } from '@repo/ui';

export default function SignOut() {
  const tAuth = useTranslations('auth');
  const params = useParams();
  const locale = params.lang as Locale;

  const [logoutCompleted, setLogoutCompleted] = useState(false);

  const { logout, isLoggingOut } = useSecureLogout({
    redirectTo: undefined, // No redirect, we're already on the signout page
    onLogoutStart: () => {
      console.log('Secure logout initiated from signout page');
    },
    onLogoutComplete: () => {
      console.log('Secure logout completed from signout page');
      setLogoutCompleted(true);
    },
    onLogoutError: (error) => {
      console.error('Secure logout failed from signout page:', error);
      setLogoutCompleted(true); // Show UI even if there was an error
    },
  });

  useEffect(() => {
    if (!logoutCompleted && !isLoggingOut) {
      logout().catch(console.error);
    }
  }, [logout, logoutCompleted, isLoggingOut]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            {isLoggingOut && !logoutCompleted ? (
              <LogoutSpinner locale={locale} />
            ) : (
              <LogoutEnded locale={locale} />
            )}
            <div className="relative hidden bg-muted md:block">
              <Image
                width="400"
                height="600"
                src="/images/logout.svg"
                alt="Image"
                className="full absolute inset-0 h-full object-cover dark:brightness-[0.2] dark:grayscale"
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
    </>
  );
}
