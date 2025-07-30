// src/lib/utils/i18nUtils.ts
import { i18n, Locale, isRTLLocale } from '@configs/i18n';
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from 'negotiator';
import { match } from '@formatjs/intl-localematcher';

// ===============================
// UTILIDADES DE DETECCIÓN
// ===============================

/**
 * Detecta el idioma preferido del usuario desde headers Accept-Language
 * @param request - NextRequest object
 * @returns Locale detectado o defaultLocale
 */
export const detectLocaleFromHeaders = (request: NextRequest): Locale => {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    const matchedLocale = match(languages, i18n.locales, i18n.defaultLocale);
    return i18n.locales.includes(matchedLocale as Locale) ? (matchedLocale as Locale) : i18n.defaultLocale;
  } catch (error) {
    console.error('Error matching locale from headers:', error);
    return i18n.defaultLocale;
  }
};

/**
 * Obtiene el locale completo considerando cookies, headers y fallback
 * @param request - NextRequest object
 * @returns Locale final
 */
export const getLocaleFromRequest = (request: NextRequest): Locale => {
  // 1. Prioridad: Cookie del usuario
  const cookieLocale = getLocalePreferenceServer(request);
  if (cookieLocale) {
    console.log('🍪 Locale from cookie:', cookieLocale);
    return cookieLocale;
  }

  // 2. Segunda prioridad: Headers Accept-Language
  const headerLocale = detectLocaleFromHeaders(request);
  console.log('🌐 Locale from headers:', headerLocale);
  return headerLocale;
};

// ===============================
// UTILIDADES DE PATH/URL
// ===============================

/**
 * Extrae el idioma actual de la URL pathname
 * @param pathname - pathname de Next.js
 * @returns Locale actual o null si no es válido
 */
export const getCurrentLocaleFromPath = (pathname: string): Locale | null => {
  const pathSegments = pathname.split('/');
  const localeFromPath = pathSegments[1] as Locale;

  return i18n.locales.includes(localeFromPath) ? localeFromPath : null;
};

/**
 * Construye una nueva ruta con el idioma especificado
 * @param pathname - pathname actual
 * @param newLocale - nuevo idioma
 * @returns nueva ruta con el idioma cambiado
 */
export const buildLocalizedPath = (pathname: string, newLocale: Locale): string => {
  const pathSegments = pathname.split('/');

  // Si ya tiene un locale válido, reemplazarlo
  const currentLocale = getCurrentLocaleFromPath(pathname);
  if (currentLocale) {
    pathSegments[1] = newLocale;
  } else {
    // Si no tiene locale, añadirlo
    pathSegments.splice(1, 0, newLocale);
  }

  return pathSegments.join('/');
};

/**
 * Verifica si una ruta necesita prefijo de idioma
 * @param pathname - ruta a verificar
 * @returns true si necesita prefijo de idioma
 */
