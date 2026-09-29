"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import WineCard from "@/components/wines/WineCard";
import type { Wine } from "@/lib/wines";

type WineCollectionProps = {
  wines: Wine[];
  /** Hide on /wines itself, where the link would point to the current page. */
  showViewAll?: boolean;
  headingId?: string;
};

/*
  Continuous looping carousel.

  - All slides sit in one flex row. A single number, `position` (in cards, where
    0 is the first real wine), drives everything. It is written to the track as
    the CSS variable --pos, and the track's translate3d is computed from it in CSS.
  - Each slide's scale and opacity are computed from its distance to the center,
    every frame, so they change continuously while sliding and dragging.
  - Motion is a requestAnimationFrame loop (ease-out cubic), not CSS transitions,
    so Next/Previous, drag release and flicks share the same snap.
  - CLONES copies of the wines sit before the first and after the last. Whenever
    the position drifts past half a card beyond either end, it is shifted by the
    wine count; the clones make that shift pixel-identical, so the loop is seamless
    even mid-animation and mid-drag.
  - No React state changes while moving; state only updates the page counter.
*/

const CLONES = 2;
const GAP_PX = 24;
const SNAP_MS = 500;
const DRAG_START_PX = 8;
const CLICK_CANCEL_PX = 6;
const FLICK_VELOCITY = 0.5; // px per ms
const SIDE_SCALE = 0.85;
const SIDE_OPACITY = 0.6;
/** Blur applied to non-selected cards, in px. The centered card is always sharp. */
const SIDE_BLUR_PX = 4;

const pad = (n: number) => String(n).padStart(2, "0");
const mod = (n: number, m: number) => ((n % m) + m) % m;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Animation = { from: number; to: number; start: number | null };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startPos: number;
  lastX: number;
  lastT: number;
  velocity: number;
  dx: number;
  moved: number;
  step: number;
  active: boolean;
  abandoned: boolean;
};

type TrackStyle = CSSProperties & Record<`--${string}`, string>;

