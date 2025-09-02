// src/components/layout/languageSwitcher.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { memo, useCallback, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { i18n, Locale } from '@repo/shared/configs/i18n';
import {
  buildLocalizedPath,
  getLanguageConfig,
  saveLocalePreference,
} from '@repo/shared/lib/utils';
import Icon from '@components/ui/Icon';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { cn } from '@repo/shared';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = memo<LanguageSwitcherProps>(function LanguageSwitcher({
  className = '',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const switchLanguage = useCallback(
    (newLocale: Locale) => {
      if (newLocale === currentLocale) return;

      startTransition(() => {
        try {
          // Construir la nueva ruta
          const newPath = buildLocalizedPath(pathname, newLocale);

          // Preservar search params (incluido callbackUrl)
          const currentSearchParams = new URLSearchParams(searchParams.toString());

          // Si hay callbackUrl, actualizarlo con el nuevo idioma
          const callbackUrl = currentSearchParams.get('callbackUrl');
          if (callbackUrl) {
            const updatedCallbackUrl = buildLocalizedPath(callbackUrl, newLocale);
            currentSearchParams.set('callbackUrl', updatedCallbackUrl);
          }

          // Construir URL final con search params
          const finalUrl = currentSearchParams.toString()
            ? `${newPath}?${currentSearchParams.toString()}`
            : newPath;

          // Guardar preferencia en cookie
          saveLocalePreference(newLocale);

          // Navegar a la nueva ruta
          router.replace(finalUrl);
        } catch (error) {
          console.error('Error switching language:', error);
          // En caso de error, intentar navegación simple
          router.push(`/${newLocale}`);
        }
      });
    },
    [currentLocale, pathname, searchParams, router],
  );

  const currentLangConfig = getLanguageConfig(currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('group gap-2 data-[state=open]:bg-accent', className)}
          disabled={isPending}
          aria-label={`Current language: ${currentLangConfig.nativeName}. Click to change language`}
        >
          <span className="mr-2 text-lg" aria-hidden="true">
            {currentLangConfig.flag}
          </span>
          <span className="hidden lg:flex lg:items-center">
            <span aria-hidden="true" className="ml-1">
              {currentLangConfig.code}
              {isPending && <span className="ml-2 animate-pulse">⏳</span>}
            </span>
          </span>
          <Icon
            name="ChevronDown"
            aria-hidden="true"
            className="h-3 w-3 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px]"
        role="menu"
        aria-label="Language selection"
      >
        {i18n.locales.map((locale) => {
          const langConfig = getLanguageConfig(locale);
          const isActive = currentLocale === locale;

          return (
            <DropdownMenuItem
              key={locale}
              disabled={isActive || isPending}
              onClick={() => switchLanguage(locale)}
              className={cn(
                'cursor-pointer focus:outline-none',
                isActive && 'bg-accent/50 text-accent-foreground',
              )}
              role="menuitem"
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="mr-3 text-lg" aria-hidden="true">
                {langConfig.flag}
              </span>
              <div className="flex flex-1 flex-col">
                {`${langConfig.code} - ${langConfig.nativeName}`}
              </div>
              {isActive && (
                <Icon name="Check" className="ml-2 h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default LanguageSwitcher;
