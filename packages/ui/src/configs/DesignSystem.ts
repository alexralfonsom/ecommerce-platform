// ===============================
// 🎨 DESIGN SYSTEM - UTILITY CLASSES
// Sistema limpio y organizado para el proyecto
// ===============================

// ===============================
// 🎯 COLORES DE TEMA (Tu nueva paleta azul)
// ===============================

export const ThemeColors = {
  // 🔵 Primary (usando tu paleta azul)
  primary: {
    bg: 'bg-primary hover:bg-primary/90',
    text: 'text-primary-foreground',
    border: 'border-primary',
    full: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },

  // ⚪ Secondary
  secondary: {
    bg: 'bg-secondary hover:bg-secondary/80',
    text: 'text-secondary-foreground',
    border: 'border-secondary',
    full: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  },

  // 🔴 Destructive/Danger
  danger: {
    bg: 'bg-destructive hover:bg-destructive/90',
    text: 'text-destructive-foreground',
    border: 'border-destructive',
    full: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
  },

  // 🟢 Success (usando colores Tailwind estándar)
  success: {
    bg: 'bg-green-600 hover:bg-green-700',
    text: 'text-white',
    border: 'border-green-600',
    full: 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600',
  },

  // 🟡 Warning (usando colores Tailwind estándar)
  warning: {
    bg: 'bg-yellow-500 hover:bg-yellow-600',
    text: 'text-white',
    border: 'border-yellow-500',
    full: 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
  },

  // 👻 Ghost/Subtle
  ghost: {
    bg: 'hover:bg-accent hover:text-accent-foreground',
    text: 'text-foreground',
    border: 'border-transparent',
    full: 'hover:bg-accent hover:text-accent-foreground text-foreground',
  },

  // 📄 Outline
  outline: {
    bg: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    text: 'text-foreground',
    border: 'border-input',
    full: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  },
} as const;

// ===============================
// 🏠 FONDOS Y SUPERFICIES
// ===============================

export const Backgrounds = {
  // Fondos principales usando shadcn variables
  app: 'bg-background',
  card: 'bg-card',
  popover: 'bg-popover',
  muted: 'bg-muted',
  accent: 'bg-accent',

  // Fondos con bordes
  cardWithBorder: 'bg-card border border-border',
  mutedWithBorder: 'bg-muted border border-border',

  // Fondos con sombras
  elevated: 'bg-card shadow-md border border-border',
  floating: 'bg-card shadow-lg border border-border',
} as const;

// ===============================
// 📝 TEXTO Y TIPOGRAFÍA
// ===============================

export const TextStyles = {
  // Colores de texto usando shadcn
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  muted: 'text-muted-foreground/70',
  accent: 'text-accent-foreground',

  // Tamaños de texto
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',

  // Pesos de fuente
  thin: 'font-thin',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',

  // Combinaciones comunes
  heading: 'text-foreground font-semibold',
  body: 'text-foreground',
  caption: 'text-muted-foreground text-sm',
  label: 'text-foreground font-medium',
} as const;

// ===============================
// 📐 ESPACIADO Y LAYOUT
// ===============================

export const Spacing = {
  // Gaps
  gap: {
    none: 'gap-0',
    xs: 'gap-1', // 4px
    sm: 'gap-2', // 8px
    md: 'gap-4', // 16px
    lg: 'gap-6', // 24px
    xl: 'gap-8', // 32px
  },

  // Padding
  padding: {
    none: 'p-0',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Margin
  margin: {
    none: 'm-0',
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },

  // Space between (para stacks)
  spaceY: {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },

  spaceX: {
    none: 'space-x-0',
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
} as const;

// ===============================
// 🎨 BORDES Y EFECTOS
// ===============================

export const Borders = {
  // Border radius
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  },

  // Border width y color
  border: {
    none: 'border-0',
    default: 'border border-border',
    thick: 'border-2 border-border',
    primary: 'border border-primary',
    destructive: 'border border-destructive',
    muted: 'border-border/50', // shadcn border con transparencia
  },

  // Shadows
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
} as const;

// ===============================
// 🎭 ANIMACIONES Y TRANSICIONES
// ===============================

export const Animations = {
  // Transiciones
  transition: {
    none: 'transition-none',
    all: 'transition-all duration-200 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
    opacity: 'transition-opacity duration-200 ease-in-out',
    shadow: 'transition-shadow duration-200 ease-in-out',
  },

  // Animaciones custom (las que definiste)
  custom: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scaleIn: 'animate-scale-in',
    slideInFromRight: 'animate-in slide-in-from-right-4 fade-in',
    slideInFromLeft: 'animate-in slide-in-from-left-4 fade-in',
    slideOutToLeft: 'animate-out slide-out-to-left-4 fade-out',
    slideOutToRight: 'animate-out slide-out-to-right-4 fade-out',
    spin: 'animate-spin',
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-lg',
  },
} as const;

// ===============================
// 🧩 COMPONENTES PRE-CONFIGURADOS
// ===============================

