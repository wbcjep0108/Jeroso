"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type ScrollExpandProps = {
  src: string;
  mediaType?: "image" | "video";
  alt: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  fadeMediaAtEnd?: boolean;
  onProgress?: (progress: number) => void;
  children?: ReactNode;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export default function ScrollExpand({
  src,
  mediaType = "image",
  alt,
  title,
  scrollHint,
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.2,
  scrollDistance = 1,
  holdDistance = 0.25,
  smoothing = 0.1,
  overlayScrim = 0.4,
  useWindowScroll = false,
  fadeMediaAtEnd = false,
  onProgress,
  children,
}: ScrollExpandProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const visual = visualRef.current;
    const media = mediaRef.current;
    const prompt = promptRef.current;
    const content = contentRef.current;
    if (!section || !frame || !visual || !media || !prompt || !content) return;
    const sectionNode = section;
    const frameNode = frame;
    const visualNode = visual;
    const mediaNode = media;
    const promptNode = prompt;
    const contentNode = content;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let animationFrame = 0;

    function render(progress: number) {
      const eased = easeOutCubic(progress);
      frameNode.style.width = `${startWidth + (100 - startWidth) * eased}vw`;
      frameNode.style.height = `${startHeight + (100 - startHeight) * eased}svh`;
      frameNode.style.borderRadius = `${startRadius + (endRadius - startRadius) * eased}px`;
      mediaNode.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * eased})`;
      const handoffProgress = fadeMediaAtEnd ? clamp((progress - 0.97) / 0.03) : 0;
      visualNode.style.opacity = `${1 - handoffProgress}`;

      const promptProgress = clamp(progress / 0.72);
      promptNode.style.opacity = `${1 - promptProgress}`;
      promptNode.style.transform = `translateY(${-16 * promptProgress}px)`;

      const contentProgress = clamp((progress - 0.82) / 0.16);
      contentNode.style.opacity = `${contentProgress}`;
      contentNode.style.transform = `translateY(${24 * (1 - contentProgress)}px)`;
      onProgress?.(progress);
    }

    function readTarget() {
      if (reducedMotion.matches) {
        current = 1;
        target = 1;
        render(1);
        return;
      }

      const viewportHeight = Math.max(window.innerHeight, 1);
      const travel = Math.max(scrollDistance * viewportHeight, 1);
      target = clamp(-sectionNode.getBoundingClientRect().top / travel);
      if (!animationFrame) animationFrame = requestAnimationFrame(tick);
    }

    function tick() {
      animationFrame = 0;
      current += (target - current) * clamp(smoothing, 0.01, 1);
      if (Math.abs(target - current) < 0.001) current = target;
      render(current);
      if (current !== target) animationFrame = requestAnimationFrame(tick);
    }

    function handleMotionPreference() {
      if (reducedMotion.matches) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        current = 1;
        target = 1;
        render(1);
      } else {
        readTarget();
      }
    }

    render(0);
    readTarget();
    window.addEventListener("scroll", readTarget, { passive: true });
    window.addEventListener("resize", readTarget);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      window.removeEventListener("scroll", readTarget);
      window.removeEventListener("resize", readTarget);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [endRadius, fadeMediaAtEnd, mediaZoom, onProgress, scrollDistance, smoothing, startHeight, startRadius, startWidth, useWindowScroll]);

  const sectionHeight = (1 + Math.max(scrollDistance, 0) + Math.max(holdDistance, 0)) * 100;

  return (
    <section
      ref={sectionRef}
      aria-label={title ?? alt}
      data-window-scroll={useWindowScroll || undefined}
      className="relative overflow-clip motion-reduce:h-[100svh]!"
      style={{ height: `${sectionHeight}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <div
          ref={frameRef}
          className="relative isolate overflow-hidden shadow-2xl motion-reduce:h-[100svh]! motion-reduce:w-[100vw]! motion-reduce:rounded-none!"
          style={{ width: `${startWidth}vw`, height: `${startHeight}svh`, borderRadius: startRadius }}
        >
          <div ref={visualRef} className="absolute inset-0 will-change-[opacity]">
            <div ref={mediaRef} className="absolute inset-0 will-change-transform" style={{ transform: `scale(${mediaZoom})` }}>
              {mediaType === "image" ? (
                <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover object-center" />
              ) : (
                <video src={src} aria-label={alt} autoPlay muted loop playsInline className="h-full w-full object-cover object-center" />
              )}
            </div>
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayScrim }} aria-hidden="true" />
          </div>

          <div
            ref={promptRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white motion-reduce:hidden"
          >
            {title && <p className="max-w-3xl font-serif text-4xl italic leading-tight sm:text-6xl">{title}</p>}
            {scrollHint && (
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/70">{scrollHint}</p>
            )}
          </div>

          <div
            ref={contentRef}
            className="absolute inset-0 flex items-center justify-center opacity-0 motion-reduce:translate-y-0! motion-reduce:opacity-100!"
            style={{ transform: "translateY(24px)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