export const pathNeedsLocalePrefix = (pathname: string): boolean => {
  return i18n.locales.every((locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`);
};

/**
 * Verifica si una ruta es solo el idioma (ej: /es, /en)
 * @param pathname - ruta a verificar
 * @returns true si es solo el idioma
 */
export const isLanguageRootPath = (pathname: string): boolean => {
  return i18n.locales.some((locale) => pathname === `/${locale}` || pathname === `/${locale}/`);
};

// ===============================
// MANEJO DE COOKIES (CLIENTE)
// ===============================

/**
 * Guarda la preferencia de idioma en cookie (cliente)
 * @param locale - idioma a guardar
 */
export const saveLocalePreference = (locale: Locale): void => {
  if (typeof document === 'undefined') return;

  const maxAge = i18n.cookies.localeMaxAge;
  document.cookie = `${i18n.cookies.localeCookieName}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;

  console.log(`🍪 Saved locale preference: ${locale}`);
};

/**
 * Obtiene la preferencia de idioma de la cookie (cliente)
 * @returns Locale guardado en cookie o null si no existe
 */
export const getLocalePreference = (): Locale | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${i18n.cookies.localeCookieName}=`)
  );

  if (!localeCookie) return null;

  const locale = localeCookie.split('=')[1].trim() as Locale;
  return i18n.locales.includes(locale) ? locale : null;
};

// ===============================
// MANEJO DE COOKIES (SERVIDOR)
// ===============================

/**
 * Guarda la preferencia de idioma en cookie (servidor)
 * @param response - NextResponse object
 * @param locale - idioma a guardar
 */
export const saveLocalePreferenceServer = (response: NextResponse, locale: Locale): void => {
  response.cookies.set({
    name: i18n.cookies.localeCookieName,
    value: locale,
    maxAge: i18n.cookies.localeMaxAge,
    path: '/',
    sameSite: 'lax'
  });

  console.log(`🍪 Server: Saved locale preference: ${locale}`);
};

/**
 * Obtiene la preferencia de idioma de la cookie (servidor)
 * @param request - NextRequest object
 * @returns Locale guardado en cookie o null si no existe
 */
export const getLocalePreferenceServer = (request: NextRequest): Locale | null => {
  const localeCookie = request.cookies.get(i18n.cookies.localeCookieName)?.value;

  if (!localeCookie) return null;

  return i18n.locales.includes(localeCookie as Locale)
    ? localeCookie as Locale
    : null;
};

/**
 * Verifica si necesita actualizar la cookie de idioma y la guarda si es necesario
 * @param request - NextRequest object
 * @param response - NextResponse object
 * @param detectedLocale - idioma detectado/actual
 * @returns true si se actualizó la cookie
 */
export const ensureLocaleCookie = (
  request: NextRequest,
  response: NextResponse,
  detectedLocale: Locale
): boolean => {
  const existingCookie = getLocalePreferenceServer(request);

  // Si no hay cookie o es diferente al idioma actual, actualizar
  if (!existingCookie || existingCookie !== detectedLocale) {
    saveLocalePreferenceServer(response, detectedLocale);
    return true;
  }

  return false;
};

// ===============================
// CONFIGURACIÓN DE IDIOMAS
// ===============================

/**
 * Obtiene la configuración de un idioma
 * @param locale - idioma
 * @returns configuración del idioma
 */
export const getLanguageConfig = (locale: Locale) => {
  return i18n.languages[locale];
};

/**
 * Obtiene todos los idiomas disponibles con su configuración
 * @returns array de idiomas con configuración
 */
export const getAllLanguages = () => {
  return i18n.locales.map(locale => ({
    locale,
    ...i18n.languages[locale]
  }));
};

/**
 * Verifica si un string es un idioma válido
 * @param locale - string a verificar
 * @returns true si es un idioma válido
 */
export const isValidLocale = (locale: string): locale is Locale => {
  return i18n.locales.includes(locale as Locale);
};

/**
 * Obtiene el siguiente idioma en la lista (útil para toggle)
 * @param currentLocale - idioma actual
 * @returns siguiente idioma
 */
export const getNextLocale = (currentLocale: Locale): Locale => {
  const currentIndex = i18n.locales.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % i18n.locales.length;
  return i18n.locales[nextIndex];
};

// ===============================
// UTILIDADES DE VALIDACIÓN
// ===============================

/**
 * Valida y corrige un locale
 * @param locale - locale a validar
 * @param fallback - locale de fallback (por defecto: defaultLocale)
 * @returns locale válido
 */
export const validateLocale = (locale: string | null | undefined, fallback?: Locale): Locale => {
  if (!locale) return fallback || i18n.defaultLocale;

  return isValidLocale(locale) ? locale : (fallback || i18n.defaultLocale);
};

/**
 * Obtiene información completa del locale actual
 * @param locale - locale actual
 * @returns objeto con información completa del locale
 */
export const getLocaleInfo = (locale: Locale) => {
  const config = getLanguageConfig(locale);
  const direction = i18n.langDirection[locale];
  const isRTL = isRTLLocale(locale); // ✅ Usar helper de i18n.ts
  
  return {
    locale,
    config,
    direction,
    isRTL,
    isDefault: locale === i18n.defaultLocale,
    // ✅ Información adicional útil
    nativeName: config.nativeName,
    flag: config.flag,
    code: config.code,
    shortCode: config.shortCode,
  };
};

// ===============================
// UTILIDADES DE DEBUG
// ===============================

/**
 * Obtiene información de debug del estado de i18n
 * @param request - NextRequest object (opcional)
 * @returns objeto con información de debug
 */
export const getI18nDebugInfo = (request?: NextRequest) => {
  const debugInfo: any = {
    defaultLocale: i18n.defaultLocale,
    availableLocales: i18n.locales,
    cookieName: i18n.cookies.localeCookieName,
    cookieMaxAge: i18n.cookies.localeMaxAge,
  };

  if (request) {
    debugInfo.cookieValue = getLocalePreferenceServer(request);
    debugInfo.detectedFromHeaders = detectLocaleFromHeaders(request);
    debugInfo.finalLocale = getLocaleFromRequest(request);
    debugInfo.pathname = request.nextUrl.pathname;
    debugInfo.currentLocaleFromPath = getCurrentLocaleFromPath(request.nextUrl.pathname);
  }

  if (typeof document !== 'undefined') {
    debugInfo.clientCookie = getLocalePreference();
    debugInfo.clientPathname = window.location.pathname;
  }

  return debugInfo;
};