export default function WineCollection({
  wines,
  showViewAll = true,
  headingId = "collection-heading",
}: WineCollectionProps) {
  const total = wines.length;
  const loops = total > 1;
  const clones = loops ? CLONES : 0;

  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(0);
  const animRef = useRef<Animation | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const focusCenterRef = useRef(false);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current);
    };
  }, []);

  if (total === 0) {
    return <p className="text-white/60">No wines available right now.</p>;
  }

  /* ---------- rendering the position ---------- */

  /** Amount to add to a position to bring it back into [-0.5, total - 0.5). */
  function loopShift(p: number): number {
    if (!loops) return 0;
    return mod(p + 0.5, total) - 0.5 - p;
  }

  function slideLook(distance: number) {
    const d = Math.min(Math.abs(distance), 1);
    return {
      scale: 1 - (1 - SIDE_SCALE) * d,
      opacity: 1 - (1 - SIDE_OPACITY) * d,
      // "none" at the center so the selected card is not filtered at all.
      filter: d < 0.01 ? "none" : `blur(${(SIDE_BLUR_PX * d).toFixed(2)}px)`,
    };
  }

  function apply(p: number) {
    posRef.current = p;
    const track = trackRef.current;
    if (!track) return;
    track.style.setProperty("--pos", String(p + clones));
    slideRefs.current.forEach((el, r) => {
      if (!el) return;
      const { scale, opacity, filter } = slideLook(r - clones - p);
      el.style.transform = `scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.filter = filter;
    });
  }

  function setMoving(moving: boolean) {
    const track = trackRef.current;
    if (track) track.style.willChange = moving ? "transform" : "";
  }

  /* ---------- snapping animation ---------- */

  function settle() {
    animRef.current = null;
    rafRef.current = null;
    const p = mod(Math.round(posRef.current), total);
    apply(p);
    setMoving(false);
    if (focusCenterRef.current) {
      focusCenterRef.current = false;
      slideRefs.current[p + clones]
        ?.querySelector<HTMLAnchorElement>("a")
        ?.focus({ preventScroll: true });
    }
  }

  function tick(now: number) {
    const a = animRef.current;
    if (!a) {
      rafRef.current = null;
      return;
    }
    // The first frame after (re)targeting defines the start time.
    if (a.start === null) a.start = now;
    const t = Math.min(1, (now - a.start) / SNAP_MS);
    let p = a.from + (a.to - a.from) * easeOutCubic(t);
    const shift = loopShift(p);
    if (shift !== 0) {
      a.from += shift;
      a.to += shift;
      p += shift;
    }
    apply(p);
    if (t < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      settle();
    }
  }

  function animateTo(target: number) {
    setIndex(mod(Math.round(target), total));
    if (prefersReducedMotion()) {
      animRef.current = null;
      apply(mod(Math.round(target), total));
      settle();
      return;
    }
    // Retargets smoothly if an animation is already running (fast repeated clicks).
    animRef.current = { from: posRef.current, to: target, start: null };
    setMoving(true);
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
  }

  function move(delta: number) {
    if (!loops || dragRef.current?.active) return;
    const base = animRef.current ? animRef.current.to : Math.round(posRef.current);
    animateTo(base + delta);
  }

  function stopAnimation() {
    animRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  /* ---------- pointer drag ---------- */

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!loops) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const slide = slideRefs.current[clones];
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
      dx: 0,
      moved: 0,
      step: (slide?.offsetWidth ?? 1) + GAP_PX,
      active: false,
      abandoned: false,
    };
  }

  function dragFrame() {
    dragFrameRef.current = null;
    const d = dragRef.current;
    if (!d || !d.active) return;
    let p = d.startPos - d.dx / d.step;
    const shift = loopShift(p);
    if (shift !== 0) {
      d.startPos += shift;
      p += shift;
    }
    apply(p);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));

    if (!d.active) {
      if (d.abandoned) return;
      if (Math.abs(dy) > DRAG_START_PX && Math.abs(dy) >= Math.abs(dx)) {
        d.abandoned = true; // mostly vertical: let the page scroll
        return;
      }
      if (Math.abs(dx) <= DRAG_START_PX) return;
      // Grab the track where it is, even mid-animation.
      stopAnimation();
      d.active = true;
      d.startPos = posRef.current;
      d.startX = e.clientX;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
      // Capture only for a real drag, so plain clicks still reach the card link.
      e.currentTarget.setPointerCapture(e.pointerId);
      setMoving(true);
      setDragging(true);
    }

    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.velocity = d.velocity * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    d.dx = e.clientX - d.startX;
    if (dragFrameRef.current === null) dragFrameRef.current = requestAnimationFrame(dragFrame);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;

    if (!cancelled && d.moved > CLICK_CANCEL_PX) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    if (!d.active) return;

    if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
    dragFrameRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);

    let p = d.startPos - d.dx / d.step;
    const shift = loopShift(p);
    p += shift;
    const start = d.startPos + shift;
    apply(p);

    // Nearest card, plus momentum: a quick flick travels at least one card.
    let target = Math.round(p);
    const velocity = e.timeStamp - d.lastT > 80 ? 0 : d.velocity;
    if (!cancelled && Math.abs(velocity) > FLICK_VELOCITY) {
      const dir = velocity < 0 ? 1 : -1;
      const flickTarget = Math.round(start) + dir;
      if (dir > 0) target = Math.max(target, flickTarget);
      else target = Math.min(target, flickTarget);
    }
    animateTo(target);
  }

  function onClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    focusCenterRef.current = Boolean(trackRef.current?.contains(document.activeElement));
    move(e.key === "ArrowRight" ? 1 : -1);
  }

  /** Tabbing onto a side card slides it to the center so it is never off screen. */
  function onSlideFocus(e: ReactFocusEvent<HTMLDivElement>, real: number) {
    if (!loops || !(e.target instanceof HTMLElement) || !e.target.matches(":focus-visible")) return;
    const base = animRef.current ? animRef.current.to : Math.round(posRef.current);
    let delta = mod(real - base, total);
    if (delta > total / 2) delta -= total;
    if (delta !== 0) animateTo(base + delta);
  }

  /* ---------- markup ---------- */

  const rendered = Array.from({ length: total + clones * 2 }, (_, r) => r - clones);

  // Initial (server) state for index 0. These values never change between renders,
  // so React never overwrites what the animation loop writes.
  const trackStyle: TrackStyle = {
    "--pos": String(clones),
    transform:
      "translate3d(calc(50% - var(--slide) / 2 - var(--pos) * (var(--slide) + 24px)), 0, 0)",
  };

  const current = wines[index];
  const navButton =
    "flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-white/80 hover:border-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light motion-safe:transition-colors";

  return (
    <section aria-labelledby={headingId}>
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={headingId} className="font-serif text-4xl italic sm:text-5xl">
          Our Wine Collection
        </h2>
        {showViewAll && (
          <Link
            href="/wines"
            className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            View All Wines
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </Reveal>

      <div onKeyDown={onKeyDown}>
        <Reveal delay={120} className="mt-10">
          <div
            className="overflow-x-clip py-2"
            aria-roledescription="carousel"
            aria-label="Featured wines"
          >
            <div
              ref={trackRef}
              data-dragging={dragging}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => endDrag(e, false)}
              onPointerCancel={(e) => endDrag(e, true)}
              onClickCapture={onClickCapture}
              onDragStart={(e) => e.preventDefault()}
              style={trackStyle}
              className={[
                // --slide: card width. Mobile shows one card with neighbors peeking in.
                "flex w-full items-center gap-6 [--slide:82%] lg:[--slide:54%]",
                "touch-pan-y select-none",
                loops ? "cursor-grab" : "",
                "data-[dragging=true]:cursor-grabbing data-[dragging=true]:**:cursor-grabbing",
              ].join(" ")}
            >
              {rendered.map((pos, r) => {
                const real = mod(pos, total);
                const wine = wines[real];
                const isClone = pos < 0 || pos >= total;
                const look = slideLook(pos);
                return (
                  <div
                    key={pos}
                    ref={(el) => {
                      slideRefs.current[r] = el;
                    }}
                    role={isClone ? undefined : "group"}
                    aria-roledescription={isClone ? undefined : "slide"}
                    aria-label={isClone ? undefined : `${real + 1} of ${total}`}
                    aria-hidden={isClone ? true : undefined}
                    onFocus={isClone ? undefined : (e) => onSlideFocus(e, real)}
                    className="shrink-0 grow-0 basis-(--slide) origin-center"
                    style={{ transform: `scale(${look.scale})`, opacity: look.opacity, filter: look.filter }}
                  >
                    <WineCard wine={wine} size="lg" inactive={isClone} />
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {loops && (
          <Reveal delay={200} className="mt-10 flex items-center justify-center gap-5">
            <button type="button" onClick={() => move(-1)} aria-label="Previous wine" className={navButton}>
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 font-serif text-lg italic tabular-nums" aria-hidden="true">
              <span className="text-white">{pad(index + 1)}</span>
              <span className="relative h-px w-24 overflow-hidden bg-white/20 sm:w-40">
                <span
                  className="absolute inset-0 origin-left bg-sage-light motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `scaleX(${(index + 1) / total})` }}
                />
              </span>
              <span className="text-white/50">{pad(total)}</span>
            </div>
            <p className="sr-only" aria-live="polite">
              Showing wine {index + 1} of {total}: {current.name}
            </p>

            <button type="button" onClick={() => move(1)} aria-label="Next wine" className={navButton}>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
