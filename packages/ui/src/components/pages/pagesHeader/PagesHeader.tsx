'use client';

import { Button } from '@components/ui/button';
import { memo } from 'react';
import { cn } from '@repo/shared';
import { HeaderAction, PagesHeaderProps } from '@repo/shared/types/PagesHeader';
import {
  Animations,
  Backgrounds,
  Borders,
  Responsive,
  Spacing,
  TextStyles,
} from '@/configs/DesignSystem';
import Icon from '@components/ui/Icon';
import { Separator } from '@components/ui/separator';

// ===============================
// 🎨 VARIANT CONFIGURATIONS
// ===============================

const headerVariants = {
  default: {
    container: cn(
      Spacing.padding.lg, // p-6
      'border-b',
    ),
    spacing: 'space-y-4 lg:space-y-0',
  },
  compact: {
    container: cn(
      Spacing.padding.md, // p-4
      'border-b',
    ),
    spacing: 'space-y-3 lg:space-y-0',
  },
  spacious: {
    container: cn('p-8', 'border-b'),
    spacing: 'space-y-5 lg:space-y-0',
  },
} as const;

const sizeVariants = {
  sm: {
    title: TextStyles.lg,
    subtitle: TextStyles.sm,
    buttonSize: 'sm' as const,
  },
  md: {
    title: cn(TextStyles['2xl'], 'sm:text-3xl'), // Responsive title
    subtitle: TextStyles.sm,
    buttonSize: 'default' as const,
  },
  lg: {
    title: cn(TextStyles['3xl'], 'sm:text-4xl'), // Responsive title
    subtitle: TextStyles.base,
    buttonSize: 'lg' as const,
  },
} as const;

interface ActionButtonProps {
  action: HeaderAction;
  size: 'sm' | 'default' | 'lg';
  loading?: boolean;
  onActionClick: (action: HeaderAction) => void;
  isMobile?: boolean;
}

const ActionButton = memo<ActionButtonProps>(function ActionButton({
  action,
  size,
  loading,
  onActionClick,
  isMobile = false,
}) {
  const handleClick = () => {
    if (action.href) {
      window.location.href = action.href;
    } else if (action.onClick) {
      onActionClick(action);
    }
  };

  // Determinar el color del icono según la variante del botón
  const getIconColorClass = (variant: string = 'outline') => {
    switch (variant) {
      case 'default':
      case 'destructive':
        return 'text-white'; // Iconos blancos para botones oscuros
      case 'secondary':
        return 'text-secondary-foreground';
      case 'outline':
      case 'ghost':
        return 'text-foreground';
      case 'link':
        return 'text-primary';
      default:
        return 'text-current'; // Hereda el color del texto del botón
    }
  };

  const iconColorClass = getIconColorClass(action.variant);

  return (
    <Button
      variant={action.variant || 'outline'}
      size={action.size || size}
      disabled={action.disabled || loading}
      onClick={handleClick}
      title={action.title || action.label}
      aria-label={action.ariaLabel || (action.iconOnly ? action.label : undefined)}
      className={cn(
        action.loading && 'pointer-events-none',
        isMobile && 'w-full sm:w-auto',
        action.className,
      )}
    >
      {action.icon && action.iconPosition !== 'trailing' && (
        <Icon
          name={action.icon}
          className={cn('h-4 w-4', iconColorClass, !action.iconOnly && 'mr-1.5 -ml-0.5')}
        />
      )}

      {!action.iconOnly && action.label}

      {action.icon && action.iconPosition === 'trailing' && (
        <Icon name={action.icon} className="-mr-0.5 ml-1.5 h-4 w-4" />
      )}

      {(loading || action.loading) && (
        <div className="ml-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
        </div>
      )}
    </Button>
  );
});

interface ActionsGroupProps {
  actions: HeaderAction[];
  primaryAction?: HeaderAction;
  customActions?: React.ReactNode;
  size: 'sm' | 'default' | 'lg';
  loading?: boolean;
  isMobile?: boolean;
  onActionClick: (action: HeaderAction) => void;
}

const ActionsGroup = memo<ActionsGroupProps>(function ActionsGroup({
  actions,
  primaryAction,
  customActions,
  size,
  loading,
  isMobile = false,
  onActionClick,
}) {
  return (
    <div
      className={cn(
        'flex items-center',
        isMobile
          ? cn('flex-col', Spacing.spaceY.sm, 'sm:flex-row sm:space-y-0', Spacing.spaceX.sm)
          : Spacing.spaceX.sm,
      )}
    >
      {/* Acciones normales */}
      {actions.map((action) => (
        <span
          key={action.id}
          className={cn(
            isMobile && 'w-full sm:w-auto',
            action.mobileHidden && Responsive.visibility.tabletUp,
            action.desktopHidden && Responsive.visibility.mobileOnly,
          )}
        >
          <ActionButton
            action={action}
            size={size}
            loading={loading}
            onActionClick={() => onActionClick(action)}
            isMobile={isMobile}
          />
        </span>
      ))}

      {/* Separador si hay acción primaria */}
      {actions.length > 0 && primaryAction && <Separator orientation="vertical" className="h-6" />}

      {/* Acción primaria */}
      {primaryAction && (
        <ActionButton
          action={{
            ...primaryAction,
            variant: primaryAction.variant || 'default',
          }}
          size={size}
          loading={loading}
          onActionClick={onActionClick}
          isMobile={isMobile}
        />
      )}

      {/* Acciones personalizadas */}
      {customActions}
    </div>
  );
});

