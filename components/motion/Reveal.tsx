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
  /** A smaller 24px entrance offset for compact reveal sequences. */
  subtle?: boolean;
  /** Keep the content visible after its first viewport entrance. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function Reveal({ children, delay = 0, subtle = false, once = false, className = "", style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>("visible");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observedNode = node;
    let first = true;
    const observer = getObserver();

    function show() {
      setPosition("visible");
      if (once) {
        observer.unobserve(observedNode);
        callbacks.delete(observedNode);
      }
    }

    callbacks.set(observedNode, (entry) => {
      if (first) {
        first = false;
        // Anything already on screen at load stays put instead of fading out at the margins.
        const rect = entry.boundingClientRect;
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          show();
          return;
        }
      }
      if (entry.isIntersecting) {
        show();
      } else {
        const rootTop = entry.rootBounds?.top ?? 0;
        setPosition(entry.boundingClientRect.top < rootTop ? "above" : "below");
      }
    });

    observer.observe(observedNode);
    return () => {
      observer.unobserve(observedNode);
      callbacks.delete(observedNode);
    };
  }, [once]);

  const stateClass =
    position === "visible"
      ? "opacity-100 translate-y-0"
      : position === "above"
        ? `motion-safe:opacity-0 ${subtle ? "motion-safe:-translate-y-6" : "motion-safe:-translate-y-8"}`
        : `motion-safe:opacity-0 ${subtle ? "motion-safe:translate-y-6" : "motion-safe:translate-y-10"}`;

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
