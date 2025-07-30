'use client';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { CreateAccount } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { Icon } from '@repo/ui';
import { Link } from '@repo/ui';

export default function SignUp() {
  const tAuth = useTranslations('auth.login');

  return (
    <div className="flex flex-col gap-6">
      <Link href="/auth/signin" className="flex items-center gap-2 self-center font-medium">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon name="AppWindow" className="size-4" color="white" />
        </div>
        Acme Inc.
      </Link>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Card>
          <CardHeader className="pt-2 text-center">
            <CardTitle className="text-xl">{tAuth('createAccount')}</CardTitle>
            <CardDescription>{tAuth('createAccountDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAccount />
          </CardContent>
        </Card>
        <div className="text-center text-xs text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          {tAuth.rich('footerAgreement', {
            privacyPolicy: () => (
              <a href="#" target="_blank" rel="noopener noreferrer">
                {tAuth('privacyPolicy')}
              </a>
            ),
            termsOfService: () => (
              <a href="#" target="_blank" rel="noopener noreferrer">
                {tAuth('termsOfService')}
              </a>
            ),
          })}
        </div>
      </div>
    </div>
  );
}
