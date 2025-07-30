import type { ExportColumn, ExtendedExportConfig } from '@repo/shared/types/export';

// Configuración de exportación para Catálogos Maestros
export const catalogosMaestrosExportColumns: ExportColumn[] = [
  {
    key: 'id',
    label: 'ID',
    dataType: 'number',
  },
  {
    key: 'nombre',
    label: 'Nombre',
    dataType: 'string',
  },
  {
    key: 'activo',
    label: 'Estado',
    dataType: 'boolean',
  },
  {
    key: 'fechaCreacion',
    label: 'Fecha de Creación',
    dataType: 'date',
  },
  {
    key: 'fechaModificacion',
    label: 'Fecha de Modificación',
    dataType: 'date',
  },
];

export const catalogosMaestrosExportConfig: ExtendedExportConfig = {
  filename: 'catalogos_maestros',
  title: 'Catálogos Maestros',
  subtitle: `Exportado el ${new Date().toLocaleDateString('es-ES')}`,
  columns: catalogosMaestrosExportColumns,
  includeHeaders: true,
  pdfOptions: {
    orientation: 'landscape',
    fontSize: 9,
    margins: { top: 25, bottom: 20, left: 15, right: 15 },
  },
  excelOptions: {
    sheetName: 'Catálogos Maestros',
    autoWidth: true,
    headerStyle: {
      bold: true,
      backgroundColor: '#4F46E5',
      color: '#FFFFFF',
    },
  },
  csvOptions: {
    delimiter: ',',
    encoding: 'utf-8',
  },
};

// Configuración de exportación para Catálogos Detalles
export const catalogosDetallesExportColumns: ExportColumn[] = [
  {
    key: 'id',
    label: 'ID',
    dataType: 'number',
  },
  {
    key: 'nombre',
    label: 'Nombre',
    dataType: 'string',
  },
  {
    key: 'codigo',
    label: 'Código',
    dataType: 'string',
  },
  {
    key: 'evento',
    label: 'Evento',
    dataType: 'string',
  },
  {
    key: 'activo',
    label: 'Estado',
    dataType: 'boolean',
  },
  {
    key: 'idMaestro',
    label: 'ID Maestro',
    dataType: 'number',
  },
  {
    key: 'fechaCreacion',
    label: 'Fecha de Creación',
    dataType: 'date',
  },
];

export const catalogosDetallesExportConfig: ExtendedExportConfig = {
  filename: 'catalogos_detalles',
  title: 'Catálogos Detalles',
  subtitle: `Exportado el ${new Date().toLocaleDateString('es-ES')}`,
  columns: catalogosDetallesExportColumns,
  includeHeaders: true,
  pdfOptions: {
    orientation: 'landscape',
    fontSize: 8,
    margins: { top: 25, bottom: 20, left: 10, right: 10 },
  },
  excelOptions: {
    sheetName: 'Catálogos Detalles',
    autoWidth: true,
    headerStyle: {
      bold: true,
      backgroundColor: '#059669',
      color: '#FFFFFF',
    },
  },
  csvOptions: {
    delimiter: ',',
    encoding: 'utf-8',
  },
};

// Función helper para generar configuración dinámica
export function createExportConfig(
  entityName: string,
  columns: ExportColumn[],
  overrides?: Partial<ExtendedExportConfig>,
): ExtendedExportConfig {
  return {
    filename: `${entityName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`,
    title: entityName,
    subtitle: `Exportado el ${new Date().toLocaleDateString('es-ES')}`,
    columns,
    includeHeaders: true,
    pdfOptions: {
      orientation: 'landscape',
      fontSize: 9,
      margins: { top: 25, bottom: 20, left: 15, right: 15 },
    },
    excelOptions: {
      sheetName: entityName,
      autoWidth: true,
      headerStyle: {
        bold: true,
        backgroundColor: '#6B7280',
        color: '#FFFFFF',
      },
    },
    csvOptions: {
      delimiter: ',',
      encoding: 'utf-8',
    },
    ...overrides,
  };
}
