"use client";

import { useCallback, useRef, type ReactNode } from "react";
import ScrollExpand from "@/components/ui/ScrollExpand";
import { getInsightBackgroundOpacity, INSIGHTS_BACKGROUND_IMAGE } from "@/lib/insight-background";

type InsightsPageExperienceProps = {
  children: ReactNode;
};

export default function InsightsPageExperience({ children }: InsightsPageExperienceProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback((progress: number) => {
    const opacity = String(getInsightBackgroundOpacity(progress));
    if (backgroundRef.current) backgroundRef.current.style.opacity = opacity;
  }, []);

  return (
    <div className="relative isolate min-h-screen bg-neutral-950">
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-0 will-change-[opacity]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${INSIGHTS_BACKGROUND_IMAGE}')`, backgroundPosition: "center center" }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10">
        <ScrollExpand
          src={INSIGHTS_BACKGROUND_IMAGE}
          mediaType="image"
          alt="A journey through the world's renowned wine regions"
          title="Explore the World Through Wine"
          scrollHint="Scroll to discover"
          startWidth={42}
          startHeight={58}
          startRadius={24}
          endRadius={0}
          mediaZoom={1.2}
          scrollDistance={1}
          holdDistance={0.25}
          smoothing={0.1}
          overlayScrim={0.4}
          useWindowScroll
          fadeMediaAtEnd
          onProgress={handleProgress}
        >
          <div className="mx-auto max-w-3xl px-6 text-center text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Jeroso Wine Insights</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
              Every Region Tells a Story
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
              Discover the grapes, traditions, flavours, and pairings that define the world&apos;s celebrated wine regions.
            </p>
          </div>
        </ScrollExpand>

        <div className="relative bg-transparent">{children}</div>
      </div>
    </div>
  );
}
