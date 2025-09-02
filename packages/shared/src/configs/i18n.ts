// ✅ Tipos más específicos para mejor type safety
export type Direction = 'ltr' | 'rtl';

export type LanguageInfo = {
  name: string;
  nativeName: string;
  flag: string;
  code: string;
  shortCode: string;
};

// ✅ Configuración principal de i18n
export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'en'],

  // ✅ Dirección del texto para cada idioma
  langDirection: {
    en: 'ltr' as Direction,
    es: 'ltr' as Direction,
    // ✅ Ejemplo para futuros idiomas RTL:
    // ar: 'rtl' as Direction, // Árabe
    // he: 'rtl' as Direction, // Hebreo
  },

  // ✅ Configuración de cookies y sesiones
  cookies: {
    localeCookieName: 'NEXT_LOCALE',
    localeMaxAge: 365 * 24 * 60 * 60, // 1 año
  },

  // ✅ Configuración visual de idiomas
  languages: {
    es: {
      name: 'Español',
      nativeName: 'Español',
      flag: '🇪🇸',
      code: 'ES',
      shortCode: 'es',
    } as LanguageInfo,
    en: {
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      code: 'US',
      shortCode: 'en',
    } as LanguageInfo,
    // ✅ Fácil extensión para nuevos idiomas:
    // fr: {
    //   name: 'French',
    //   nativeName: 'Français',
    //   flag: '🇫🇷',
    //   code: 'FR',
    //   shortCode: 'fr'
    // } as LanguageInfo,
    // ar: {
    //   name: 'Arabic',
    //   nativeName: 'العربية',
    //   flag: '🇸🇦',
    //   code: 'SA',
    //   shortCode: 'ar'
    // } as LanguageInfo,
  },
} as const;

// ✅ Tipos derivados de la configuración
export type Locale = (typeof i18n)['locales'][number];
export type LanguageConfig = (typeof i18n)['languages'][Locale];

// ✅ Función helper para validar si un locale soporta RTL
export const isRTLLocale = (locale: Locale): boolean => {
  return i18n.langDirection[locale] === 'rtl';
};

// ✅ Función helper para obtener todos los locales RTL
export const getRTLLocales = (): Locale[] => {
  return i18n.locales.filter((locale) => isRTLLocale(locale));
};

// ✅ Función helper para obtener todos los locales LTR
export const getLTRLocales = (): Locale[] => {
  return i18n.locales.filter((locale) => !isRTLLocale(locale));
};
