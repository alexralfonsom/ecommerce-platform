'use client';
import { useCallback, useState } from 'react';
import { useToast } from '@components/ui/Toast';
import { ExportUtils } from '@repo/shared/lib/utils/exportUtils';
import type {
  ExportData,
  ExportFormat,
  ExtendedExportConfig,
  UseExportOptions,
  UseExportReturn,
} from '@repo/shared/types/export';
import { useTranslations } from 'next-intl';

export function useExport(options?: UseExportOptions): UseExportReturn {
  const t = useTranslations('components.export');
  const tg = useTranslations('general');
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const exportData = useCallback(
    async (data: ExportData[], config: ExtendedExportConfig, format: ExportFormat) => {
      if (!data || data.length === 0) {
        toast.warning(tg('warning'), t('noData'));
        return;
      }

      setIsExporting(true);

      try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const configWithTimestamp = {
          ...config,
          filename: config.filename || `export_${timestamp}`,
        };

        switch (format) {
          case 'csv':
            await ExportUtils.exportToCSV(data, configWithTimestamp);
            break;
          case 'excel':
            await ExportUtils.exportToExcel(data, configWithTimestamp);
            break;
          case 'pdf':
            await ExportUtils.exportToPDF(data, configWithTimestamp);
            break;
          default:
            throw new Error(`${t('formatNotSupported')} ${format}`);
        }

        toast.success(
          t('exportSuccess'),
          `${t('exportSuccessMessage', { count: data.length, format: format.toUpperCase() })}`,
        );

        options?.onSuccess?.(format, data.length);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('exportError');
        toast.danger(t('exportError'), t('exportErrorMessage', { error: errorMessage }));
        options?.onError?.(error instanceof Error ? error : new Error(errorMessage), format);
      } finally {
        setIsExporting(false);
      }
    },
    [toast, options],
  );

  const exportSelected = useCallback(
    async (selectedData: ExportData[], config: ExtendedExportConfig, format: ExportFormat) => {
      if (!selectedData || selectedData.length === 0) {
        toast.warning(tg('warning'), t('noRecords'));
        return;
      }

      await exportData(selectedData, config, format);
    },
    [exportData, toast],
  );

  return {
    exportData,
    exportSelected,
    isExporting,
  };
}

// Hook específico para exportar con configuración predefinida
export function useExportWithConfig(defaultConfig: Partial<ExtendedExportConfig>) {
  const exportHook = useExport();

  const exportWithDefaults = useCallback(
    async (data: ExportData[], format: ExportFormat, overrides?: Partial<ExtendedExportConfig>) => {
      const config: ExtendedExportConfig = {
        filename: `export_${new Date().toISOString().slice(0, 10)}`,
        columns: [],
        includeHeaders: true,
        ...defaultConfig,
        ...overrides,
      };

      await exportHook.exportData(data, config, format);
    },
    [exportHook, defaultConfig],
  );

  return {
    ...exportHook,
    exportWithDefaults,
  };
}
