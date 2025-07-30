'use client';

import { Table } from '@tanstack/react-table';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { DataTableViewOptions } from '@components/ui/data-table/data-table-view-options';
import { DataTableFacetedFilter } from '@components/ui/data-table/data-table-faceted-filter';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';
import { ExportDropdown } from '@components/ui/ExportDropdown';
import { ExportFormat } from '@repo/shared/types/export';
import { tbToolbarFilterTypes } from '@components/ui/data-table/types/tbToolbarFilterTypes';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  selectedRowsCount?: number;
  isExporting?: boolean;
  searchColumn?: string;
  facetedFilterOptions?: tbToolbarFilterTypes[];
  batchActions?: {
    exportSelected?: (format?: ExportFormat) => void;
    deleteSelected?: () => void;
  };
}

export function DataTableToolbar<TData>({
  table,
  selectedRowsCount = 0,
  isExporting = false,
  batchActions,
  searchColumn,
  facetedFilterOptions = [],
}: DataTableToolbarProps<TData>) {
  const tht = useTranslations('components.dataTableHeaderToolbar');
  // ✅ MANEJO SEGURO DEL ESTADO
  let isFiltered = false;
  let searchNameColumn = null;

  try {
    isFiltered = table.getState().columnFilters.length > 0;
    searchNameColumn = searchColumn ? table.getColumn(searchColumn) : null;
  } catch (error) {
    return <div className="p-4 text-red-500">{tht('errorTableStatus')}</div>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <div className="grid grid-cols-1">
            <Input
              placeholder={tht('placeHolderSearch', { searchColumn: searchColumn })}
              value={(searchNameColumn?.getFilterValue() as string) ?? ''}
              onChange={(event) => searchNameColumn?.setFilterValue(event.target.value)}
              className="col-start-1 row-start-1 w-[200px] pl-8 pr-4 sm:text-sm lg:w-[300px]"
              aria-label="Search"
            />
            <Icon
              name="Search"
              className="pointer-events-none col-start-1 row-start-1 ml-2 self-center"
              size={16}
            />
          </div>
        )}
        {facetedFilterOptions &&
          facetedFilterOptions.length > 0 &&
          facetedFilterOptions.map((filter) => (
            <DataTableFacetedFilter
              key={filter.id}
              column={table.getColumn(filter.id)}
              title={filter.title}
              options={filter.options}
            />
          ))}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="px-2 lg:px-3"
          >
            {tht('reset')}
            <Icon name="X" />
          </Button>
        )}
        {batchActions?.exportSelected && (
          <ExportDropdown
            onExport={(format) => batchActions.exportSelected?.(format)}
            disabled={selectedRowsCount === 0}
            isExporting={isExporting}
            selectedCount={selectedRowsCount}
            showSelectedOnly={true}
          />
        )}

        {batchActions?.deleteSelected && (
          <Button
            variant="destructive"
            size="sm"
            onClick={batchActions.deleteSelected}
            disabled={selectedRowsCount === 0}
          >
            <Icon name="Trash2" size="4xl" className="mr-2" color="white" />
            {tht('deletedSelectedButton')} ({selectedRowsCount})
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
