"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface AnimatedFooterProps {
  headingLines?: string[];
  leftImage?: string;
  rightImage?: string;
  background?: string;
  textColor?: string;
  asciiChars?: string;
  charColor?: string;
  hoverColor?: string;
  hoverCharColor?: string;
  columns?: number;
  cellSize?: number;
  fontSize?: number;
  parallaxStrength?: number;
  hoverRadius?: number;
  revealOnScroll?: boolean;
  revealed?: boolean;
  className?: string;
}

const DEFAULT_ASCII_CHARS = "........jennifer";
const HIGHLIGHT_LIFETIME = 300;
const CLUSTER_SIZE = 10;
const PARALLAX_EASE = 0.05;

interface Cell {
  col: number;
  row: number;
  char: string;
  tone: number;
  highlightEndTime: number;
}

interface Hand {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cells: Map<string, Cell>;
  cellList: Cell[];
  rows: number;
  columns: number;
  cellSize: number;
  baselineOffset: number;
  direction: 1 | -1;
}

function buildHandCells(
  image: HTMLImageElement,
  columns: number,
  asciiChars: string,
): { columns: number; rows: number; cells: Map<string, Cell> } {
  const sampledRows = Math.max(
    1,
    Math.round(columns / (image.naturalWidth / image.naturalHeight || 1)),
  );

  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = sampledRows;
  const sampleCtx = sampler.getContext("2d");
  const cells = new Map<string, Cell>();
  if (!sampleCtx) return { columns, rows: sampledRows, cells };

  sampleCtx.drawImage(image, 0, 0, columns, sampledRows);
  const pixels = sampleCtx.getImageData(0, 0, columns, sampledRows).data;
  const backgroundCharIndex = asciiChars.lastIndexOf(".");
  const sampledCells: Cell[] = [];
  let minCol = columns;
  let maxCol = -1;
  let minRow = sampledRows;
  let maxRow = -1;

  for (let row = 0; row < sampledRows; row++) {
    for (let col = 0; col < columns; col++) {
      const offset = (row * columns + col) * 4;
      // The supplied PNG hands use transparent pixels around the silhouette. Canvas
      // exposes their RGB channels as black, so alpha must be checked before the
      // brightness conversion or the empty canvas becomes a block of ASCII.
      if (pixels[offset + 3] < 16) continue;
      const brightness =
        (pixels[offset] * 0.299 +
          pixels[offset + 1] * 0.587 +
          pixels[offset + 2] * 0.114) /
        255;
      const charIndex = Math.min(
        asciiChars.length - 1,
        Math.floor((1 - brightness) * asciiChars.length),
      );
      if (charIndex <= backgroundCharIndex) continue;

      sampledCells.push({
        col,
        row,
        char: asciiChars[charIndex],
        tone: charIndex / Math.max(1, asciiChars.length - 1),
        highlightEndTime: 0,
      });
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
    }
  }

  if (sampledCells.length === 0) return { columns, rows: sampledRows, cells };

  const croppedColumns = maxCol - minCol + 1;
  const croppedRows = maxRow - minRow + 1;
  for (const sampledCell of sampledCells) {
    const cell = {
      ...sampledCell,
      col: sampledCell.col - minCol,
      row: sampledCell.row - minRow,
    };
    cells.set(`${cell.col},${cell.row}`, cell);
  }

  return { columns: croppedColumns, rows: croppedRows, cells };
}

function resolveCssColor(root: HTMLElement, value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  root.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || fallback;
}

