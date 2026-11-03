import type * as React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/auth/guards";

/**
 * NCPC admin panel: navy sidebar + content. Only NCPC staff (profiles.platform_role = 'ncpc_admin').
 * Every admin Server Action checks requireAdmin() again: a layout check alone is not enough.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <AdminSidebar />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
