'use client';
import { Row } from '@tanstack/react-table';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';

export interface RowActions {
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onCopy?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
  onDelete?: (id: number) => void;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: RowActions;
}

export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
  const t = useTranslations('components.dataTableRowActions');
  const isActive = row.getValue('activo') as boolean;
  const itemId = row.getValue('id') as number;

  const handleAction = (actionFn?: (id: number) => void) => () => {
    if (actionFn) actionFn(itemId);
  };

  // 🔍 Verificar si hay acciones disponibles
  const hasActions =
    actions &&
    (actions.onView ||
      actions.onEdit ||
      actions.onCopy ||
      actions.onToggleStatus ||
      actions.onDelete);

  if (!hasActions) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <Icon name="MoreVertical" className="h-4 w-4" />
            <span className="sr-only">{t('openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {/* 🔍 VER - Solo aparece si está definida */}
          {actions?.onView && (
            <DropdownMenuItem onClick={handleAction(actions.onView)}>
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              {t('view')}
            </DropdownMenuItem>
          )}

          {/* ✏️ EDITAR */}
          {actions?.onEdit && (
            <DropdownMenuItem onClick={handleAction(actions.onEdit)}>
              <Icon name="Pencil" className="mr-2 h-4 w-4" />
              {t('edit')}
            </DropdownMenuItem>
          )}

          {/* 📋 COPIAR */}
          {actions?.onCopy && (
            <DropdownMenuItem onClick={handleAction(actions.onCopy)}>
              <Icon name="Copy" className="mr-2 h-4 w-4" />
              {t('makeCopy')}
            </DropdownMenuItem>
          )}

          {/* 🔄 TOGGLE STATUS */}
          {actions?.onToggleStatus && (
            <DropdownMenuItem onClick={handleAction(actions.onToggleStatus)}>
              <Icon name={isActive ? 'CircleX' : 'CircleCheck'} className="mr-2 h-4 w-4" />
              {isActive ? t('deactivate') : t('activate')}
            </DropdownMenuItem>
          )}

          {/* Separador antes de acciones destructivas */}
          {actions?.onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={handleAction(actions.onDelete)}
              >
                <Icon name="Trash2" className="mr-2 h-4 w-4" />
                {t('delete')}
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
