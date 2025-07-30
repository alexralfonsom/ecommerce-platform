// app/[lang]/(protected)/admin/layout.tsx
'use client';

import { AuthGuard } from '@repo/ui';
import { AdminSidebar } from '@repo/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['admin']}>
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">{children}</div>
      </div>
    </AuthGuard>
  );
}
