"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore, type ReactNode } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // Assume reduced motion on the server so Lenis only starts once the client confirms.
    () => true,
  );
}

/**
 * Site-wide smooth scrolling with Lenis, driving the native window scroll so
 * sticky/fixed elements and scroll listeners keep working.
 * Disabled entirely when the user prefers reduced motion.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      {!reducedMotion && (
        <ReactLenis
          root
          options={{
            lerp: 0.1,
            smoothWheel: true,
            // Let in-page links like the "Skip to content" anchor glide too.
            anchors: true,
          }}
        />
      )}
      {children}
    </>
  );
}
