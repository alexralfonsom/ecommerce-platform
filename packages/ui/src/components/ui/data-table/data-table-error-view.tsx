// src/components/ui/table/TableErrorView.tsx
'use client';

import React from 'react';
import { Button } from '@components/ui/button';
import Icon from '@components/ui/Icon';
import { useTranslations } from 'next-intl';

interface TableErrorViewProps {
  error?: any;
  className?: string;
  showDetails?: boolean;
}

// 🔍 DETECCIÓN AUTOMÁTICA DEL TIPO DE ERROR
const detectErrorType = (error: any) => {
  if (!error) return null;

  // Error de red/conectividad
  if (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('fetch') ||
    error.message?.includes('Network') ||
    error.name === 'TypeError' ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return 'network';
  }

  // Errores de autenticación
  if (
    error.response?.status === 401 ||
    error.response?.status === 403 ||
    error.message?.includes('authentication') ||
    error.message?.includes('unauthorized')
  ) {
    return 'auth';
  }
  // Error 404 - Not Found
  if (error.response?.status === 404 || error.response?.data?.status === 'NotFound') {
    return 'notFound';
  }

  // Error 400 - Bad Request (validación/datos incorrectos)
  if (
    error.response?.status === 400 ||
    error.code === 'ERR_BAD_REQUEST' ||
    error.response?.data?.validationErrors?.length > 0 ||
    error.response?.data?.status === 'Invalid'
  ) {
    return 'validation';
  }

  // Errores de servidor (500+)
  if (error.response?.status >= 500 || error.message?.includes('Internal Server Error')) {
    return 'server';
  }

  // Otros errores de cliente (400-499, excepto los ya manejados)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return 'client';
  }

  // Por defecto, error general
  return 'general';
};

// 🎨 CONFIGURACIÓN VISUAL POR TIPO
const getErrorConfig = (type: string) => {
  const configs = {
    network: {
      icon: 'WifiOff' as const,
      title: 'Sin conexión',
      description: 'Verifica tu conexión a internet e intenta nuevamente.',
      color: 'blue',
      showReload: true,
    },
    auth: {
      icon: 'Shield' as const,
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      color: 'orange',
      showReload: false,
    },
    validation: {
      icon: 'AlertCircle' as const,
      title: 'Datos incorrectos',
      description: 'Los datos enviados no son válidos. Revisa la información e intenta nuevamente.',
      color: 'yellow',
      showReload: false,
    },
    notFound: {
      icon: 'FileX' as const,
      title: 'Recurso no encontrado',
      description: 'El recurso solicitado no existe o ha sido eliminado.',
      color: 'purple',
      showReload: false,
    },
    server: {
      icon: 'Server' as const,
      title: 'Error del servidor',
      description: 'Estamos experimentando problemas técnicos. Intenta más tarde.',
      color: 'red',
      showReload: true,
    },
    client: {
      icon: 'AlertTriangle' as const,
      title: 'Error en la solicitud',
      description: 'Hubo un problema con la solicitud enviada.',
      color: 'orange',
      showReload: false,
    },
    general: {
      icon: 'AlertTriangle' as const,
      title: 'Error inesperado',
      description: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
      color: 'red',
      showReload: true,
    },
  };

  return configs[type as keyof typeof configs] || configs.general;
};

// 🎨 CLASES DE COLOR
const getColorClasses = (color: string) => {
  const colors = {
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      icon: 'text-blue-600 dark:text-blue-400',
      decorative: 'bg-blue-500',
    },
    orange: {
      bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      icon: 'text-orange-600 dark:text-orange-400',
      decorative: 'bg-orange-500',
    },
    yellow: {
      bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      decorative: 'bg-yellow-500',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      icon: 'text-purple-600 dark:text-purple-400',
      decorative: 'bg-purple-500',
    },
    red: {
      bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      icon: 'text-red-600 dark:text-red-400',
      decorative: 'bg-red-500',
    },
  };

  return colors[color as keyof typeof colors] || colors.red;
};

export function DataTableErrorView({
  error,
  className = '',
  showDetails = process.env.NODE_ENV === 'development',
}: TableErrorViewProps) {
  const tg = useTranslations('general');
  const errorType = React.useMemo(() => detectErrorType(error), [error]);
  if (!error || !errorType) {
    return null;
  }

  const config = React.useMemo(() => getErrorConfig(errorType), [errorType]);
  const colors = React.useMemo(() => getColorClasses(config.color), [config.color]);

  // 📱 Obtener mensaje de error legible
  const errorMessage = React.useMemo(() => {
    if (!error) return null;

    // Para errores de validación, mostrar los errores específicos
    if (errorType === 'validation' && error.response?.data?.validationErrors?.length > 0) {
      return error.response.data.validationErrors
        .map((err: any) => `${err.propertyName}: ${err.errorMessage}`)
        .join(', ');
    }

    // Para errores con mensaje de la API
    if (error.response?.data?.errors?.length > 0) {
      return error.response.data.errors.join(', ');
    }

    // Para errores con mensaje directo
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.title) return error.response.data.title;

    // Para otros tipos de error
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;

    return null;
  }, [error, errorType]);

  // 🔄 Manejador de recarga de página
  const handleReload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      <div className="relative mb-6">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.bg}`}
        >
          <Icon name={config.icon} className={`h-10 w-10 ${colors.icon}`} />
        </div>
        {/* Elementos decorativos */}
        <div
          className={`absolute -top-1 -right-1 h-6 w-6 rounded-full ${colors.decorative} opacity-20`}
        ></div>
        <div
          className={`absolute -bottom-2 -left-2 h-4 w-4 rounded-full ${colors.decorative} opacity-30`}
        ></div>
      </div>

      {/* 📝 Contenido del error */}
      <h3 className="mb-3 text-lg font-semibold">{config.title}</h3>

      <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
        {config.description}
      </p>

      {/* 🔧 Mensaje técnico del error (solo si hay y en desarrollo) */}
      {showDetails && errorMessage && (
        <div className="mb-6 max-w-lg rounded-lg border bg-muted/30 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Detalles técnicos:</p>
          <p className="font-mono text-xs text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* 🚀 Botones de acción */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Botón secundario: Recargar página (solo para ciertos errores) */}
        {config.showReload && (
          <Button variant="outline" onClick={handleReload} size="default" className="min-w-[120px]">
            <Icon name="RotateCcw" className="h-4 w-4" />
            {tg('browsers.reload') || 'Recargar página'}
          </Button>
        )}

        {/* Botón especial para errores de autenticación */}
        {errorType === 'auth' && (
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/auth/signin')}
            size="default"
            className="min-w-[120px]"
          >
            <Icon name="LogIn" className="h-4 w-4" />
            Iniciar sesión
          </Button>
        )}
      </div>
    </div>
  );
}

export default DataTableErrorView;
