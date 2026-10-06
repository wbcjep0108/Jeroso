"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SmoothScroll from "@/components/layout/SmoothScroll";

const authRoutes = new Set(["/login", "/registration", "/forgot-password"]);

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.has(pathname);

  return (
    <SmoothScroll>
      {!isAuthPage && <Navbar />}
      <main id="main" className="flex-1">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </SmoothScroll>
  );
}
