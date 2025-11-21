import React from "react";
import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardLayout({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-72">
        <Sidebar role={role as any} />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <div className="text-sm text-muted-foreground">Role: {role}</div>
          </div>
          <div>{/* Placeholder for top-right controls */}</div>
        </header>

        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
