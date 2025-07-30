import type {
  CSVExportOptions,
  ExcelExportOptions,
  ExportColumn,
  ExportData,
  ExtendedExportConfig,
  PDFExportOptions,
} from '@/types/export';

export class ExportUtils {
  static transformValue(value: any, column: ExportColumn): string {
    if (column.transform) {
      return column.transform(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    switch (column.dataType) {
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('es-ES');
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES');
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('es-ES') : String(value);
      default:
        return String(value);
    }
  }

  static prepareExportData(data: ExportData[], columns: ExportColumn[]): Record<string, string>[] {
    return data.map((row) => {
      const transformedRow: Record<string, string> = {};
      columns.forEach((column) => {
        transformedRow[column.label] = this.transformValue(row[column.key], column);
      });
      return transformedRow;
    });
  }

  static downloadFile(content: string | Blob, filename: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToCSV(data: ExportData[], config: ExtendedExportConfig): Promise<void> {
    const { columns, filename, includeHeaders = true } = config;
    const csvOptions: CSVExportOptions = {
      delimiter: ',',
      encoding: 'utf-8',
      ...config.csvOptions,
    };

    const transformedData = this.prepareExportData(data, columns);
    let csvContent = '';

    if (includeHeaders) {
      const headers = columns.map((col) => `"${col.label}"`).join(csvOptions.delimiter);
      csvContent += headers + '\n';
    }

    transformedData.forEach((row) => {
      const values = columns.map((col) => `"${row[col.label] || ''}"`).join(csvOptions.delimiter);
      csvContent += values + '\n';
    });

    const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    this.downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8;');
  }

  static async exportToExcel(data: ExportData[], config: ExtendedExportConfig): Promise<void> {
    // Importación dinámica para reducir el bundle size
    const XLSX = await import('xlsx');

    const { columns, filename, title, subtitle } = config;
    const excelOptions: ExcelExportOptions = {
      sheetName: 'Datos',
      autoWidth: true,
      headerStyle: {
        bold: true,
        backgroundColor: '#f0f0f0',
        color: '#000000',
      },
      ...config.excelOptions,
    };

    const transformedData = this.prepareExportData(data, columns);

    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();

    if (excelOptions.autoWidth) {
      const columnWidths = columns.map((col) => ({
        wch: Math.max(col.label.length, 15),
      }));
      worksheet['!cols'] = columnWidths;
    }

    if (title || subtitle) {
      const titleRows: any[] = [];
      if (title) titleRows.push({ [columns[0]?.label || 'Título']: title });
      if (subtitle) titleRows.push({ [columns[0]?.label || 'Subtítulo']: subtitle });

      const combinedData = [...titleRows, ...transformedData];
      const newWorksheet = XLSX.utils.json_to_sheet(combinedData);
      XLSX.utils.book_append_sheet(workbook, newWorksheet, excelOptions.sheetName);
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, excelOptions.sheetName);
    }

    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
  }

  static async exportToPDF(data: ExportData[], config: ExtendedExportConfig): Promise<void> {
    // Importación dinámica para reducir el bundle size
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const { columns, filename, title, subtitle } = config;
    const defaultMargins = { top: 20, bottom: 20, left: 20, right: 20 };
    const pdfOptions: PDFExportOptions = {
      orientation: 'landscape',
      fontSize: 10,
      margins: {
        ...defaultMargins,
        ...config.pdfOptions?.margins,
      },
      ...config.pdfOptions,
    };

    const doc = new jsPDF({
      orientation: pdfOptions.orientation,
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = pdfOptions.margins!.top;

    if (title) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pdfOptions.margins!.left, yPosition);
      yPosition += 10;
    }

    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pdfOptions.margins!.left, yPosition);
      yPosition += 8;
    }

    const transformedData = this.prepareExportData(data, columns);
    const tableHeaders = columns.map((col) => col.label);
    const tableRows = transformedData.map((row) => columns.map((col) => row[col.label] || ''));

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: yPosition + 5,
      styles: { fontSize: pdfOptions.fontSize },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      margin: pdfOptions.margins,
      tableWidth: 'auto',
      columnStyles: {},
    });

    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
  }
}
