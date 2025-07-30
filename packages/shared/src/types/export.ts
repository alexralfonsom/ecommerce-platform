export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportColumn {
  key: string;
  label: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date';
  transform?: (value: any) => string;
}

export interface ExportConfig {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface ExportData {
  [key: string]: any;
}

export interface UseExportOptions {
  onSuccess?: (format: ExportFormat, recordCount: number) => void;
  onError?: (error: Error, format: ExportFormat) => void;
}

export interface UseExportReturn {
  exportData: (data: ExportData[], config: ExportConfig, format: ExportFormat) => Promise<void>;
  exportSelected: (
    selectedData: ExportData[],
    config: ExportConfig,
    format: ExportFormat,
  ) => Promise<void>;
  isExporting: boolean;
}

export interface PDFExportOptions {
  orientation?: 'portrait' | 'landscape';
  fontSize?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ExcelExportOptions {
  sheetName?: string;
  autoWidth?: boolean;
  headerStyle?: {
    bold?: boolean;
    backgroundColor?: string;
    color?: string;
  };
}

export interface CSVExportOptions {
  delimiter?: string;
  encoding?: string;
}

export interface ExtendedExportConfig extends ExportConfig {
  pdfOptions?: PDFExportOptions;
  excelOptions?: ExcelExportOptions;
  csvOptions?: CSVExportOptions;
}
