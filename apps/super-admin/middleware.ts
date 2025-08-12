// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { APP_ROUTES } from '@repo/shared/configs/routes';
import {
  getLocaleFromRequest,
  getCurrentLocaleFromPath,
  pathNeedsLocalePrefix,
  isLanguageRootPath,
  validateLocale,
  ensureLocaleCookie,
  getI18nDebugInfo,
} from '@repo/shared/lib/utils';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // Debug info en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Middleware: Processing ${pathname}`, {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
    });
  }

  // Excluir archivos estáticos y APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // FASE 1: MANEJO DE INTERNACIONALIZACIÓN
  // Caso 1: Raíz sin idioma -> Redirigir con idioma detectado
  if (pathname === '/') {
    const detectedLocale = getLocaleFromRequest(request);
    url.pathname = APP_ROUTES.getDefaultRouteForLocale(detectedLocale);

    console.log(`🌍 Root redirect: ${detectedLocale} -> ${url.pathname}`);

    const response = NextResponse.redirect(url);
    ensureLocaleCookie(request, response, detectedLocale);
    return response;
  }

  // Caso 2: Solo idioma (ej: /es, /en) -> Redirigir a dashboard o pagina por defecto
  if (isLanguageRootPath(pathname)) {
    const currentLocale = validateLocale(pathname.split('/')[1]);
    url.pathname = APP_ROUTES.getDefaultRouteForLocale(currentLocale);

    console.log(`🌍 Lang root redirect: ${currentLocale} -> ${url.pathname}`);

    const response = NextResponse.redirect(url);
    ensureLocaleCookie(request, response, currentLocale);
    return response;
  }

  // Caso 3: Ruta sin prefijo de idioma -> Añadir idioma detectado
  if (pathNeedsLocalePrefix(pathname)) {
    const detectedLocale = getLocaleFromRequest(request);
    url.pathname = `/${detectedLocale}${pathname}`;

    console.log(`🌍 Missing locale: ${pathname} -> ${url.pathname}`);

    const response = NextResponse.redirect(url);
    ensureLocaleCookie(request, response, detectedLocale);
    return response;
  }

  // 🔍 FASE 2: EXTRACCIÓN Y VALIDACIÓN DEL LOCALE ACTUAL
  const currentLocaleFromPath = getCurrentLocaleFromPath(pathname);

  if (!currentLocaleFromPath) {
    // Si no se puede extraer un locale válido, usar el detectado
    const detectedLocale = getLocaleFromRequest(request);
    const correctedPath = `/${detectedLocale}${pathname}`;
    url.pathname = correctedPath;

    console.log(`🌍 Invalid locale in path: ${pathname} -> ${correctedPath}`);

    const response = NextResponse.redirect(url);
    ensureLocaleCookie(request, response, detectedLocale);
    return response;
  }

  const currentLocale = currentLocaleFromPath;

  // 🚫 FASE 2.5: VERIFICACIÓN DE RUTAS VÁLIDAS
  // Verificar si la ruta existe en tu aplicación
  const routeWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
  const isPublic = APP_ROUTES.isPublicRoute(pathname, currentLocale);
  const isProtected = APP_ROUTES.isProtectedRoute(pathname, currentLocale);
  const isValid = APP_ROUTES.isValidRoute(pathname, currentLocale);
  console.log(
    `🚫 Route validation: ${pathname} | Public: ${isPublic} | Protected: ${isProtected} | Locale: ${currentLocale}`,
  );

  // ✅ VALIDACIÓN CRÍTICA: Si NO es una ruta válida → 404 global INMEDIATO
  if (!isValid && routeWithoutLocale !== '/') {
    console.log(`❌ Invalid route pattern: ${routeWithoutLocale} → Triggering global 404`);
    // Rewrite a la página 404 global (NO next())
    url.pathname = `/${currentLocale}/404`;
    const response = NextResponse.rewrite(url);

    // Asegurar que la cookie del locale esté actualizada
    ensureLocaleCookie(request, response, currentLocale);

    return response;
  }

  console.log(`✅ Valid route detected: ${routeWithoutLocale}`);

  // 🛡️ FASE 3: VERIFICACIÓN DE AUTENTICACIÓN
  console.log(
    `🛡️ Route check: ${pathname} | Public: ${isPublic} | Protected: ${isProtected} | Locale: ${currentLocale}`,
  );

  // Solo verificar autenticación en rutas protegidas Y válidas
  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.log(`🛡️ Auth required: Redirecting to signin`);
      const signInUrl = new URL(APP_ROUTES.getSignInRoute(currentLocale), request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);

      const response = NextResponse.redirect(signInUrl);
      ensureLocaleCookie(request, response, currentLocale);
      return response;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🛡️ Auth verified for user: ${token.email || token.name || 'Unknown'}`);
    }
  }

  // ✅ FASE 4: CONTINUAR CON LA RESPUESTA NORMAL
  // Crear headers personalizados para el request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('NEXT_LOCALE', currentLocale);
  requestHeaders.set('x-middleware-processed', 'true');

  // Añadir información de debug en desarrollo
  if (process.env.NODE_ENV === 'development') {
    const debugInfo = getI18nDebugInfo(request);
    requestHeaders.set('x-i18n-debug', JSON.stringify(debugInfo));
    console.log(`🔍 Setting headers:`, {
      NEXT_LOCALE: currentLocale,
      'x-pathname': pathname,
      'x-url': request.url,
    });
  }

  // Crear respuesta final
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Asegurar que la cookie del locale esté actualizada
  ensureLocaleCookie(request, response, currentLocale);

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Request processed successfully: ${pathname} (${currentLocale})`);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
