"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore, type ComponentType } from "react";
import { useSplashActive } from "@/lib/splash-state";

/*
  Decorative full-page background for the Wines page only.
  - AeroShards loads client-only and lazily, so it never blocks SSR or first paint.
  - The wrapper's CSS gradient is the fallback: visible while loading, under 640px,
    and permanently if WebGPU is unavailable (onError).
  - A bg-black/30 overlay sits above the canvas for text readability.
*/

type AeroShardsProps = {
  backgroundColor: string;
  shardColor: string;
  accentColor: string;
  placement: string;
  flow: string;
  material: string;
  detail: string;
  effect: string;
  density: number;
  shardSize: number;
  speed: number;
  spin: number;
  turbulence: number;
  depth: number;
  interaction: string;
  holdToGather: boolean;
  rippleIntensity: number;
  bloom: number;
  grain: number;
  chromaticAberration: number;
  onError: (error?: unknown) => void;
};

const AeroShards = dynamic(
  () =>
    import("@/components/AeroShards").then((mod) => {
      // Works whether the source uses a default or a named export.
      const exports = mod as unknown as Record<string, ComponentType<AeroShardsProps>>;
      return exports.AeroShards ?? exports.default;
    }),
  { ssr: false, loading: () => null },
);

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useIsAtLeastSm(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

// Built from the component's own colors so the fallback reads as the same scene.
const FALLBACK_GRADIENT =
  "radial-gradient(ellipse 60% 70% at 85% 40%, rgba(110, 20, 35, 0.45), transparent 70%), " +
  "radial-gradient(ellipse 30% 30% at 80% 30%, rgba(201, 162, 39, 0.08), transparent 70%), " +
  "linear-gradient(180deg, #1A0A10 0%, #0b0c0b 100%)";

export default function AeroShardsBackground() {
  const isAtLeastSm = useIsAtLeastSm();
  const [fallback, setFallback] = useState(false);
  // Delay the heavy canvas while the splash screen is on screen.
  const splashActive = useSplashActive();
  const showCanvas = isAtLeastSm && !fallback && !splashActive;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ backgroundImage: FALLBACK_GRADIENT }}
    >
      {showCanvas && (
        <div className="absolute inset-0">
          <AeroShards
            backgroundColor="#1A0A10"
            shardColor="#6E1423"
            accentColor="#C9A227"
            placement="right"
            flow="ribbon"
            material="satin"
            detail="bold"
            effect="none"
            density={0.8}
            shardSize={1.1}
            speed={0.5}
            spin={0.5}
            turbulence={0.6}
            depth={0.8}
            interaction="repel"
            holdToGather={false}
            rippleIntensity={0}
            bloom={0}
            grain={0}
            chromaticAberration={0}
            onError={() => setFallback(true)}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
