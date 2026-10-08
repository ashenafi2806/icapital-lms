"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    // UX guard only; the backend enforces authentication and roles.
    <DashboardShell>{children}</DashboardShell>
  );
}
