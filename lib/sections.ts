import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/*
  Homepage sections: ids, the navbar offset, scrolling, and which section is on screen.
  Every jump to a section goes through scrollToSection(), so Lenis, native scrolling,
  the navbar offset and focus handling stay consistent everywhere.
*/

export const SECTION_IDS = ["tastings", "insights", "about", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

/** Section id from a hash like "#contact", or null when it is not a known section. */
export function sectionFromHash(hash: string): SectionId | null {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  return isSectionId(id) ? id : null;
}

/**
 * Space kept above a section heading after a jump. Clears the tallest solid navbar
 * (72px) with room to spare. Must match `scroll-mt-24` on SectionShell.
 */
export const SECTION_OFFSET_PX = 96;

type ScrollOptions = {
  lenis?: Lenis | null;
  immediate?: boolean;
  focus?: boolean;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(
  id: SectionId,
  { lenis, immediate = false, focus = true }: ScrollOptions = {},
): void {
  const el = document.getElementById(id);
  if (!el) return;

  const moveFocus = () => {
    if (focus) el.focus({ preventScroll: true });
  };

  // Lenis is not running under reduced motion; the native jump is instant then.
  if (lenis && !prefersReducedMotion()) {
    lenis.scrollTo(el, {
      offset: -SECTION_OFFSET_PX,
      immediate,
      force: true,
      onComplete: moveFocus,
    });
    if (immediate) moveFocus();
    return;
  }

  // Native jump; scroll-margin-top on the section provides the navbar offset.
  el.scrollIntoView({ block: "start", behavior: "instant" });
  moveFocus();
}

/* ---------- active section (drives the navbar underline on the homepage) ---------- */

const listeners = new Set<() => void>();
let activeSection: SectionId | null = null;

export function setActiveSection(id: SectionId | null): void {
  if (activeSection === id) return;
  activeSection = id;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveSection(): SectionId | null {
  return useSyncExternalStore(
    subscribe,
    () => activeSection,
    () => null,
  );
}
