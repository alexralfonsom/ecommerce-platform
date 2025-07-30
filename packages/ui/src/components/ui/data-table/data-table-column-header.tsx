import { Column } from '@tanstack/react-table';
import { cn } from '@repo/shared';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const th = useTranslations('catalogs');
  const t = useTranslations('components.table');
  if (!column.getCanSort()) {
    return <div className={cn(className, 'flex items-center justify-center')}>{th(title)}</div>;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8">
            <span>{th(title)}</span>
            {column.getIsSorted() === 'desc' ? (
              <Icon name="ArrowDown" className="h-3 w-3" />
            ) : column.getIsSorted() === 'asc' ? (
              <Icon name="ArrowUp" className="h-3 w-3" />
            ) : (
              <Icon name="ChevronsUpDown" className="h-3 w-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <Icon name="ArrowUp" />
            {t('sortAsc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <Icon name="ArrowDown" />
            {t('sortDesc')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <Icon name="EyeOff" />
            {t('sortHide')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
