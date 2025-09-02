import '@repo/ui/styles.css';
import '@/global.css';
import { Nunito } from 'next/font/google';
import { i18n, Locale } from '@repo/shared/configs/i18n';
import { ReactNode } from 'react';
import { SessionWrapper, ToastProvider, ThemeProvider, QueryProvider } from '@repo/ui';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Sistema de Catálogos',
  description: 'Administración de catálogos maestros y sus detalles',
};
// // If loading a variable font, you don't need to specify the font weight
// const inter = Inter({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   display: 'swap',
//   variable: '--font-inter',
//   fallback: ['system-ui', 'sans-serif'],
// });

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-nunito',
  fallback: ['system-ui', 'sans-serif'],
});

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

type RootLanguageLayoutProps = {
  children: Readonly<ReactNode>;
  params: Promise<{ lang: Locale }>;
};

export default async function RootLanguageLayout(props: RootLanguageLayoutProps) {
  // Esperar a que se resuelvan params
  const resolvedParams = await props.params;
  const { lang } = resolvedParams;

  // ✅ Validar que el idioma sea válido
  if (!i18n.locales.includes(lang)) {
    notFound();
  }

  // ✅ El locale ya está validado por el middleware
  const currentLocale = lang;
  const textDirection = i18n.langDirection[currentLocale];

  // ✅ Obtener mensajes (ya cargados correctamente por i18request)
  const messages = await getMessages();
  console.log('🎯 Layout rendering with locale:', currentLocale);

  return (
    <html
      lang={currentLocale}
      dir={textDirection}
      className={`${nunito.variable} ${nunito.className} h-full`}
      suppressHydrationWarning
      style={{ '--font-sans': nunito.style.fontFamily } as any}
    >
      <body className={`h-full text-base text-black dark:text-white`}>
        <NextIntlClientProvider messages={messages} locale={currentLocale}>
          <SessionWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider maxToasts={7} position="top-right">
                <QueryProvider>{props.children}</QueryProvider>
              </ToastProvider>
            </ThemeProvider>
          </SessionWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
