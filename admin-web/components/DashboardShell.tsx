"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const closeDrawer = window.setTimeout(() => setDrawerOpen(false), 0);
    return () => window.clearTimeout(closeDrawer);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:fixed md:inset-y-0 md:flex">
        <Sidebar />
      </div>
      <div className="md:pl-64">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <span className="text-lg font-semibold text-gray-900">LMS Admin</span>
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-gray-600 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-gray-900/40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative h-full w-64">
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
