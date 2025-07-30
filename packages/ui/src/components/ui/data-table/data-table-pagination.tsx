'use client';

import { Table } from '@tanstack/react-table';
import { Button } from '@components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { useTranslations } from 'next-intl';
import Icon from '@components/ui/Icon';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const tp = useTranslations('components.pagination');
  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} {`${tp('of')} `}
        {table.getFilteredRowModel().rows.length} {tp('rowsSelected')}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{tp('itemsPerPage')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {tp('page')} {table.getState().pagination.pageIndex + 1} {`${tp('of')} `}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            title={tp('goToFirst')}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{tp('goToFirst')}</span>
            <Icon name="ChevronsLeft" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            title={tp('goToPrevious')}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{tp('goToPrevious')}</span>
            <Icon name="ChevronLeft" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            title={tp('goToNext')}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{tp('goToNext')}</span>
            <Icon name="ChevronRight" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            title={tp('goToLast')}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{tp('goToLast')}</span>
            <Icon name="ChevronsRight" />
          </Button>
        </div>
      </div>
    </div>
  );
}
