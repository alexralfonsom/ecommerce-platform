// src/components/ui/Toast/index.ts
export { default as Toast } from './Toast';
export { ToastProvider, useToast } from './ToastProvider';
export type { ToastProps, ToastAction } from './Toast';
export type { ToastItem, ShowToastOptions } from './ToastProvider';

// ===============================
// EJEMPLOS DE USO
// ===============================

/*
// 1. SETUP EN TU APP PRINCIPAL (layout.tsx o _app.tsx):

import { ToastProvider } from '@components/ui/Toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ToastProvider maxToasts={5} position="top-right">
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

// ===============================
// 2. USO BÁSICO EN COMPONENTES:
// ===============================

import { useToast } from '@components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('¡Éxito!', 'La operación se completó correctamente');
  };

  const handleError = () => {
    toast.error('Error', 'Algo salió mal');
  };

  const handleWarning = () => {
    toast.warning('Advertencia', 'Esto requiere tu atención');
  };

  const handleInfo = () => {
    toast.info('Información', 'Aquí tienes algunos datos importantes');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleWarning}>Warning Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
    </div>
  );
}

// ===============================
// 3. USO AVANZADO CON ACCIONES:
// ===============================

function AdvancedToastExample() {
  const toast = useToast();

  const handleToastWithActions = () => {
    toast.show({
      variant: 'info',
      title: 'Nueva actualización disponible',
      description: 'Hay una nueva versión del sistema disponible',
      actions: [
        {
          label: 'Actualizar',
          onClick: () => console.log('Actualizando...'),
          variant: 'primary',
        },
        {
          label: 'Ver detalles',
          href: '/updates',
          variant: 'outline',
          target: '_blank',
        },
      ],
      autoClose: false, // No cerrar automáticamente
    });
  };

  const handleCustomToast = () => {
    toast.show({
      variant: 'success',
      title: 'Operación completada',
      description: 'Los datos se guardaron exitosamente',
      icon: 'Database', // Icono personalizado
      showAccentBorder: true,
      autoCloseDelay: 3000,
      actions: [
        {
          label: 'Ver resultados',
          onClick: () => console.log('Mostrando resultados...'),
          variant: 'primary',
        },
      ],
    });
  };

  return (
    <div>
      <button onClick={handleToastWithActions}>Toast con Acciones</button>
      <button onClick={handleCustomToast}>Toast Personalizado</button>
    </div>
  );
}

// ===============================
// 4. TOAST PARA PROMESAS (LOADING):
// ===============================

function PromiseToastExample() {
  const toast = useToast();

  const handleApiCall = async () => {
    // Simular llamada API
    const apiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ data: 'Success data' });
        } else {
          reject(new Error('API Error'));
        }
      }, 2000);
    });

    // Usar toast.promise para manejar estados automáticamente
    try {
      await toast.promise(apiCall, {
        loading: 'Guardando datos...',
        success: 'Datos guardados exitosamente',
        error: 'Error al guardar los datos',
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleApiCall}>
      Llamada API con Toast
    </button>
  );
}

// ===============================
// 5. TOAST SIN ICONO O PERSONALIZADO:
// ===============================

function CustomToastExample() {
  const toast = useToast();

  const handleNoIcon = () => {
    toast.show({
      variant: 'info',
      title: 'Sin icono',
      description: 'Este toast no tiene icono',
      icon: false, // Sin icono
      showCloseButton: false, // Sin botón cerrar
      autoCloseDelay: 2000,
    });
  };

  const handleOnlyTitle = () => {
    toast.show({
      variant: 'success',
      title: 'Solo título', // Solo título, sin descripción
      icon: 'CheckCircle',
    });
  };

  const handleOnlyDescription = () => {
    toast.show({
      variant: 'warning',
      description: 'Solo descripción, sin título', // Solo descripción
      icon: 'AlertTriangle',
    });
  };

  const handleCustomContent = () => {
    toast.show({
      variant: 'info',
      children: (
        <div>
          <h4 className="font-bold text-blue-600">Contenido Personalizado</h4>
          <p>Puedes pasar cualquier JSX como children</p>
          <div className="mt-2 flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Tag 1
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Tag 2
            </span>
          </div>
        </div>
      ),
      icon: 'Sparkles',
    });
  };

  return (
    <div className="space-y-2">
      <button onClick={handleNoIcon}>Toast sin icono</button>
      <button onClick={handleOnlyTitle}>Solo título</button>
      <button onClick={handleOnlyDescription}>Solo descripción</button>
      <button onClick={handleCustomContent}>Contenido personalizado</button>
    </div>
  );
}

// ===============================
// 6. REEMPLAZO EN TU CÓDIGO ACTUAL:
// ===============================

// ANTES en tu página de catálogos:
const [toasts, setToasts] = useState<Array<{...}>>([]);
const showToast = (message: string, type: string) => {
  // lógica manual...
};

// DESPUÉS:
import { useToast } from '@components/ui/Toast';

function Catalogos() {
  const toast = useToast();

  const handleAction = (action: string) => {
    switch (action) {
      case 'create':
        toast.success('Nuevo catálogo creado exitosamente');
        break;
      case 'export':
        toast.info('Exportación iniciada');
        break;
      case 'sync':
        toast.success('Sincronización completada');
        break;
      case 'error':
        toast.error('Error al procesar la solicitud');
        break;
    }
  };

  // Ya no necesitas:
  // - Estado de toasts
  // - Función showToast manual
  // - renderToasts()
  // - Lógica de auto-remove

  return (
    // Tu JSX normal, el ToastProvider maneja todo automáticamente
    <div>...</div>
  );
}

*/
