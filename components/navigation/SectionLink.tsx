"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import type { MouseEvent, ReactNode } from "react";
import { scrollToSection, type SectionId } from "@/lib/sections";

type SectionLinkProps = {
  section: SectionId;
  /** Extra query parameters, e.g. { topic: "private-tasting" }. */
  query?: Record<string, string>;
  /** Runs before scrolling or navigating, e.g. to close the mobile menu. */
  onNavigate?: () => void;
  className?: string;
  "aria-current"?: "page" | "location" | undefined;
  children: ReactNode;
};

export function sectionHref(section: SectionId, query?: Record<string, string>): string {
  const search = query ? `?${new URLSearchParams(query).toString()}` : "";
  return `/${search}#${section}`;
}

/*
  A real link to /#section, so open-in-new-tab, copy link and no-JavaScript all work.
  - On the homepage: plain clicks are intercepted, the URL is pushed (one history entry
    per click, so Back returns to the previous section), then the page scrolls.
  - Elsewhere: Next.js navigates to /#section with scroll={false}, and
    HomeSectionScroller scrolls once the homepage has mounted.
*/
export default function SectionLink({
  section,
  query,
  onNavigate,
  className,
  children,
  ...rest
}: SectionLinkProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const href = sectionHref(section, query);

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (pathname !== "/") return;
    // Let the browser handle new-tab and other modified clicks.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.history.pushState(null, "", href);
    // Next frame: the mobile menu has started closing and layout has settled.
    requestAnimationFrame(() => scrollToSection(section, { lenis }));
  }

  return (
    <Link href={href} scroll={false} onClick={onClick} className={className} aria-current={rest["aria-current"]}>
      {children}
    </Link>
  );
}
