import { tbToolbarFilterOption } from '@components/ui/data-table/types/tbToolbarFilterTypes';

export const activos: tbToolbarFilterOption<boolean>[] = [
  {
    value: true,
    label: 'Activos',
    icon: 'CircleCheck',
  },
  {
    value: false,
    label: 'Inactivo',
    icon: 'CircleX',
  },
];
