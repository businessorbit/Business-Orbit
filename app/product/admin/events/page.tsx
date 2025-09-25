"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import AdminEvents from "@/components/admin/AdminEvents";

export default function AdminEventsPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 ml-20">
        <div className="px-4 sm:px-6 lg:px-8 lg:-ml-10 py-4 sm:py-8 pb-20 lg:pb-8">
          <AdminEvents />
        </div>
      </div>
    </div>
  );
}
