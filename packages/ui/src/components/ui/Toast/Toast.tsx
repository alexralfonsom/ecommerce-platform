// src/components/ui/Toast/Toast.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@repo/shared';
import Icon from '@components/ui/Icon';
import { Button } from '@components/ui/button';
import {
  Animations,
  Backgrounds,
  Borders,
  TextStyles,
  ThemeColors,
} from '../../../configs/DesignSystem';
import * as LucideIcons from 'lucide-react';

// ===============================
// TIPOS
// ===============================
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  href?: string;
  target?: '_blank' | '_self';
  className?: string;
}

export interface ToastProps {
  // Contenido
  title?: string;
  description?: string;
  children?: ReactNode; // Para contenido personalizado

  // Apariencia
  variant?: 'success' | 'danger' | 'warning' | 'info';
  icon?: keyof typeof LucideIcons | false; // false para ocultar icono
  showCloseButton?: boolean;

  // Interacción
  actions?: ToastAction[];
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number; // en milisegundos

  // Animación
  transition?: keyof typeof Animations.transition;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';

  // Styling
  className?: string;
  showAccentBorder?: boolean;

  // Estado
  id?: string;
  isVisible?: boolean;
}

// ===============================
// CONFIGURACIÓN DE ICONOS POR DEFECTO
// ===============================
const DEFAULT_ICONS = {
  success: 'CheckCircle',
  danger: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
} as const;

// ===============================
// TOAST STYLES HELPER (Actualizado)
// ===============================
const createToastStyles = (
  variant: 'success' | 'danger' | 'warning' | 'info',
  showAccentBorder: boolean,
) => {
  // ✅ Usando el nuevo sistema de colores
  const variantColors = {
    success: ThemeColors.success,
    danger: ThemeColors.danger,
    warning: ThemeColors.warning,
    info: ThemeColors.primary, // Usando primary para info
  };

  const colors = variantColors[variant];

  return {
    container: cn(
      // Base layout
      'relative flex items-start gap-3 min-w-80 max-w-md',

      // ✅ Usando nuevo sistema de backgrounds y borders
      Backgrounds.elevated, // bg-card shadow-md border border-border

      // Forma y efectos
      Borders.radius.lg, // rounded-lg
      'px-4 py-3', // Padding directo

      // Transición suave
      Animations.transition.all, // transition-all duration-200 ease-in-out

      // Accent border lateral si está habilitado
      showAccentBorder && `border-l-4 ${colors.border}`,

      // Hover effect sutil
      'hover:scale-[1.01]',
    ),

    iconContainer: cn(
      'flex-shrink-0 w-5 h-5 mt-0.5',
      colors.text, // Color del icono según la variante
    ),

    content: cn(
      'flex-1 min-w-0', // min-w-0 para permitir text-overflow
    ),

    title: cn(
      TextStyles.base, // text-base
      TextStyles.semibold, // font-semibold
      TextStyles.primary, // text-foreground
      'leading-tight',
    ),

    description: cn(
      TextStyles.sm, // text-sm
      TextStyles.secondary, // text-muted-foreground
      'mt-1 leading-relaxed',
    ),

    actions: cn(
      'flex gap-2 mt-3 pt-2',
      Borders.border.muted, // border-border/50
      'border-t',
    ),

    closeButton: cn(
      'flex-shrink-0 w-5 h-5 mt-0.5',
      TextStyles.muted, // text-muted-foreground/70
      'hover:text-foreground',
      Animations.transition.colors, // transition-colors
      'cursor-pointer',
    ),
  };
};

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
const Toast = ({
  // Contenido
  title,
  description,
  children,

  // Apariencia
  variant = 'info',
  icon,
  showCloseButton = true,

  // Interacción
  actions = [],
  onClose,
  autoClose = true,
  autoCloseDelay = 4000,

  // Styling
  className,
  showAccentBorder = true,

  // Estado
  isVisible = true,
  ...props
}: ToastProps) => {
  // ===============================
  // 🎣 HOOKS
  // ===============================
  const [isClosing, setIsClosing] = useState(false);

  // Auto-close timer
  useEffect(() => {
    if (!autoClose || !isVisible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay, isVisible]);

  // ===============================
  // 🎛️ HANDLERS
  // ===============================
  const handleClose = () => {
    setIsClosing(true);
    // Delay para permitir animación de salida
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  // ===============================
  // 🎨 STYLES
  // ===============================
  const styles = createToastStyles(variant, showAccentBorder);

  // Determinar icono a mostrar
  const iconToShow = icon === false ? null : icon || DEFAULT_ICONS[variant];

  // ===============================
  // 🏗️ RENDER
  // ===============================
  if (!isVisible && !isClosing) return null;

  return (
    <div
      className={cn(
        styles.container,
        // Animaciones de entrada/salida
        isVisible && !isClosing && Animations.custom.slideInFromRight,
        isClosing && Animations.custom.slideOutToRight,
        className,
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {/* 🎨 Icono */}
      {iconToShow && (
        <div className={styles.iconContainer}>
          <Icon name={iconToShow} size={20} />
        </div>
      )}

      {/* 📝 Contenido */}
      <div className={styles.content}>
        {/* Contenido personalizado o título/descripción */}
        {children ? (
          children
        ) : (
          <>
            {title && <div className={styles.title}>{title}</div>}
            {description && <div className={styles.description}>{description}</div>}
          </>
        )}

        {/* 🎯 Acciones */}
        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className={action.className}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* ❌ Botón de cerrar */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Cerrar notificación"
        >
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
