// Utils barrel - funciones comunes
export { cn } from './cn';
export { formatDate, formatDateTime } from './format';
// getDictionary is server-only and should be imported directly when needed
export {
  detectLocaleFromHeaders,
  getLocaleFromRequest,
  getCurrentLocaleFromPath,
  buildLocalizedPath,
  pathNeedsLocalePrefix,
  isLanguageRootPath,
  validateLocale,
  ensureLocaleCookie,
  saveLocalePreference,
  saveLocalePreferenceServer,
  getLocalePreferenceServer,
  getLanguageConfig,
  getAllLanguages,
  getI18nDebugInfo,
  isValidLocale,
  getNextLocale,
  getLocaleInfo,
  getLocalePreference,
} from './i18nUtils';
export {
  filterNavigationByRole,
  filterProjectsByRole,
  filterUserMenuByRole,
  filterSecondaryNavByRole,
  hasAccess,
  isAdmin,
  isManagerOrAbove,
} from './roleUtils';
export { ExportUtils } from './exportUtils';
export { buildQueryString, buildUrlWithParams, appendQueryParams } from './queryParams';
export {
  buildRouteConfigFromMenu,
  consolidateRouteConfigs,
  routeConfigUtils,
  type SuperRouteConfig,
  type DynamicRouteConfig,
} from './routeConfigBuilder';
