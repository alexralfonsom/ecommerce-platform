'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IMaestroCatalogoDetalle } from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { Checkbox } from '@repo/ui';
import { DataTableColumnHeader } from '@repo/ui';
import { DataTableRowActions } from '@repo/ui';
import { Badge } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { Icon } from '@repo/ui';

interface CatalogosDetallesActions {
  onView?: (detalleId: number) => void;
  onEdit?: (detalleId: number) => void;
  onCopy?: (detalleId: number) => void;
  onToggleStatus?: (detalleId: number) => void;
  onDelete?: (detalleId: number) => void;
}

// Componente para el badge de estado
function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations('catalogs.status');
  return (
    <div className="flex items-center justify-center">
      <Badge
        variant={isActive ? 'default' : 'secondary'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
          isActive
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-gray-200 bg-gray-50 text-gray-600'
        }`}
      >
        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {isActive ? t('active') : t('inactive')}
      </Badge>
    </div>
  );
}

// Componente para la celda del nombre con información adicional
function NombreCell({ detalle }: { detalle: IMaestroCatalogoDetalle }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-gray-900">{detalle.nombre}</div>
        <div className="flex items-center truncate text-xs text-gray-500">
          <Icon name="User" size={12} />
          {detalle.creadoPor}
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar el código con estilo
function CodigoCell({ codigo }: { codigo?: string }) {
  if (!codigo) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-400">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Badge variant="outline" className="font-mono text-xs">
        {codigo}
      </Badge>
    </div>
  );
}

// Componente para mostrar el evento con estilo
function EventoCell({ evento }: { evento?: string }) {
  if (!evento) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-400">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Badge variant="secondary" className="text-xs">
        {evento}
      </Badge>
    </div>
  );
}

// Componente para encabezados con traducción
function HeaderCellTranslation({ title }: { title: string }) {
  const t = useTranslations('catalogs.details');
  return (
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium">{t(title)}</span>
    </div>
  );
}

export const CatalogosDetallesColumns = (
  actions?: CatalogosDetallesActions,
): ColumnDef<IMaestroCatalogoDetalle>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="fields.id" />,
    size: 70,
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm font-medium">{row.getValue('id')}</div>
    ),
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="fields.name" />,
    size: 250,
    cell: ({ row }) => <NombreCell detalle={row.original} />,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'codigo',
    header: () => <HeaderCellTranslation title="fields.code" />,
    size: 120,
    cell: ({ row }) => <CodigoCell codigo={row.getValue('codigo')} />,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'evento',
    header: () => <HeaderCellTranslation title="fields.event" />,
    size: 120,
    cell: ({ row }) => <EventoCell evento={row.getValue('evento')} />,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'activo',
    header: () => <HeaderCellTranslation title="fields.status" />,
    size: 100,
    cell: ({ row }) => <StatusBadge isActive={row.getValue('activo')} />,
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      // Si no hay filtro aplicado, mostrar todas las filas
      if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
        return true;
      }
      // Si el valor es booleano, verificar si está en los valores seleccionados
      if (typeof value === 'boolean') {
        return filterValue.includes(value);
      }
      return false; // Si no es booleano, no coincide
    },
  },
  {
    accessorKey: 'fechaCreacion',
    header: () => <HeaderCellTranslation title="fields.createdDate" />,
    size: 150,
    cell: ({ row }) => {
      const date = new Date(row.getValue('fechaCreacion'));
      return (
        <div className="flex items-center justify-center text-sm">
          <time dateTime={date.toISOString()}>
            {date.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </div>
      );
    },
  },
  // Columnas comentadas que se pueden habilitar si es necesario
  // {
  //   accessorKey: 'fechaModificacion',
  //   header: () => <HeaderCellTranslation title="fields.modifiedDate" />,
  //   size: 150,
  //   cell: ({ row }) => {
  //     const date = row.getValue('fechaModificacion');
  //     if (!date) {
  //       return (
  //         <div className="flex items-center justify-center">
  //           <span className="text-gray-400 text-sm">-</span>
  //         </div>
  //       );
  //     }
  //     const dateObj = new Date(date as string);
  //     return (
  //       <div className="flex items-center justify-center text-sm">
  //         <time dateTime={dateObj.toISOString()}>
  //           {dateObj.toLocaleDateString('es-ES', {
  //             year: 'numeric',
  //             month: 'short',
  //             day: 'numeric',
  //           })}
  //         </time>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: 'modificadoPor',
  //   header: () => <HeaderCellTranslation title="fields.modifiedBy" />,
  //   size: 150,
  //   cell: ({ row }) => {
  //     const value: string = row.getValue('modificadoPor');
  //     if (!value || value.trim() === '') {
  //       return (
  //         <div className="flex items-center justify-center">
  //           <span className="text-gray-400 text-sm">-</span>
  //         </div>
  //       );
  //     }
  //     return (
  //       <div className="flex items-center justify-center text-sm">
  //         {value}
  //       </div>
  //     );
  //   },
  //   filterFn: 'includesString',
  // },
  {
    id: 'actions',
    header: () => <HeaderCellTranslation title="actions" />,
    cell: ({ row }) => <DataTableRowActions row={row} actions={actions} />,
    enableSorting: false,
    enableHiding: false,
  },
];
