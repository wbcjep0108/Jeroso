'use client';

import React, { useEffect, useRef } from 'react';

/*
  React Bits GlareHover, with these project changes:
  - The glare overlay renders after {children} with a z-index, so it sits above them.
    It keeps pointer-events: none.
  - width and height default to "100%"; background and borderColor default to "transparent".
  - prefers-reduced-motion: no glare animation at all.
  - Pointer events instead of mouse events, plus a touch fallback: a tap plays the
    glare once. A forced reflow resets the start position so replays always run.
*/

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const START_POSITION = '-100% -100%, 0 0';
const END_POSITION = '100% 100%, 0 0';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = '100%',
  height = '100%',
  background = 'transparent',
  borderRadius = '10px',
  borderColor = 'transparent',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {}
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;

  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el || prefersReducedMotion()) return;

    el.style.transition = 'none';
    el.style.backgroundPosition = START_POSITION;
    // Commit the reset position before re-enabling the transition.
    void el.offsetWidth;
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = END_POSITION;
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;

    if (playOnce || prefersReducedMotion()) {
      el.style.transition = 'none';
      el.style.backgroundPosition = START_POSITION;
    } else {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = START_POSITION;
    }
  };

  // Mouse and pen hover. Touch has no hover, so it is handled on pointerdown.
  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') animateIn();
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') animateOut();
  };

  // Touch fallback: one sweep per tap, then reset invisibly.
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    animateIn();
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      const el = overlayRef.current;
      if (!el) return;
      el.style.transition = 'none';
      el.style.backgroundPosition = START_POSITION;
    }, transitionDuration);
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderRadius: 'inherit',
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: START_POSITION,
    pointerEvents: 'none'
  };

  return (
    <div
      className={`relative grid place-items-center overflow-hidden border cursor-pointer ${className}`}
      style={{
        width,
        height,
        background,
        borderRadius,
        borderColor,
        // A transparent border would still take up 1px on each side; drop it entirely.
        borderWidth: borderColor === 'transparent' ? 0 : undefined,
        ...style
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      {children}
      <div ref={overlayRef} aria-hidden="true" style={overlayStyle} />
    </div>
  );
};

export default GlareHover;
