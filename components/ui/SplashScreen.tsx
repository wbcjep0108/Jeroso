"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { setSplashActive } from "@/lib/splash-state";

/*
  Site splash: wine pours from a tilted bottle into a glass, then the overlay
  fades out. Mounted once, in app/layout.tsx, so it is the first thing painted on
  every full page load and refresh, whatever URL the visitor lands on.

  To test: hard refresh the page (Ctrl+Shift+R). Moving between pages with links
  will not replay it; only a real page load does.

  Timeline, 8s (CSS keyframes in app/globals.css):
    0.0-1.0s  bottle tilts in, glass fades in
    0.8-1.2s  stream falls from the bottle mouth into the glass
    1.2-6.4s  glass fills steadily to about 82 percent; the surface wave loops
    6.4-7.0s  stream retracts into the liquid, bottle tilts back and fades
    7.0-7.4s  surface settles, brand name finishes fading in
    7.4-8.0s  overlay fades out, then unmounts
  Reduced motion (about 2.5s): no bottle, stream, wave or ripples; the wine fades
  in and rises, then the overlay fades out.

  Spill-free by construction: one CSS variable, --splash-fill (0 to 1), sets both
  the liquid's translateY and the clip rectangle that ends the stream, so the
  stream bottom is always the liquid surface. The stream is also clipped to the
  bowl interior plus the open air above the rim, so it can never show outside
  the glass walls.

  The overlay is server-rendered and visible by default, and its own CSS animation
  ends hidden even if JavaScript is slow. JavaScript unmounts it when that
  animation finishes, with a hard 9s cap. Escape ends it early.
*/

const HARD_CAP_MS = 9000;
const ESCAPE_FADE_MS = 260;

/*
  Geometry, in SVG user units (viewBox 0 0 240 300).
  Liquid surface y = SURFACE_EMPTY - FILL_RISE * fill:
    fill 0 -> 228 (just below the bowl bottom at 225), fill 1 -> 166.
  The bowl interior runs from the rim (152) to 225, so full is about 82 percent
  and 14 units below the rim.
*/
const SURFACE_EMPTY = 228;
const FILL_RISE = 62;
const STREAM_X = 128.6;

const surfaceY = `calc((${SURFACE_EMPTY} - var(--splash-fill) * ${FILL_RISE}) * 1px)`;

// Liquid content is drawn with its surface at local y = 4.
const liquidStyle: CSSProperties = {
  transform: `translateY(calc((${SURFACE_EMPTY - 4} - var(--splash-fill) * ${FILL_RISE}) * 1px))`,
};

// --dx: sideways distance a droplet travels before falling back in.
function dropletStyle(dx: number, delay: number): CSSProperties & Record<"--dx", string> {
  return { animationDelay: `${delay}s`, "--dx": String(dx) };
}

type Phase = "playing" | "skipping" | "done";

/*
  Module-level flag: module state survives client-side navigation but is reset by
  every real page load, so the splash plays once per load and never on link clicks,
  even if this component were remounted.
*/
let playedThisLoad = false;

// Shared by every animated SVG part: transforms are relative to the element's own box.
const svgBox = "[transform-box:fill-box]";

const BOWL_INTERIOR = "M81 152 C81 199 98 225 120 225 C142 225 159 199 159 152 Z";
const BOWL_OUTLINE = "M78 150 C78 200 96 228 120 228 C144 228 162 200 162 150 Z";

