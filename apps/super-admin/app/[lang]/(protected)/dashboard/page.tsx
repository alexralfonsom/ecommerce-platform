// src/app/[lang]/(protected)/dashboard/page.tsx

export default function Dashboard() {
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <section className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 dark:border-neutral-700 rounded-lg p-8 bg-white dark:bg-neutral-800 shadow">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                Bienvenido al Sistema de Catálogos
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Selecciona una opción del menú lateral para comenzar.
              </p>

              {/* Zona futura de navegación rápida o KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded shadow">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Catálogos</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gestiona los catálogos maestros
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-4 rounded shadow">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Detalles</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Administra entradas específicas
                  </p>
                </div>
                {/* Agrega más tarjetas o links cuando gustes */}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
