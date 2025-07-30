// ===============================
// TYPES
// ===============================

import { ReactNode } from 'react';
import * as LucideIcons from 'lucide-react';

export type HeaderActionVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

export type HeaderActionSize = 'default' | 'sm' | 'lg' | 'icon';

export interface HeaderAction {
  id: string;
  label: string;

  // Apariencia
  variant?: HeaderActionVariant;
  size?: HeaderActionSize;
  icon?: keyof typeof LucideIcons;
  iconPosition?: 'leading' | 'trailing';
  iconOnly?: boolean;

  // Comportamiento
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;

  // Visibilidad responsive
  hidden?: boolean;
  mobileHidden?: boolean;
  desktopHidden?: boolean;

  // Accesibilidad
  title?: string; // Para tooltips
  ariaLabel?: string;

  // Styling
  className?: string;
}

export interface PagesHeaderProps {
  // Contenido principal
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;

  // Actions
  showActions?: boolean;
  actions?: HeaderAction[];
  primaryAction?: HeaderAction; // Acción principal destacada
  actionsPosition?: 'right' | 'below'; // Posición de acciones

  // 🎨 Layout y estilo
  variant?: 'default' | 'compact' | 'spacious';
  size?: 'sm' | 'md' | 'lg';
  className?: string;

  // 📱 Responsive
  mobileCollapsed?: boolean;
  mobileStackActions?: boolean; // Si las acciones se apilan en mobile

  // ⏳ Estados
  loading?: boolean;
  disabled?: boolean;

  // 🔧 Contenido personalizado
  customActions?: ReactNode;
  headerExtra?: ReactNode;
  leftExtra?: ReactNode; // Contenido extra a la izquierda
  rightExtra?: ReactNode; // Contenido extra a la derecha

  // ♿ Accesibilidad
  ariaLabel?: string;
  role?: string;

  // 🎭 Animaciones
  showAnimation?: boolean;
}
