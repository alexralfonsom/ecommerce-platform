import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';
import { i18n, Locale } from '@repo/shared/configs/i18n';

export default getRequestConfig(async () => {
  let locale : string | null = null;

  // ✅ Obtener el locale desde los headers del middleware
  const headersList = await headers();
  locale = headersList.get(i18n.cookies.localeCookieName) as Locale;
  if (!locale) {
    const cookieStore = await cookies()
    locale = cookieStore.get(i18n.cookies.localeCookieName)?.value || null;
  }
  if (!locale) {
    locale = i18n.defaultLocale;
  }

  // ✅ Validar que sea un locale válido
  const finalLocale = i18n.locales.includes(locale as Locale)
    ? locale as Locale
    : i18n.defaultLocale;


  try {
    let messages;

    if (process.env.NODE_ENV === 'development') {
      // ✅ En desarrollo: leer directamente desde filesystem (hot reload instantáneo)
      const fs = await import('fs');
      const path = await import('path');
      
      // Ruta al directorio de diccionarios en el shared package
      const dictionariesPath = path.resolve(process.cwd(), '../../packages/shared/src/data/dictionaries');
      
      // Cargar mensajes principales
      const messagesPath = path.join(dictionariesPath, `${finalLocale}.json`);
      messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    } else {
      // ✅ En producción: usar imports del paquete compilado
      messages = (await import(`@repo/shared/data/dictionaries/${finalLocale}.json`)).default;
    }

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

    // ✅ Fallback robusto que también usa el sistema híbrido
    try {
      let fallbackMessages;
      
      if (process.env.NODE_ENV === 'development') {
        const fs = await import('fs');
        const path = await import('path');
        const fallbackPath = path.resolve(process.cwd(), 
          `../../packages/shared/src/data/dictionaries/${i18n.defaultLocale}.json`);
        fallbackMessages = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      } else {
        fallbackMessages = (await import(`@repo/shared/data/dictionaries/${i18n.defaultLocale}.json`)).default;
      }

      return {
        locale: i18n.defaultLocale,
        messages: fallbackMessages,
        defaultTranslationValues: {
          b: (text: string) => `<b>${text}</b>`,
          strong: (text: string) => `<strong>${text}</strong>`,
          em: (text: string) => `<em>${text}</em>`,
          p: (text: string) => `<p>${text}</p>`,
          br: () => '<br/>',
          primary: (text: string) => `<span class="text-blue-600 font-semibold">${text}</span>`,
        },
      };
    } catch (fallbackError) {
      console.error(`❌ Critical error: Could not load fallback messages`, fallbackError);
      
      // ✅ Ultimate fallback con mensajes mínimos en memoria
      return {
        locale: i18n.defaultLocale,
        messages: {
          general: {
            loading: 'Cargando...',
            error: 'Error',
            save: 'Guardar',
            cancel: 'Cancelar'
          }
        },
      };
    }
  }
});