"use client";

import dynamic from "next/dynamic";
import { HERO_HALFTONE_SRC } from "./halftone-config";
import { useSplashActive } from "@/lib/splash-state";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
} from "react";

/*
  Homepage hero background only. Wraps HalftoneReveal so the WebGL canvas:
  - loads lazily on the client (no SSR),
  - mounts only while the hero is on screen and the tab is visible,
  - unmounts otherwise, which runs HalftoneReveal's own cleanup and stops its
    render loop and pointer listeners,
  - shows the cursor circle whenever a mouse or trackpad is available, with fewer
    dots on weaker devices or narrow windows,
  - skips the circle on touch-only devices and when reduced motion is requested.
*/

const SRC = HERO_HALFTONE_SRC;

// Fixed look. Edit here to change colors or density (keep dotDensity <= 90, mode "mono").
const FIXED_PROPS = {
  src: SRC,
  inkColor: "#0b0f0c",
  paperColor: "#f5f3ee",
  mode: "mono",
  angle: 28,
  revealRadius: 0.3,
  borderRadius: "0px",
} as const;

// Touch-only devices: no hover, so no cursor circle.
const LITE_PROPS = { trigger: "off", idleReveal: 0.35, dotDensity: 55 } as const;
// Mouse or trackpad on a weaker device or narrow window: keep the circle, fewer dots.
const HOVER_LITE_PROPS = { trigger: "hover", dotDensity: 55, follow: 0.37 } as const;
const FULL_PROPS = { trigger: "hover", dotDensity: 80, follow: 0.37 } as const;
const REDUCED_MOTION_PROPS = { trigger: "off", idleReveal: 1, dotDensity: 55 } as const;

type HalftoneRevealProps = typeof FIXED_PROPS & {
  trigger: "hover" | "off";
  dotDensity: number;
  idleReveal?: number;
  follow?: number;
  style?: CSSProperties;
  onReady?: () => void;
};

const HalftoneReveal = dynamic(
  () =>
    import("./HalftoneReveal").then((mod) => {
      // Works whether the source uses a default or a named export.
      const exports = mod as unknown as Record<string, ComponentType<HalftoneRevealProps>>;
      return exports.HalftoneReveal ?? exports.default;
    }),
  // The static image underneath stays visible while the chunk loads.
  { ssr: false, loading: () => null },
);

/* ---------- client checks via useSyncExternalStore (SSR-safe) ---------- */

type DeviceTier = "touch" | "hover-lite" | "full" | "unknown";

// Any input that can hover precisely (mouse, trackpad), even if the primary one is touch.
const HOVER_QUERY = "(any-hover: hover) and (any-pointer: fine)";
const NARROW_QUERY = "(max-width: 767px)";

/*
  Hover capability decides whether the cursor circle is on. Core count and width
  only decide dot density, so weaker laptops still get the circle.
*/
function readDeviceTier(): DeviceTier {
  if (!window.matchMedia(HOVER_QUERY).matches) return "touch";
  const weak =
    (navigator.hardwareConcurrency ?? 8) <= 4 || window.matchMedia(NARROW_QUERY).matches;
  return weak ? "hover-lite" : "full";
}

function subscribeDeviceTier(callback: () => void) {
  const hover = window.matchMedia(HOVER_QUERY);
  const narrow = window.matchMedia(NARROW_QUERY);
  hover.addEventListener("change", callback);
  narrow.addEventListener("change", callback);
  return () => {
    hover.removeEventListener("change", callback);
    narrow.removeEventListener("change", callback);
  };
}

/** Re-evaluated when a mouse is attached or removed, or the 768px width threshold is crossed. */
function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(subscribeDeviceTier, readDeviceTier, () => "unknown");
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function useTabVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  );
}

function useInView<T extends Element>(ref: React.RefObject<T | null>): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

/* ---------- component ---------- */

export default function HalftoneHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef);
  const tabVisible = useTabVisible();
  const tier = useDeviceTier();
  const reducedMotion = usePrefersReducedMotion();

  // Wait for the splash screen to finish so the two never compete for the GPU.
  const splashActive = useSplashActive();
  const shouldRender = inView && tabVisible && tier !== "unknown" && !splashActive;
  const variantProps = reducedMotion
    ? REDUCED_MOTION_PROPS
    : tier === "touch"
      ? LITE_PROPS
      : tier === "hover-lite"
        ? HOVER_LITE_PROPS
        : FULL_PROPS;

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden bg-ink">
      {/*
        Static fallback: always opaque underneath; the canvas fades in over it.
        unoptimized + crossOrigin="anonymous" make this the exact same request as the
        head preload and HalftoneReveal's texture load, so the file is fetched once.
      */}
      <Image
        src={SRC}
        alt=""
        fill
        unoptimized
        crossOrigin="anonymous"
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        className="object-cover"
      />
      {shouldRender && <HalftoneLayer variantProps={variantProps} />}
    </div>
  );
}

type VariantProps =
  | typeof LITE_PROPS
  | typeof HOVER_LITE_PROPS
  | typeof FULL_PROPS
  | typeof REDUCED_MOTION_PROPS;

/**
 * Canvas layer. Starts fully transparent over the opaque static image and fades
 * in (300ms) only after HalftoneReveal reports its first frame with the texture.
 * Its `ready` state lives here so every remount (scroll back into view, tab
 * visible again) starts transparent and fades in again, never flashing.
 */
function HalftoneLayer({ variantProps }: { variantProps: VariantProps }) {
  const [ready, setReady] = useState(false);

  return (
    <div
      className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Inline style overrides the component's touch-none (keeps page scroll on touch) and cursor-crosshair. */}
      <HalftoneReveal
        {...FIXED_PROPS}
        {...variantProps}
        style={{ touchAction: "pan-y", cursor: "default" }}
        onReady={() => setReady(true)}
      />
    </div>
  );
}
