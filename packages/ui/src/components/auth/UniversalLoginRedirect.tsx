// src/components/auth/UniversalLoginRedirect.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Locale } from '@repo/shared/configs/i18n';
import { useTranslations } from 'next-intl';
import Icon from '@components/ui/Icon';
import { Animations } from '@/configs/DesignSystem';
import Logo from '@components/layout/Logo';

interface UniversalLoginRedirectProps {
  locale: Locale;
  callbackUrl: string;
}

export default function UniversalLoginRedirect({
  locale,
  callbackUrl,
}: UniversalLoginRedirectProps) {
  const tAuth = useTranslations('auth');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRedirect();
    }, 3000);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleRedirect = async () => {
    setIsRedirecting(true);

    try {
      await signIn('auth0', {
        callbackUrl: callbackUrl.includes(`/${locale}`) ? callbackUrl : `/${locale}${callbackUrl}`,
        redirect: true,
      });
    } catch (error) {
      console.error('Error redirecting to Auth0:', error);
      setIsRedirecting(false);
    }
  };

  const handleManualRedirect = () => {
    if (!isRedirecting) {
      handleRedirect();
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 text-center">
            <Logo />
            <h1 className="mb-2 text-2xl font-bold">{tAuth('messages.welcome')}</h1>
            <p>{tAuth('messages.welcomeSubtitle')}</p>

            {/* Loading Animation */}
            <div className="mb-8 text-center">
              <div className="mt-4 mb-4 inline-flex h-16 w-16 items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-200 dark:border-gray-600"></div>
                  <div
                    className={`absolute top-0 left-0 h-16 w-16 ${Animations.custom.spin} rounded-full border-4 border-indigo-600 border-t-transparent`}
                  ></div>
                </div>
              </div>

              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {tAuth('universalLogin.redirectToSecureLogin')}
              </h2>

              {countdown > 0 ? (
                <p className="mb-4">
                  {tAuth('universalLogin.automaticRedirectionIn', { seconds: countdown })}
                </p>
              ) : (
                <p className="mb-4">
                  {isRedirecting ? 'Redirigiendo...' : 'Preparando redirección...'}
                </p>
              )}
            </div>

            {/* Manual Redirect Button */}
            <div className="text-center">
              <button
                onClick={handleManualRedirect}
                disabled={isRedirecting}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRedirecting ? (
                  <>
                    <div
                      className={`mr-2 h-4 w-4 ${Animations.custom.spin} rounded-full border-2 border-white border-t-transparent`}
                    ></div>
                    {tAuth('universalLogin.redirecting')}
                  </>
                ) : (
                  <>
                    <Icon name="ArrowRight" className="mr-2 h-4 w-4" color="white" />
                    {tAuth('universalLogin.continueNow')}
                  </>
                )}
              </button>
            </div>
            {/* Security Info */}
            <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center">
                <Icon
                  name="ShieldCheck"
                  className="mr-2 size-14 text-green-600 dark:text-green-400"
                />
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div className="font-medium">{tAuth('universalLogin.secureConnectionTitle')}</div>
                  <div>{tAuth('universalLogin.secureConnectionDescription')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
