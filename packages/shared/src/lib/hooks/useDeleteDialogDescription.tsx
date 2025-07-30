// src/hooks/useDeleteDialogDescription.tsx
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface UseDeleteDialogDescriptionProps {
  translationObject?: string;
  translationKey: string;
  mode: 'individual' | 'batch';
  selectedCount?: number;
  selectedItems?: Array<{ id: number; nombre: string }>;
  itemName?: string;
}

export function useDeleteDialogDescription({
  translationObject,
  translationKey,
  mode,
  selectedCount = 0,
  selectedItems = [],
  itemName = '',
}: UseDeleteDialogDescriptionProps): ReactNode {
  translationObject = translationObject || 'general.dialogs';
  const t = useTranslations(translationObject);
  translationKey = translationKey || 'none';

  if (mode === 'individual') {
    return t.rich(translationKey, {
      itemName,
      br: () => <br />,
      strong: (chunks) => <strong className="font-semibold text-foreground">{chunks}</strong>,
    });
  }

  return (
    <div className="space-y-3">
      {/* Mensaje principal */}
      <div className="text-sm text-muted-foreground">
        {t.rich(translationKey, {
          count: selectedCount,
          strong: (chunks) => <strong className="font-semibold text-foreground">{chunks}</strong>,
        })}
      </div>

      {/* Lista de elementos cuando hay pocos */}
      {selectedCount <= 5 && selectedItems.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t('batch.itemsToDelete')}:
          </p>
          <ul className="space-y-1">
            {selectedItems.map((item) => (
              <li key={item.id} className="flex items-center text-xs text-muted-foreground">
                <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                <span className="truncate">{item.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resumen cuando hay muchos elementos */}
      {selectedCount > 5 && selectedItems.length > 0 && (
        <div className="rounded-lg border border-muted bg-muted/50 p-3">
          <span className="mb-2 text-xs font-medium text-muted-foreground">
            {t('batch.preview')}:
          </span>
          <ul className="space-y-1.5">
            {selectedItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-center text-xs text-muted-foreground">
                <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                <span className="truncate">{item.nombre}</span>
              </li>
            ))}
            <li className="border-t border-muted pt-1 text-xs font-medium text-muted-foreground">
              {t('batch.andMore', { count: selectedCount - 3 })}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