export default function SplashScreen() {
  // On the first (hydrating) render this is always "playing", matching the server HTML.
  const [phase, setPhase] = useState<Phase>(() => (playedThisLoad ? "done" : "playing"));
  const overlayRef = useRef<HTMLDivElement>(null);
  const escapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = phase !== "done";

  const finish = useCallback(() => {
    setPhase("done");
  }, []);

  const endEarly = useCallback(() => {
    setPhase((p) => (p === "playing" ? "skipping" : p));
    if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current);
    escapeTimerRef.current = setTimeout(finish, ESCAPE_FADE_MS);
  }, [finish]);

  useEffect(() => {
    if (!visible) return;
    const overlay = overlayRef.current;
    const root = document.documentElement;

    playedThisLoad = true;
    setSplashActive(true);

    // Lock scroll, compensating for the scrollbar so the page never shifts.
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    if (overlay) overlay.style.willChange = "transform, opacity";

    // End exactly when the overlay's CSS animation ends (8s, or 2.5s reduced).
    let cancelled = false;
    overlay
      ?.getAnimations()[0]
      ?.finished.then(() => {
        if (!cancelled) finish();
      })
      .catch(() => {
        // Replaced by the Escape fade; its timer finishes instead.
      });
    const cap = setTimeout(finish, HARD_CAP_MS);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") endEarly();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelled = true;
      clearTimeout(cap);
      if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
      if (overlay) overlay.style.willChange = "";
      setSplashActive(false);
    };
  }, [visible, finish, endEarly]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      data-splash-overlay
      data-lenis-prevent
      className={[
        // Above the navbar (z-50) and every page layer.
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-ink",
        phase === "skipping"
          ? "animate-[splash-skip_250ms_ease-out_forwards]"
          : "animate-[splash-overlay_8s_ease-in-out_forwards]",
      ].join(" ")}
    >
      <div role="status" aria-live="polite" className="sr-only">
        Loading
      </div>

      <svg
        aria-hidden="true"
        data-splash-part="svg"
        viewBox="0 0 240 300"
        className="h-[min(56vh,420px)] w-auto overflow-visible"
        // One timeline for the shared progress values (see app/globals.css).
        style={{
          animation:
            "splash-progress-head 8s linear both, splash-progress-fill 8s linear both, splash-progress-tail 8s linear both",
        }}
      >
        <defs>
          <linearGradient id="splash-wine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b2635" />
            <stop offset="1" stopColor="#6b1d2a" />
          </linearGradient>
          <linearGradient id="splash-stream-fill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#6b1d2a" />
            <stop offset="0.5" stopColor="#b0485a" />
            <stop offset="1" stopColor="#6b1d2a" />
          </linearGradient>
          <linearGradient id="splash-bottle-glass" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#101411" />
            <stop offset="0.4" stopColor="#2a332c" />
            <stop offset="1" stopColor="#0b0d0b" />
          </linearGradient>

          <clipPath id="splash-bowl">
            <path d={BOWL_INTERIOR} />
          </clipPath>
          {/* Where the stream may appear: the open air above the rim, or inside the bowl. */}
          <clipPath id="splash-stream-area">
            <rect x="0" y="0" width="240" height="152" />
            <path d={BOWL_INTERIOR} />
          </clipPath>
          {/* Everything above the liquid surface. Moves with --splash-fill. */}
          <clipPath id="splash-above-surface">
            <rect x="0" y="-400" width="240" height="400" style={{ transform: `translateY(${surfaceY})` }} />
          </clipPath>
          {/* Everything above the stream's falling front. */}
          <clipPath id="splash-above-head">
            <rect
              x="0"
              y="-400"
              width="240"
              height="400"
              style={{ transform: "translateY(calc(var(--splash-head) * 1px))" }}
            />
          </clipPath>
          {/* Everything below the stream's retracting top. */}
          <clipPath id="splash-below-tail">
            <rect
              x="0"
              y="0"
              width="240"
              height="400"
              style={{ transform: "translateY(calc(var(--splash-tail) * 1px))" }}
            />
          </clipPath>
        </defs>

        {/* 1. Glass back */}
        <g data-splash-part="glass" className={`${svgBox} animate-[splash-glass_8s_ease-out_both]`}>
          <path d={BOWL_OUTLINE} className="fill-white/[0.03]" />
        </g>

        {/* 2. Liquid, clipped to the bowl; its level comes from --splash-fill. */}
        <g clipPath="url(#splash-bowl)">
          <g data-splash-part="fill" style={liquidStyle}>
            <rect x="60" y="4" width="120" height="90" fill="url(#splash-wine)" />
            {/* Surface wave, looping sideways the whole time; flattens as it settles. */}
            <g data-splash-part="settle" className={`${svgBox} origin-center animate-[splash-settle_8s_ease-out_both]`}>
              <path
                d="M40 4 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V12 H40 Z"
                fill="#8b2635"
                data-splash-part="wave"
                className="animate-[splash-wave_2.4s_linear_infinite]"
              />
            </g>
            {/* Liquid highlight */}
            <path
              d="M88 10 C88 30 94 44 104 52"
              stroke="#c0485a"
              strokeOpacity="0.35"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>

        {/*
          3. Stream. Four nested clips intersect:
             bowl interior or above the rim, above the liquid surface,
             below the retracting top, above the falling front.
        */}
        <g data-splash-part="stream" clipPath="url(#splash-stream-area)">
          <g clipPath="url(#splash-above-surface)">
            <g clipPath="url(#splash-below-tail)">
              <g clipPath="url(#splash-above-head)">
                {/* Leaves the tilted mouth, curves to vertical, tapers as it falls. */}
                <path
                  d={`M125.4 94.2 C127.6 96.4 ${STREAM_X - 0.6} 99.5 ${STREAM_X - 0.6} 105 L${STREAM_X - 0.7} 240 L${STREAM_X + 0.7} 240 L${STREAM_X + 0.9} 105 C${STREAM_X + 0.9} 98.5 ${STREAM_X + 0.2} 95 127.4 92.4 Z`}
                  fill="url(#splash-stream-fill)"
                />
              </g>
            </g>
          </g>
        </g>

        {/* 4. Ripples and droplets at the impact point, riding the same surface level. */}
        <g clipPath="url(#splash-bowl)">
          <g style={liquidStyle}>
            <g data-splash-part="ripples" className="animate-[splash-ripples_8s_linear_both]">
              {[0, 0.45].map((delay) => (
                <ellipse
                  key={`ripple-${delay}`}
                  cx={STREAM_X}
                  cy="4"
                  rx="9"
                  ry="2.2"
                  fill="none"
                  stroke="#d98a96"
                  strokeWidth="0.8"
                  className={`${svgBox} origin-center animate-[splash-ripple_0.9s_ease-out_infinite]`}
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
              {[
                { dx: -5, delay: 0 },
                { dx: 4, delay: 0.27 },
                { dx: -2.5, delay: 0.53 },
              ].map(({ dx, delay }) => (
                <circle
                  key={`drop-${delay}`}
                  cx={STREAM_X}
                  cy="3"
                  r="0.9"
                  fill="#b0485a"
                  className="animate-[splash-droplet_0.8s_ease-out_infinite]"
                  style={dropletStyle(dx, delay)}
                />
              ))}
            </g>
          </g>
        </g>

        {/* 5. Glass front: outline, rim, reflection, stem, base (above the wine). */}
        <g data-splash-part="glass" className={`${svgBox} animate-[splash-glass_8s_ease-out_both]`}>
          <path d={BOWL_OUTLINE} fill="none" className="stroke-sage-light/60" strokeWidth="1.5" />
          <ellipse cx="120" cy="150" rx="42" ry="3" fill="none" className="stroke-sage-light/40" strokeWidth="1" />
          <path
            d="M86 160 C86 188 94 206 106 216"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="118.5" y="228" width="3" height="44" className="fill-sage-light/50" />
          <ellipse cx="120" cy="274" rx="30" ry="4" className="fill-sage-light/30" />
        </g>

        {/* Bottle, tilted so its mouth points down at the glass. Rotates around the mouth. */}
        <g
          data-splash-part="bottle"
          className={`${svgBox} origin-[100%_100%] animate-[splash-bottle_8s_cubic-bezier(0.22,1,0.36,1)_both]`}
        >
          <g transform="translate(128 93) rotate(135)">
            <path
              d="M-5 0 H5 V30 C5 38 16 40 16 52 V118 Q16 124 10 124 H-10 Q-16 124 -16 118 V52 C-16 40 -5 38 -5 30 Z"
              fill="url(#splash-bottle-glass)"
              className="stroke-sage-dark"
              strokeWidth="0.8"
            />
            <rect x="-6" y="-3" width="12" height="6" rx="1.5" className="fill-sage-dark" />
            <rect x="-16" y="70" width="32" height="30" className="fill-sage-light" />
            <rect x="-10" y="80" width="20" height="3" className="fill-sage-dark" />
            <rect x="-12" y="90" width="24" height="1.2" className="fill-sage-dark" />
            <path d="M-11 56 V114" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>

      <p
        aria-hidden="true"
        data-splash-part="brand"
        className="mt-6 font-serif text-4xl italic tracking-wide text-white animate-[splash-brand_8s_ease-out_both] sm:text-5xl"
      >
        Jeroso
      </p>
    </div>
  );
}
