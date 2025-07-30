// src/types/navigation.ts
import * as LucideIcons from 'lucide-react';
import * as React from 'react';
import { UserRole } from '@/lib/utils/roleUtils';

export interface NavigationItem {
  name: string;
  href: string;
  icon: keyof typeof LucideIcons;
  current?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
  allowedRoles?: UserRole[]; // Roles que pueden acceder a este elemento
}

export interface Team {
  id: number;
  name: string;
  logo?: React.ElementType;
  href: string;
  initial: string;
  current?: boolean;
  badge?: string | number;
  allowedRoles?: UserRole[];
}

export interface BasicNavigationItem {
  name: string;
  href: string;
  icon: keyof typeof LucideIcons;
  allowedRoles?: UserRole[]; // Roles que pueden acceder a este elemento
}
