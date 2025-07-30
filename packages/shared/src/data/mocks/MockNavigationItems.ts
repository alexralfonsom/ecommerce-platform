import {NavigationItem, Team} from "@/types/navigation";
import {INotification} from "@/types/INotification";

export const mockNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'House',
    current: true,
    children: [
      {
        name: 'Resumen',
        href: '/dashboard/resumen',
        icon: 'BarChart',
        current: true,
        badge: '3',
      },
      {
        name: 'Actividad',
        href: '/dashboard/actividad',
        icon: 'Activity',
        current: false,
      },
    ],
  },
  {
    name: 'Catálogos',
    href: '/catalogos',
    icon: 'FolderOpen',
    current: false,
    children: [
      {
        name: 'Maestros',
        href: '/catalogos/productos',
        icon: 'Box',
        current: false,
      },
      {
        name: 'Maestro Detalles',
        href: '/catalogos/clientes',
        icon: 'Users',
        current: false,
      },
    ],
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: 'User',
    current: false,
    badge: '2',
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: 'ChartPie',
    current: false,
  },
  {
    name: 'Calendario',
    href: '/calendario',
    icon: 'Calendar',
    current: false,
  },
];

export const mockNotifications: INotification[] = [
  {
    id: '1',
    title: 'Nuevo catálogo creado',
    message: 'Se ha creado el catálogo "Productos Electrónicos" exitosamente.',
    type: 'success',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    read: false,
  },
  {
    id: '2',
    title: 'Error en sincronización',
    message: 'No se pudo sincronizar el catálogo "Servicios". Revisar configuración.',
    type: 'error',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    read: false,
  },
  {
    id: '3',
    title: 'Actualización disponible',
    message: 'Nueva versión del sistema disponible. Se recomienda actualizar.',
    type: 'info',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    read: true,
  },
];

export const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Desarrollo',
    href: '/teams/desarrollo',
    initial: 'D',
    current: false,
  },
  {
    id: 2,
    name: 'Producción',
    href: '/teams/produccion',
    initial: 'P',
    current: false,
    badge: '3',
  },
  {
    id: 3,
    name: 'Testing',
    href: '/teams/testing',
    initial: 'T',
    current: false,
  },
];
