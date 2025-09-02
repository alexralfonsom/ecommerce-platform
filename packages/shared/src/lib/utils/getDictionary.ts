// Type Imports
import type { Locale } from '@configs/i18n';
import 'server-only';

const dictionaries = {
  en: () => import('@data/dictionaries/en.json').then((module) => module.default),
  es: () => import('@data/dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  try {
    return await dictionaries[locale]();
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error);
    // Fallback al idioma por defecto
    return await dictionaries['es']();
  }
};
