'use client';

import React from 'react';
import { DataTable } from '@repo/ui';
import { Table } from '@tanstack/react-table';
import { IMaestroCatalogo } from '@components/features/catalogos/types/MaestroCatalogosTypes';
import { DataTableToolbar } from '@repo/ui';
import { DataTablePagination } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { DataTableErrorView } from '@repo/ui';
import { activos } from '@repo/ui';
import { useTranslations } from 'next-intl';

interface CatalogoListProps {
  table: Table<IMaestroCatalogo>;
  error?: any | null;
  loading?: boolean;
  isExporting?: boolean;
  selectedRowsCount?: number;
  batchActions?: {
    exportSelected?: () => void;
    deleteSelected?: () => void;
  };
}

// Skeleton para loading
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

export function CatalogoList({
  table,
  error = null,
  loading = false,
  isExporting = false,
  selectedRowsCount,
  batchActions,
}: CatalogoListProps) {
  const t = useTranslations('catalogs');
  // Estado de error
  if (error) {
    return <DataTableErrorView error={error} className="rounded-lg border bg-card" />;
  }

  if (loading) {
    return <DataTableSkeleton />;
  }

  const facetedFilterOptionsCatalogos = [
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
        facetedFilterOptions={facetedFilterOptionsCatalogos}
        selectedRowsCount={selectedRowsCount}
        batchActions={batchActions}
      />
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}

export default CatalogoList;
