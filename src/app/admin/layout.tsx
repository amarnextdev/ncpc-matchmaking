import type * as React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

/** NCPC admin panel: navy sidebar + content. Protected by middleware (admin role check in the Auth module). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <AdminSidebar />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