function highlightCluster(cells: Map<string, Cell>, startCell: Cell) {
  const now = Date.now();
  startCell.highlightEndTime = now + HIGHLIGHT_LIFETIME;

  const steps = Math.floor(Math.random() * CLUSTER_SIZE) + 1;
  const litCells = [startCell];
  let current = startCell;

  for (let step = 0; step < steps; step++) {
    const neighbours: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const neighbour = cells.get(`${current.col + dx},${current.row + dy}`);
        if (neighbour && !litCells.includes(neighbour)) neighbours.push(neighbour);
      }
    }
    if (neighbours.length === 0) break;

    const next = neighbours[Math.floor(Math.random() * neighbours.length)];
    next.highlightEndTime = now + HIGHLIGHT_LIFETIME + step * 10;
    litCells.push(next);
    current = next;
  }
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = getComputedStyle(el).overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el;
    el = el.parentElement;
  }
  return null;
}

export function AnimatedFooter({
  headingLines = ["Get in touch"],
  leftImage = "/animated-footer/left%20hand.png",
  rightImage = "/animated-footer/right%20hand.png",
  background,
  textColor,
  charColor,
  hoverColor,
  hoverCharColor,
  asciiChars = DEFAULT_ASCII_CHARS,
  columns = 80,
  cellSize = 20,
  fontSize = 18,
  parallaxStrength = 10,
  hoverRadius = 8,
  revealOnScroll = true,
  revealed,
  className,
}: AnimatedFooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const leftWrapRef = useRef<HTMLDivElement>(null);
  const rightWrapRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  const animateInRef = useRef<() => void>(() => { });
  const animateOutRef = useRef<() => void>(() => { });

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cc = charColor ?? (isDark ? "rgb(255 255 255 / 0.6)" : "rgb(0 0 0 / 0.6)");
  const hc = hoverColor ?? (isDark ? "#ffffff" : "#0b0c0b");
  const hcc = hoverCharColor ?? (isDark ? "#0b0c0b" : "#ffffff");

  const liveRef = useRef({ charColor: cc, hoverColor: hc, hoverCharColor: hcc, parallaxStrength, hoverRadius });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const syncColors = () => {
      liveRef.current = {
        charColor: resolveCssColor(root, cc, "rgba(255, 255, 255, 0.6)"),
        hoverColor: resolveCssColor(root, hc, "rgb(255, 255, 255)"),
        hoverCharColor: resolveCssColor(root, hcc, "rgb(11, 12, 11)"),
        parallaxStrength,
        hoverRadius,
      };
    };
    syncColors();
    const themeObserver = new MutationObserver(syncColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => themeObserver.disconnect();
  }, [cc, hc, hcc, parallaxStrength, hoverRadius, resolvedTheme]);

  const sig = useMemo(
    () =>
      JSON.stringify({
        leftImage,
        rightImage,
        columns,
        cellSize,
        fontSize,
        asciiChars,
        revealOnScroll,
        headingLines,
      }),
    [leftImage, rightImage, columns, cellSize, fontSize, asciiChars, revealOnScroll, headingLines],
  );

  useEffect(() => {
    const root = rootRef.current;
    const leftWrap = leftWrapRef.current;
    const rightWrap = rightWrapRef.current;
    if (!root || !leftWrap || !rightWrap) return;

    const hands: Hand[] = [];
    const wrappers = [leftWrap, rightWrap];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setupHand = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      direction: 1 | -1,
    ) => {
      const { columns: handColumns, rows, cells } = buildHandCells(image, columns, asciiChars);
      if (cells.size === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = handColumns * cellSize * dpr;
      canvas.height = rows * cellSize * dpr;
      const wrapper = direction === 1 ? leftWrap : rightWrap;
      wrapper.style.setProperty("--hand-aspect", String(handColumns / rows));

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const metrics = ctx.measureText("X");
      const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const baselineOffset = cellSize / 2 + glyphHeight / 2 - metrics.actualBoundingBoxDescent;

      hands.push({
        canvas,
        ctx,
        cells,
        cellList: [...cells.values()],
        rows,
        columns: handColumns,
        cellSize,
        baselineOffset,
        direction,
      });
    };

    const loadHand = (src: string, canvas: HTMLCanvasElement, direction: 1 | -1) => {
      if (!src) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      let initialized = false;
      const init = () => {
        if (initialized) return;
        initialized = true;
        setupHand(image, canvas, direction);
      };
      image.onload = init;
      image.src = src;
      if (image.complete && image.naturalWidth) init();
    };
    loadHand(leftImage, leftCanvasRef.current!, 1);
    loadHand(rightImage, rightCanvasRef.current!, -1);

    const renderHand = (hand: Hand, now: number) => {
      const { ctx, cellList, cellSize: cs, baselineOffset, columns: cols, rows } = hand;
      const { charColor: cc, hoverColor: hc, hoverCharColor: hcc } = liveRef.current;
      ctx.clearRect(0, 0, cols * cs, rows * cs);

      for (const cell of cellList) {
        const x = cell.col * cs;
        const y = cell.row * cs;
        const isHighlighted = cell.highlightEndTime > now;

        if (isHighlighted) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = hc;
          ctx.fillRect(x, y, cs, cs);
        }
        ctx.globalAlpha = isHighlighted ? 1 : 0.72 + cell.tone * 0.28;
        ctx.fillStyle = isHighlighted ? hcc : cc;
        ctx.fillText(cell.char, x + cs / 2, y + baselineOffset);
      }
      ctx.globalAlpha = 1;
    };

    const pointer = { x: 0, y: 0 };
    const drift = { x: 0, y: 0 };
    const curtain = { offset: revealOnScroll && !reducedMotion ? 125 : 0 };

    const hoverHand = (hand: Hand, clientX: number, clientY: number) => {
      const rect = hand.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const mouseCol = ((clientX - rect.left) / rect.width) * hand.columns;
      const mouseRow = ((clientY - rect.top) / rect.height) * hand.rows;

      let closest: Cell | null = null;
      let closestDist = Infinity;
      for (const cell of hand.cellList) {
        const dx = mouseCol - cell.col;
        const dy = mouseRow - cell.row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = cell;
        }
      }
      if (closest && closestDist <= liveRef.current.hoverRadius) {
        highlightCluster(hand.cells, closest);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const strength = reducedMotion ? 0 : liveRef.current.parallaxStrength;
      const rect = root.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      pointer.x = ((event.clientX - rect.left) / w - 0.5) * strength * 2;
      pointer.y = ((event.clientY - rect.top) / h - 0.5) * strength * 2;
      for (const hand of hands) hoverHand(hand, event.clientX, event.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    let rafId: number | null = null;
    let canvasVisible = true;
    const frame = () => {
      if (!canvasVisible) {
        rafId = null;
        return;
      }
      const now = Date.now();
      for (const hand of hands) renderHand(hand, now);

      drift.x += (pointer.x - drift.x) * PARALLAX_EASE;
      drift.y += (pointer.y - drift.y) * PARALLAX_EASE;
      const scale = 1;

      wrappers.forEach((wrapper, i) => {
        const dir = i === 0 ? 1 : -1;
        const revealX = i === 0 ? -curtain.offset : curtain.offset;
        const x = drift.x * dir || 0;
        const y = -drift.y || 0;
        wrapper.style.transform = `translateX(${revealX}%) translate(${x}px, ${y}px) scale(${scale})`;
      });

      rafId = requestAnimationFrame(frame);
    };
    const startFrameLoop = () => {
      if (canvasVisible && rafId === null) rafId = requestAnimationFrame(frame);
    };
    const stopFrameLoop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };
    const canvasVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        canvasVisible = entry.isIntersecting;
        if (canvasVisible) startFrameLoop();
        else stopFrameLoop();
      },
      { root: getScrollParent(root), rootMargin: "200px", threshold: 0 },
    );
    canvasVisibilityObserver.observe(root);
    startFrameLoop();

    const chars = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-af-char]"));

    const animateIn = () => {
      if (reducedMotion) {
        curtain.offset = 0;
        showAll();
        return;
      }
      gsap.to(curtain, { offset: 0, duration: 1, ease: "power3.out", overwrite: true });
      if (chars.length) {
        gsap.to(chars, {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
          stagger: { each: 0.04, from: "center" },
          overwrite: true,
        });
      }
    };

    const animateOut = () => {
      if (reducedMotion) {
        curtain.offset = 0;
        showAll();
        return;
      }
      gsap.to(curtain, { offset: 125, duration: 0.4, ease: "power2.in", overwrite: true });
      if (chars.length) {
        gsap.to(chars, {
          yPercent: 125,
          duration: 0.4,
          ease: "power2.in",
          stagger: { each: 0.01, from: "center" },
          overwrite: true,
        });
      }
    };

    animateInRef.current = animateIn;
    animateOutRef.current = animateOut;

    const maskAll = () => {
      if (chars.length) gsap.set(chars, { yPercent: 125 });
    };
    const showAll = () => {
      if (chars.length) gsap.set(chars, { yPercent: 0 });
    };

    let observer: IntersectionObserver | null = null;

    if (reducedMotion) {
      curtain.offset = 0;
      showAll();
    } else if (revealed !== undefined) {
      curtain.offset = revealed ? 0 : 125;
      if (revealed) showAll();
      else maskAll();
    } else if (revealOnScroll) {
      maskAll();

      let isRevealed = false;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !isRevealed) {
              isRevealed = true;
              animateIn();
            } else if (!entry.isIntersecting && isRevealed) {
              isRevealed = false;
              animateOut();
            }
          }
        },
        { root: getScrollParent(root), threshold: 0.35 },
      );
      observer.observe(root);
    } else {
      showAll();
    }

    return () => {
      stopFrameLoop();
      window.removeEventListener("mousemove", onMouseMove);
      observer?.disconnect();
      canvasVisibilityObserver.disconnect();
      gsap.killTweensOf([curtain, ...chars]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  useEffect(() => {
    if (revealed === undefined) return;
    if (revealed) animateInRef.current();
    else animateOutRef.current();
  }, [revealed]);

  const startsHidden = revealed !== undefined ? !revealed : revealOnScroll;
  const offEdge = startsHidden ? 125 : 0;

  return (
    <footer
      ref={rootRef}
      className={cn(
        "relative h-full w-full overflow-hidden",
        !background && "bg-white dark:bg-black",
        !textColor && "text-black dark:text-white",
        className,
      )}
      style={{ backgroundColor: background, color: textColor, containerType: "inline-size" }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-[1%]">
        <div
          ref={leftWrapRef}
          className="relative h-[min(92%,calc(48cqw/var(--hand-aspect,1)))] max-w-[48%] will-change-transform"
          style={{ transform: `translateX(-${offEdge}%)`, aspectRatio: "var(--hand-aspect, 1)" }}
        >
          <canvas ref={leftCanvasRef} className="block h-full w-full" />
        </div>
        <div
          ref={rightWrapRef}
          className="relative h-[min(92%,calc(48cqw/var(--hand-aspect,1)))] max-w-[48%] will-change-transform"
          style={{ transform: `translateX(${offEdge}%)`, aspectRatio: "var(--hand-aspect, 1)" }}
        >
          <canvas ref={rightCanvasRef} className="block h-full w-full" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-4 p-8">
        {headingLines.map((word, wi) => (
          <h2
            key={`${word}-${wi}`}
            aria-label={word}
            className="overflow-hidden font-medium leading-none tracking-tight pb-[0.15em] -mb-[0.15em]"
            style={{ fontSize: "clamp(2rem, 13cqw, 11rem)" }}
          >
            {Array.from(word).map((ch, ci) => (
              <span key={ci} data-af-char aria-hidden="true" className="inline-block">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h2>
        ))}
      </div>
    </footer>
  );
}

export default AnimatedFooter;
