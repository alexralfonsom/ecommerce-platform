import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import { i18n, Locale } from '@configs/i18n';

export default getRequestConfig(async () => {
  let locale: string | null = null;

  // ✅ Obtener el locale desde los headers del middleware
  const headersList = await headers();
  locale = headersList.get(i18n.cookies.localeCookieName) as Locale;
  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get(i18n.cookies.localeCookieName)?.value || null;
  }
  if (!locale) {
    locale = i18n.defaultLocale;
  }

  // ✅ Validar que sea un locale válido
  const finalLocale = i18n.locales.includes(locale as Locale)
    ? (locale as Locale)
    : i18n.defaultLocale;

  try {
    // ✅ Cargar mensajes dinámicamente
    const messages = (await import(`@data/dictionaries/${finalLocale}.json`)).default;

    return {
      locale: finalLocale,
      messages,
      defaultTranslationValues: {
        b: (text: string) => `<b>${text}</b>`,
        strong: (text: string) => `<strong>${text}</strong>`,
        em: (text: string) => `<em>${text}</em>`,
        p: (text: string) => `<p>${text}</p>`,
        br: () => '<br/>',
        primary: (text: string) => `<span class="text-blue-600 font-semibold">${text}</span>`,
      },
    };
  } catch (error) {
    console.error(`❌ Error loading messages for locale: ${finalLocale}`, error);

    // ✅ Fallback al idioma por defecto
    const fallbackMessages = (await import(`@data/dictionaries/${i18n.defaultLocale}.json`))
      .default;
    return {
      locale: i18n.defaultLocale,
      messages: fallbackMessages,
    };
  }
});
