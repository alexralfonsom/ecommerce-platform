const DEFAULT_SECTION = 'dashboard';
const ROUTE_SEGMENTS = {
  public: ['auth', 'about', 'contact'],
  protected: ['dashboard', 'catalogos', 'usuarios', 'reportes', 'perfil', 'configuracion'],
} as const;

// ✅ FUNCIÓN FLEXIBLE - Permite variaciones, guiones y errores de tipeo
const createRoutePatterns = (segments: readonly string[]) =>
  segments.map((segment) => new RegExp(`^\\/${segment}($|[a-z0-9\\-]*($|\\/.*))`, 'i'));

// Alternativa más específica si quieres ser más restrictivo:
// const createRoutePatterns = (segments: readonly string[]) =>
//   segments.map((segment) => new RegExp(`^\\/${segment}($|s*|\\/.*)`)); // Permite plural opcional


export const APP_ROUTES = {
  defaultSection: DEFAULT_SECTION,
  patterns: {
    public: createRoutePatterns(ROUTE_SEGMENTS.public),
    protected: createRoutePatterns(ROUTE_SEGMENTS.protected),
    all: [
      ...createRoutePatterns(ROUTE_SEGMENTS.public),
      ...createRoutePatterns(ROUTE_SEGMENTS.protected),
    ],
  },
  getDefaultRouteForLocale: (locale: string) => `/${locale}/${DEFAULT_SECTION}`,
  getSignInRoute: (locale: string) => `/${locale}/auth/signin`,
  getSignOutRoute: (locale: string) => `/${locale}/auth/signout`,
  getErrorRoute: (locale: string) => `/${locale}/auth/error`,
  // Helpers
  isPublicRoute: (pathname: string, locale: string) => {
    const route = pathname.replace(`/${locale}`, '') || '/';
    return APP_ROUTES.patterns.public.some((pattern) => pattern.test(route));
  },

  isProtectedRoute: (pathname: string, locale: string) => {
    const route = pathname.replace(`/${locale}`, '') || '/';
    return APP_ROUTES.patterns.protected.some((pattern) => pattern.test(route));
  },

  isValidRoute: (pathname: string, locale: string) => {
    const route = pathname.replace(`/${locale}`, '') || '/';
    return route === '/' || APP_ROUTES.patterns.all.some((pattern) => pattern.test(route));
  },
};

// Configuración de rutas con sus traducciones y metadatos
export const ROUTE_CONFIG = {
  dashboard: {
    translationKey: 'home',
    icon: 'House',
    requiresAuth: true,
  },
  catalogos: {
    translationKey: 'catalogs',
    icon: 'FolderOpen',
    requiresAuth: true,
    children: {
      '[id]': {
        translationKey: 'catalog',
        dynamic: true,
        children: {
          detalles: {
            translationKey: 'details',
            icon: 'List',
          },
        },
      },
    },
  },
  usuarios: {
    translationKey: 'users',
    icon: 'Users',
    requiresAuth: true,
  },
  reportes: {
    translationKey: 'reports',
    icon: 'ChartPie',
    requiresAuth: true,
  },
  configuracion: {
    translationKey: 'settings',
    icon: 'Settings',
    requiresAuth: true,
  },
  perfil: {
    translationKey: 'profile',
    icon: 'User',
    requiresAuth: true,
  },
} as const;
