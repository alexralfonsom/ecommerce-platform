'use client';
import Link from '@components/ui/Link';
import { APP_ROUTES } from '@repo/shared/configs/routes';
import React from 'react';
import { Locale } from '@repo/shared/configs/i18n';
import Icon from '@components/ui/Icon';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { cn } from '@repo/shared';
import { ThemeColors } from '@/configs/DesignSystem';
import { useTranslations } from 'next-intl';
import Logo from '@components/layout/Logo';

type LogoutEndedProps = {
  locale: Locale;
};

export default function LogoutEnded({ locale }: LogoutEndedProps) {
  const t = useTranslations('auth');
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 text-center">
            {/* Logo */}
            <Logo />
            {/* Success Icon */}
            <div className="mb-6">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Icon name="CircleCheckBig" className="size-10" color="green" />
              </div>

              <h1 className="mb-2 text-2xl font-bold">{t('logout.sessionClosedOk')}</h1>

              <p className="mb-6">{t('logout.sessionClosedMessage')}</p>
            </div>

            {/* Security Info */}
            <Alert variant="info" className="mb-8">
              <Icon name="Lock" className="size-10" color="blue" />
              <AlertTitle className="mb-2">{t('logout.sessionListTitle')}</AlertTitle>
              <AlertDescription className="text-left">
                {t('logout.sessionListDetail') !== '' ? (
                  <ul className="list-disc space-y-1 pl-6">
                    {t('logout.sessionListDetail')
                      .split('[*]')
                      .filter(Boolean)
                      .map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                  </ul>
                ) : null}
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={APP_ROUTES.getSignInRoute(locale)}
                className={cn(
                  ThemeColors.primary.full,
                  'block w-full rounded-lg px-6 py-3 font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none',
                )}
              >
                {t('logout.signInAgain')}
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-xs">
              <p>
                {t.rich('logout.messageIfNotLogout', {
                  supportLink: (chunks) => (
                    <Link href={`/${locale}/support`} className="ml-1 underline hover:underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="text-xs">
                © {new Date().getFullYear()} StartIA. {t('logout.messagePrivacy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