// ===============================
// 🎯 MAIN COMPONENT
// ===============================

const PagesHeader = memo<PagesHeaderProps>(function PagesHeader({
  // Contenido
  title,
  subtitle,
  description,

  // Acciones
  showActions = true,
  actions = [],
  primaryAction,
  actionsPosition = 'right',

  // Layout
  variant = 'default',
  size = 'md',
  className,

  // Responsive
  mobileCollapsed = false,
  mobileStackActions = false,

  // Estados
  loading = false,
  disabled = false,

  // Contenido personalizado
  customActions,
  headerExtra,
  leftExtra,
  rightExtra,

  // Accesibilidad
  ariaLabel,
  role = 'banner',

  // Animaciones
  showAnimation = true,
}: PagesHeaderProps) {
  // ===============================
  // 🎛️ CONFIGURACIÓN
  // ===============================

  const variantConfig = headerVariants[variant];
  const sizeConfig = sizeVariants[size];

  // ===============================
  // 🎯 HANDLERS
  // ===============================

  const handleActionClick = (action: HeaderAction) => {
    if (disabled || loading) return;
    if (action.onClick) {
      action.onClick();
    }
  };

  // ===============================
  // 🏗️ RENDER HELPERS
  // ===============================

  const renderTitle = () => {
    if (!title) return null;

    return (
      <h1
        className={cn(
          TextStyles.heading,
          sizeConfig.title,
          'sm:truncate sm:tracking-tight',
          showAnimation && Animations.custom?.fadeIn,
        )}
      >
        {title}
      </h1>
    );
  };

  const renderSubtitle = () => {
    const content = subtitle || description;
    if (!content) return null;

    return (
      <div
        className={cn(
          'mt-2 flex flex-col sm:mt-1 sm:flex-row sm:flex-wrap sm:space-x-6',
          TextStyles.secondary,
          sizeConfig.subtitle,
          showAnimation && Animations.custom?.slideUp,
        )}
      >
        {typeof content === 'string' ? (
          <div className="mt-2 flex items-center">{content}</div>
        ) : (
          content
        )}
      </div>
    );
  };

  const renderLeftContent = () => (
    <div className="min-w-0 flex-1">
      {renderTitle()}
      {renderSubtitle()}
      {headerExtra}
      {leftExtra}
    </div>
  );

  const renderRightActions = () => {
    if (!showActions) return null;

    return (
      <div className="mt-5 flex lg:mt-0 lg:ml-4">
        <ActionsGroup
          actions={actions}
          primaryAction={primaryAction}
          customActions={customActions}
          size={sizeConfig.buttonSize}
          loading={loading}
          onActionClick={handleActionClick}
        />
        {rightExtra}
      </div>
    );
  };

  const renderBelowActions = () => {
    if (!showActions || actionsPosition !== 'below') return null;

    return (
      <div
        className={cn(
          'mt-4 pt-4',
          Borders.border.muted,
          'border-t',
          Responsive.flex.responsive, // flex flex-col md:flex-row
          'sm:items-center sm:justify-between',
          Spacing.gap.md,
        )}
      >
        <ActionsGroup
          actions={actions}
          primaryAction={primaryAction}
          customActions={customActions}
          size={sizeConfig.buttonSize}
          loading={loading}
          onActionClick={handleActionClick}
        />
      </div>
    );
  };

  // ===============================
  // 🏗️ MAIN RENDER
  // ===============================

  return (
    <header
      className={cn(
        variantConfig.container,
        Backgrounds.app, // bg-background
        showAnimation && Animations.transition?.all,
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      role={role}
      aria-label={ariaLabel || (typeof title === 'string' ? title : 'Encabezado de página')}
    >
      {/* Contenido principal con layout mejorado similar a Tailwind UI */}
      <div
        className={cn(
          actionsPosition === 'right' ? 'lg:flex lg:items-center lg:justify-between' : 'space-y-4',
        )}
      >
        {renderLeftContent()}

        {actionsPosition === 'right' && renderRightActions()}
      </div>

      {/* Acciones debajo */}
      {renderBelowActions()}
    </header>
  );
});

PagesHeader.displayName = 'PagesHeader';

export { PagesHeader };
export type { PagesHeaderProps, HeaderAction } from '@repo/shared/types/PagesHeader';
