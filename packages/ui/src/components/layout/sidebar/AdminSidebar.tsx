'use client';

export function AdminSidebar() {
    return (
        <div className="bg-white shadow mt-auto py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} admin test.</p>
                </div>
            </div>
        </div>
    );
}