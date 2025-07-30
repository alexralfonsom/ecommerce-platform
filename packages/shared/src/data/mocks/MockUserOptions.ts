import { UserMenuEntry } from '@/types/userMenuItems';

export const mockUserOptions: UserMenuEntry[] = [
  { name: 'Upgrade to Pro', href: '#', icon: 'Sparkles' },
  {
    items: [
      { name: 'Account', href: '#', icon: 'BadgeCheck' },
      { name: 'Billing', href: '#', icon: 'CreditCard' },
      { name: 'Notifications', href: '#', icon: 'Bell' },
    ],
  },
  {
    name: 'Cerrar sesión',
    href: '/auth/signout', // Simple redirect - the signout page handles all the logic
    icon: 'LogOut',
  },
];
