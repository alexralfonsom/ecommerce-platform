// src/types/navigation.ts
import * as LucideIcons from 'lucide-react';
import * as React from 'react';
import { UserRole } from '@/lib/utils/roleUtils';

/**
 * Propiedades básicas de un elemento de navegación
 */
export interface BasicNavigationItem {
  name: string;
  href: string;
  icon: keyof typeof LucideIcons;
  allowedRoles?: UserRole[]; // Roles que pueden acceder a este elemento
}

/**
 * Elemento de navegación completo que extiende las propiedades básicas
 * con funcionalidades adicionales como estado actual, badges y jerarquía
 */
export interface NavigationItem extends BasicNavigationItem {
  current?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}
