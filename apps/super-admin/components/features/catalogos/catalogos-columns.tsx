'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IMaestroCatalogo } from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { Checkbox } from '@repo/ui';
import { DataTableColumnHeader } from '@repo/ui';
import { DataTableRowActions } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Icon } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui';
import { Button } from '@repo/ui';

interface CatalogosActions {
  onView?: (catalogoId: number) => void;
  onEdit?: (catalogoId: number) => void;
  onCopy?: (catalogoId: number) => void;
  onToggleStatus?: (catalogoId: number) => void;
  onDelete?: (catalogoId: number) => void;
  onViewDetails?: (catalogoId: number) => void;
}

// Hook para navegación (componente dentro de la celda)
function NavigateToDetailsButton({
  catalogoId,
  onViewDetails,
}: {
  catalogoId: number;
  onViewDetails?: (catalogoId: number) => void;
}) {
  const t = useTranslations('catalogs');

  if (!onViewDetails) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(catalogoId)}
            className="h-8 w-8 p-0 transition-colors duration-200 hover:bg-blue-50 hover:text-primary"
          >
            <Icon name="List" size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('viewDetails')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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

// ✅ Componente para la celda del nombre
function NombreCell({ catalogo }: { catalogo: IMaestroCatalogo }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{catalogo.nombre}</div>
        <div className="flex items-center gap-1 truncate text-sm text-gray-500 dark:text-gray-400">
          <Icon name="User" size={12} />
          {catalogo.creadoPor}
        </div>
      </div>
    </div>
  );
}

function HeaderCellTranslation({ title }: { title: string }) {
  const t = useTranslations('catalogs');
  return (
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium">{t(title)}</span>
    </div>
  );
}

export const CatalogosMaestrosColumns = (
  actions?: CatalogosActions,
): ColumnDef<IMaestroCatalogo>[] => [
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
      <div className="text-center font-mono text-sm font-medium">#{row.getValue('id')}</div>
    ),
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="fields.name" />,
    size: 250,
    cell: ({ row }) => <NombreCell catalogo={row.original} />,
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
  {
    id: 'details',
    header: () => (
      <div className="flex items-center justify-center">
        <HeaderCellTranslation title="viewDetails" />
      </div>
    ),
    size: 80,
    cell: ({ row }) => {
      const catalogo = row.original;
      return (
        <div className="flex justify-center">
          <NavigateToDetailsButton
            catalogoId={catalogo.id}
            onViewDetails={actions?.onViewDetails}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'fechaModificacion',
  //   header: 'Fecha de Modificación',
  //   size: 150,
  //   cell: ({ getValue }) => {
  //     const value = getValue<string>();
  //     if (!value) {
  //       return '';
  //     }
  //     const date = new Date(value);
  //     if (isNaN(date.getTime())) {
  //       return '';
  //     }
  //     return <time dateTime={date.toISOString()}>{date.toLocaleDateString('es-ES')}</time>;
  //   },
  // },
  // {
  //   accessorKey: 'modificadoPor',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Modificado por" />,
  //   cell: ({ row }) => {
  //     const value: string = row.getValue('modificadoPor');
  //     if (!value || value.trim() === '') {
  //       return null;
  //     }
  //
  //     return (
  //       <div className="flex items-center gap-2">
  //         <Avatar>
  //           <AvatarFallback>{value.charAt(0).toUpperCase()}</AvatarFallback>
  //         </Avatar>
  //         <span className="">{value}</span>
  //       </div>
  //     );
  //   },
  //   size: 150,
  // },
  {
    id: 'actions',
    header: () => <HeaderCellTranslation title="actions" />,
    size: 60,
    cell: ({ row }) => <DataTableRowActions row={row} actions={actions} />,
    // cell: ({ row }) => (
    //   <DataTableRowActions
    //     row={row}
    //     actions={{
    //       // 🔮 Solo aparece si está definida (para futuras funcionalidades)
    //       ...(actions?.onView && { onView: actions.onView }),
    //       onEdit: actions?.onEdit,
    //       onCopy: actions?.onCopy,
    //       onToggleStatus: actions?.onToggleStatus,
    //       onDelete: actions?.onDelete,
    //     }}
    //   />
    // ),
    enableSorting: false,
    enableHiding: false,
  },
];
