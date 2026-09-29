"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
  Scroll in/out transition. Content fades and slides in when it enters the
  viewport and fades out when it leaves: upward when it exits at the top,
  downward when it drops below the bottom. Reverses when scrolling back.

  - One IntersectionObserver is shared by every Reveal on the page.
  - Only opacity and translate animate (GPU-composited, no layout work).
  - SSR renders content visible, so nothing is hidden without JavaScript.
  - Hidden states use motion-safe variants: with reduced motion the content
    simply stays visible.
*/

type Position = "visible" | "above" | "below";

// Shrink the viewport slightly so exits happen while the edge is still on screen.
const ROOT_MARGIN = "-8% 0px -8% 0px";

const callbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry);
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 },
    );
  }
  return sharedObserver;
}

type RevealProps = {
  children: ReactNode;
  /** Delay in ms applied when entering only, for staggering siblings. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export default function Reveal({ children, delay = 0, className = "", style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>("visible");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let first = true;

    callbacks.set(node, (entry) => {
      if (first) {
        first = false;
        // Anything already on screen at load stays put instead of fading out at the margins.
        const rect = entry.boundingClientRect;
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          setPosition("visible");
          return;
        }
      }
      if (entry.isIntersecting) {
        setPosition("visible");
      } else {
        const rootTop = entry.rootBounds?.top ?? 0;
        setPosition(entry.boundingClientRect.top < rootTop ? "above" : "below");
      }
    });

    const observer = getObserver();
    observer.observe(node);
    return () => {
      observer.unobserve(node);
      callbacks.delete(node);
    };
  }, []);

  const stateClass =
    position === "visible"
      ? "opacity-100 translate-y-0"
      : position === "above"
        ? "motion-safe:opacity-0 motion-safe:-translate-y-8"
        : "motion-safe:opacity-0 motion-safe:translate-y-10";

  return (
    <div
      ref={ref}
      className={`motion-safe:transition-[opacity,translate] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${stateClass} ${className}`}
      style={{ transitionDelay: position === "visible" ? `${delay}ms` : "0ms", ...style }}
    >
      {children}
    </div>
  );
}
