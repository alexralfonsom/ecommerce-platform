'use client';

export function AdminSidebar() {
  return (
    <div className="mt-auto bg-white py-4 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} admin test.</p>
        </div>
      </div>
    </div>
  );
}
