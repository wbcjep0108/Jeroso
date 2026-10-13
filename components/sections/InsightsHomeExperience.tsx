"use client";

import { useCallback, useRef, type ReactNode } from "react";
import ScrollExpand from "@/components/ui/ScrollExpand";
import { getInsightBackgroundOpacity, INSIGHTS_BACKGROUND_IMAGE } from "@/lib/insight-background";

type InsightsHomeExperienceProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function InsightsHomeExperience({ eyebrow, title, intro, children }: InsightsHomeExperienceProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback((progress: number) => {
    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = String(getInsightBackgroundOpacity(progress));
    }
  }, []);

  return (
    <div className="relative isolate overflow-clip bg-neutral-950">
      <div ref={backgroundRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-0 will-change-[opacity]">
        <div className="sticky top-0 h-screen w-full">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${INSIGHTS_BACKGROUND_IMAGE}')`, backgroundPosition: "center center" }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
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
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">{eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl italic leading-tight md:text-6xl lg:text-7xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">{intro}</p>
          </div>
        </ScrollExpand>

        {children}
      </div>
    </div>
  );
}
