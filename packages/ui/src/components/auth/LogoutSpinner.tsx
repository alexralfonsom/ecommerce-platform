import { useTranslations } from 'next-intl';
import React from 'react';
import { Locale } from '@repo/shared/configs/i18n';
import Logo from '@components/layout/Logo';

type LogoutSpinnerProps = {
  locale: Locale;
};

export default function LogoutSpinner({ locale }: LogoutSpinnerProps) {
  const t = useTranslations('auth');

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 text-center">
            {/* Logo */}
            <Logo />
            <div className="mb-6">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {t('logout.sessionClosing')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('logout.sessionClosingMessage')}
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
