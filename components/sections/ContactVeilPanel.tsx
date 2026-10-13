"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const CONTACT_IMAGE = "/images/wine_cup_contact-optimized.jpg";

function supportsInteractiveVeil(): boolean {
  if (window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("resize", callback);
  reducedMotion.addEventListener("change", callback);
  return () => {
    window.removeEventListener("resize", callback);
    reducedMotion.removeEventListener("change", callback);
  };
}

function PlainImage() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: "#0b0c0b" }}>
      <Image
        src={CONTACT_IMAGE}
        alt=""
        fill
        unoptimized
        sizes="(min-width: 1024px) 35vw, 100vw"
        className="object-cover [mix-blend-mode:screen]"
        onError={() => {
          console.error("Failed to load image:", CONTACT_IMAGE);
        }}
      />
    </div>
  );
}

const DitherVeil = dynamic(() => import("@/components/ui/DitherVeil"), {
  ssr: false,
  loading: PlainImage,
});

type VeilBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type VeilBoundaryState = {
  failed: boolean;
};

class VeilBoundary extends Component<VeilBoundaryProps, VeilBoundaryState> {
  state: VeilBoundaryState = { failed: false };

  static getDerivedStateFromError(): VeilBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function ContactVeilPanel() {
  const interactive = useSyncExternalStore(subscribe, supportsInteractiveVeil, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const fallback = <PlainImage />;

  return (
    <div
      ref={panelRef}
      role="img"
      aria-label="Wine glass"
      className="relative h-[560px] w-full self-stretch lg:h-full lg:min-h-[560px]"
    >
      {interactive && isNearViewport ? (
        <VeilBoundary fallback={fallback}>
          <DitherVeil
            src={CONTACT_IMAGE}
            fit="cover"
            pattern="bayer"
            pixelSize={3}
            levels={2}
            inkColor="#0b0c0b"
            paperColor="#f4f1ea"
            revealRadius={80}
            softness={0.8}
            linger={0.6}
            rim={0}
            wander={false}
            clickBurst={false}
          />
        </VeilBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
