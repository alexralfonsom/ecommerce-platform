'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import type { ExportFormat } from '@repo/shared/types/export';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  isExporting?: boolean;
  selectedCount?: number;
  showSelectedOnly?: boolean;
}

export function ExportDropdown({
  onExport,
  disabled = false,
  isExporting = false,
  selectedCount = 0,
  showSelectedOnly = false,
}: ExportDropdownProps) {
  const t = useTranslations('components.export');
  const getButtonText = () => {
    if (isExporting) return 'Exportando...';
    if (showSelectedOnly && selectedCount > 0) {
      return `Exportar (${selectedCount})`;
    }
    return 'Exportar';
  };

  const getButtonIcon = () => {
    return <Icon name="Download" className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || (showSelectedOnly && selectedCount === 0)}
          className="data-[state=open]:bg-accent group flex items-center gap-2"
        >
          {getButtonIcon()}
          {getButtonText()}
          <Icon
            name="ChevronDown"
            aria-hidden="true"
            className="h-3 w-3 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onExport('csv')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Icon name="FileText" className="h-4 w-4" />
          {t('format.csv')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport('excel')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Icon name="FileSpreadsheet" className="h-4 w-4" />
          {t('format.xlsx')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport('pdf')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Icon name="File" className="h-4 w-4" />
          {t('format.pdf')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
