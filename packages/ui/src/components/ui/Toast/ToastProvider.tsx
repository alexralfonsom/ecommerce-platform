// src/components/ui/Toast/ToastProvider.tsx
'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { cn } from '@repo/shared';
import Toast, { ToastProps } from './Toast';

// ===============================
// TIPOS
// ===============================
export interface ToastItem extends Omit<ToastProps, 'onClose' | 'isVisible'> {
  id: string;
  timestamp: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id' | 'timestamp'>) => string;
  hideToast: (id: string) => void;
  clearAll: () => void;
  // Métodos de conveniencia
  success: (title: string, description?: string, options?: Partial<ToastProps>) => string;
  danger: (title: string, description?: string, options?: Partial<ToastProps>) => string;
  warning: (title: string, description?: string, options?: Partial<ToastProps>) => string;
  info: (title: string, description?: string, options?: Partial<ToastProps>) => string;
}

export interface ShowToastOptions extends Omit<ToastProps, 'onClose' | 'isVisible' | 'id'> {
  // Aquí puedes agregar opciones específicas para showToast si necesitas
}

// ===============================
// CONTEXT
// ===============================
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ===============================
// PROVIDER
// ===============================
interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: ToastProps['position'];
  className?: string;
}

export function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top-right',
  className,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ===============================
  // 🎛️ HANDLERS
  // ===============================
  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        ...toast,
        id,
        timestamp: Date.now(),
        position, // Usar la posición del provider
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limitar número máximo de toasts
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts, position],
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // ===============================
  // 🎯 MÉTODOS DE CONVENIENCIA
  // ===============================
  const success = useCallback(
    (title: string, description?: string, options?: Partial<ToastProps>) => {
      return showToast({
        variant: 'success',
        title,
        description,
        ...options,
      });
    },
    [showToast],
  );

  const danger = useCallback(
    (title: string, description?: string, options?: Partial<ToastProps>) => {
      return showToast({
        variant: 'danger',
        title,
        description,
        ...options,
      });
    },
    [showToast],
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<ToastProps>) => {
      return showToast({
        variant: 'warning',
        title,
        description,
        ...options,
      });
    },
    [showToast],
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<ToastProps>) => {
      return showToast({
        variant: 'info',
        title,
        description,
        ...options,
      });
    },
    [showToast],
  );

  // ===============================
  // 🎨 POSICIONAMIENTO
  // ===============================
  const getPositionClasses = (pos: ToastProps['position']) => {
    switch (pos) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // ===============================
  // 🏗️ RENDER
  // ===============================
  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAll,
    success,
    danger,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* 🍞 Container de Toasts */}
      {toasts.length > 0 && (
        <div
          className={cn('fixed z-50 flex flex-col gap-2', getPositionClasses(position), className)}
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => hideToast(toast.id)} isVisible={true} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ===============================
// 🎣 HOOK
// ===============================
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default ToastProvider;
