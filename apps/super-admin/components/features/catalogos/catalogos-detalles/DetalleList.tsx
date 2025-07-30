'use client';

import { IMaestroCatalogoDetalle } from '@components/features/catalogos/types/MaestroCatalogosDetalleTypes';
import { DataTable } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { Table } from '@tanstack/react-table';
import { Skeleton } from '@repo/ui';
import React from 'react';
import { DataTableErrorView } from '@repo/ui';
import { DataTableToolbar } from '@repo/ui';
import { DataTablePagination } from '@repo/ui';
import { activos } from '@repo/ui';

interface DetallesListProps {
  table: Table<IMaestroCatalogoDetalle>;
  error?: any | null;
  loading?: boolean;
  isExporting?: boolean;
  selectedRowsCount?: number;
  batchActions?: {
    exportSelected?: () => void;
    deleteSelected?: () => void;
  };
}

const DataTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-8 w-[100px]" />
    </div>
    <div className="rounded-md border">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-8 w-[300px]" />
    </div>
  </div>
);

export function DetallesList({
  table,
  error = null,
  loading = false,
  isExporting = false,
  selectedRowsCount,
  batchActions,
}: DetallesListProps) {
  const t = useTranslations('catalogs');

  // Estado de error
  if (error) {
    return <DataTableErrorView error={error} className="rounded-lg border bg-card" />;
  }

  if (loading) {
    return <DataTableSkeleton />;
  }

  const facetedFilterOptionsDetalles = [
    {
      id: 'activo',
      title: t('fields.status'),
      options: activos,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        isExporting={isExporting}
        searchColumn="nombre"
        facetedFilterOptions={facetedFilterOptionsDetalles}
        selectedRowsCount={selectedRowsCount}
        batchActions={batchActions}
      />
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}
