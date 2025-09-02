'use client';
import { flexRender, useReactTable } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { useTranslations } from 'next-intl';
import React from 'react';

interface DataTableProps<TData, TValue> {
  table: ReturnType<typeof useReactTable<TData>>;
}

export function DataTable<TData, TValue>({ table }: DataTableProps<TData, TValue>) {
  const t = useTranslations('components.table');

  return (
    <React.Fragment>
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-10 h-12 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                  className="h-24 text-center"
                >
                  {t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </React.Fragment>
  );
}
