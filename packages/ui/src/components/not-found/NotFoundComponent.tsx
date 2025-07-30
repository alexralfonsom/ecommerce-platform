import Image from 'next/image';
import { Locale } from '@repo/shared/configs/i18n';
import { APP_ROUTES } from '@repo/shared/configs/routes';
import Icon from '@components/ui/Icon';
import { getTranslations } from 'next-intl/server';
import BackButton from '@components/not-found/BackButton';
import Link from '@components/ui/Link';

export default async function NotFoundComponent() {
  // Usar el locale del header o el predeterminado
  const currentLocale = 'en' as Locale; // Puedes obtener el locale actual de la request si es necesario

  const homeUrl = APP_ROUTES.getDefaultRouteForLocale(currentLocale);
  const t = await getTranslations('error.404');

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/404/404background.jpeg"
          fill
          alt="404 Background"
          className="object-cover object-bottom brightness-75 contrast-125 saturate-50"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <p className="animate-pulse text-8xl font-bold text-white/90 select-none sm:text-9xl">
            404
          </p>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {t('title')}
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-xl text-white/85 sm:text-2xl">
          {t('description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 pt-30 sm:flex-row">
          <Link
            href={homeUrl}
            className="inline-flex transform items-center gap-3 rounded-lg bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700"
          >
            <Icon name="Home" size="lg" className="text-white" />
            {t('goHome')}
          </Link>

          <BackButton fallbackUrl={homeUrl} />
        </div>
      </div>
    </main>
  );
}