export const Components = {
  // Button variants (usando CVA style)
  button: {
    primary: `${ThemeColors.primary.full} ${Spacing.padding.md} ${Borders.radius.md} ${Animations.transition.colors} font-medium`,
    secondary: `${ThemeColors.secondary.full} ${Spacing.padding.md} ${Borders.radius.md} ${Animations.transition.colors} font-medium`,
    outline: `${ThemeColors.outline.full} ${Spacing.padding.md} ${Borders.radius.md} ${Animations.transition.colors} font-medium`,
    ghost: `${ThemeColors.ghost.full} ${Spacing.padding.md} ${Borders.radius.md} ${Animations.transition.colors} font-medium`,
    danger: `${ThemeColors.danger.full} ${Spacing.padding.md} ${Borders.radius.md} ${Animations.transition.colors} font-medium`,
  },

  // Card variants
  card: {
    default: `${Backgrounds.card} ${Spacing.padding.lg} ${Borders.radius.lg} ${Borders.border.default}`,
    elevated: `${Backgrounds.elevated} ${Spacing.padding.lg} ${Borders.radius.lg}`,
    floating: `${Backgrounds.floating} ${Spacing.padding.lg} ${Borders.radius.xl}`,
  },

  // Input base
  input: {
    default: `${Backgrounds.app} ${TextStyles.base} ${Borders.border.default} ${Borders.radius.md} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring`,
  },

  // Container layouts
  container: {
    page: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'max-w-4xl mx-auto px-4 sm:px-6',
    content: 'max-w-2xl mx-auto px-4',
  },
} as const;

// ===============================
// 🛠️ HELPER FUNCTIONS
// ===============================

// Función para obtener estilos de tema
export const getThemeStyles = (variant: keyof typeof ThemeColors) => {
  return ThemeColors[variant].full;
};

// Función para crear un componente con spacing
export const createSpacedComponent = (
  base: string,
  padding: keyof typeof Spacing.padding = 'md',
  gap: keyof typeof Spacing.gap = 'md',
) => {
  return `${base} ${Spacing.padding[padding]} ${Spacing.gap[gap]}`;
};

// Función para crear un card completo
export const createCard = (
  variant: keyof typeof Components.card = 'default',
  animation: boolean = true,
) => {
  const baseCard = Components.card[variant];
  const animationClass = animation ? Animations.transition.all : '';
  return `${baseCard} ${animationClass}`;
};

// ===============================
// 📱 RESPONSIVE UTILITIES
// ===============================

export const Responsive = {
  // Grid layouts comunes
  grid: {
    mobile: 'grid grid-cols-1',
    tablet: 'grid grid-cols-1 md:grid-cols-2',
    desktop: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },

  // Flex layouts
  flex: {
    column: 'flex flex-col',
    row: 'flex flex-row',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    responsive: 'flex flex-col md:flex-row',
  },

  // Hide/show en breakpoints
  visibility: {
    mobileOnly: 'block md:hidden',
    tabletUp: 'hidden md:block',
    desktopOnly: 'hidden lg:block',
  },
} as const;

// ===============================
// 📤 TYPES (Para TypeScript)
// ===============================

export type ThemeColorVariant = keyof typeof ThemeColors;
export type BackgroundVariant = keyof typeof Backgrounds;
export type TextSizeVariant = keyof typeof TextStyles;
export type SpacingVariant = keyof typeof Spacing.gap;
export type BorderRadiusVariant = keyof typeof Borders.radius;
export type AnimationVariant = keyof typeof Animations.transition;

// ===============================
// 🎯 EXPORT DEFAULT (Para imports fáciles)
// ===============================

export const socialMediaIcons = {
  apple:
    "data:image/svg+xml;charset=utf-8,%3Csvg width='170' xmlns='http://www.w3.org/2000/svg' height='170'%3E%3Cpath d='M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z'/%3E%3C/svg%3E",
  google:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48'%3E%3Cdefs%3E%3Cpath id='a' d='M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z'/%3E%3C/defs%3E%3CclipPath id='b'%3E%3Cuse xlink:href='%23a' overflow='visible'/%3E%3C/clipPath%3E%3Cpath clip-path='url(%23b)' fill='%23FBBC05' d='M0 37V11l17 13z'/%3E%3Cpath clip-path='url(%23b)' fill='%23EA4335' d='M0 11l17 13 7-6.1L48 14V0H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%2334A853' d='M0 37l30-23 7.9 1L48 0v48H0z'/%3E%3Cpath clip-path='url(%23b)' fill='%234285F4' d='M48 48L17 24l-4-3 35-10z'/%3E%3C/svg%3E",
  microsoft:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='21' height='21'%3E%3Cpath fill='%23f25022' d='M1 1h9v9H1z'/%3E%3Cpath fill='%2300a4ef' d='M1 11h9v9H1z'/%3E%3Cpath fill='%237fba00' d='M11 1h9v9h-9z'/%3E%3Cpath fill='%23ffb900' d='M11 11h9v9h-9z'/%3E%3C/svg%3E",
};

export const generalIconsSVG = {
  emptyUser:
    "data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-circle-user-round-icon lucide-circle-user-round'><path d='M18 20a6 6 0 0 0-12 0'/><circle cx='12' cy='10' r='4'/><circle cx='12' cy='12' r='10'/></svg>",
};

export default {
  ThemeColors,
  Backgrounds,
  TextStyles,
  Spacing,
  Borders,
  Animations,
  Components,
  Responsive,
  // Helper functions
  getThemeStyles,
  createSpacedComponent,
  createCard,
};
