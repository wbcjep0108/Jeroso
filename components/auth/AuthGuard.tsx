"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-sage-light" aria-label="Loading" />
      </div>
    );
  }

  return children;
}
