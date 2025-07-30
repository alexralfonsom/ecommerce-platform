// src/components/ui/StatCard/useStatCardData.ts
'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatCardItem } from './StatCard';

interface UseStatCardDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  formatNumbers?: boolean;
  locale?: string;
  onError?: (error: Error) => void;
  onSuccess?: (data: StatCardItem[]) => void;
}

interface UseStatCardDataReturn {
  items: StatCardItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateItem: (id: string, updates: Partial<StatCardItem>) => void;
  addItem: (item: StatCardItem) => void;
  removeItem: (id: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export function useStatCardData(
  initialData: StatCardItem[] = [],
  options: UseStatCardDataOptions = {},
): UseStatCardDataReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    formatNumbers = true,
    locale = 'es',
    onError,
    onSuccess,
  } = options;

  const [items, setItems] = useState<StatCardItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto format numbers if enabled
  const processedItems = useMemo(() => {
    if (!formatNumbers) return items;

    return items.map((item) => ({
      ...item,
      formatValue:
        item.formatValue ||
        ((value: string | number) => {
          if (typeof value === 'number') {
            return new Intl.NumberFormat(locale).format(value);
          }
          return String(value);
        }),
    }));
  }, [items, formatNumbers, locale]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simular refresh - aquí irían las llamadas a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // En un caso real, aquí actualizarías los datos desde la API
      // const newData = await fetchStatData();
      // setItems(newData);

      onSuccess?.(items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar datos';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [items, onError, onSuccess]);

  const updateItem = useCallback((id: string, updates: Partial<StatCardItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const addItem = useCallback((item: StatCardItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    items: processedItems,
    loading,
    error,
    refresh,
    updateItem,
    addItem,
    removeItem,
    clearError,
    setLoading,
  };
}
