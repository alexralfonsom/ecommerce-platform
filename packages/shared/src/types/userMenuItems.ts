import * as LucideIcons from 'lucide-react';
import { UserRole } from '@/lib/utils/roleUtils';

export interface UserMenuItem {
  name: string;
  href?: string;
  icon: keyof typeof LucideIcons;
  onClick?: () => void;
  allowedRoles?: UserRole[];
}

export interface UserMenuGroup {
  items: UserMenuItem[];
  allowedRoles?: UserRole[];
}

export type UserMenuEntry = UserMenuItem | UserMenuGroup;
