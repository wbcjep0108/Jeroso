"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  name: string;
};

/*
  Centered image pop-up built on the native <dialog> element:
  showModal() gives the top layer, a focus trap, Escape to close, and focus
  returning to the trigger on close. Clicking the dimmed area closes it.
  Page scroll (including Lenis) is locked while it is open.
*/
export default function ImageLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  name,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = images.length;
  const src = images[index] ?? images[0];

  // Keep the native dialog in sync with the open prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open, compensating for the scrollbar so nothing shifts.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
    };
  }, [open]);

  const go = (delta: number) => onIndexChange((index + delta + total) % total);

  function onDialogClick(e: MouseEvent<HTMLDialogElement>) {
    // Only clicks on the empty dimmed area (the dialog itself) close it.
    if (e.target === e.currentTarget) onClose();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (total < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  const iconButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-white/85 backdrop-blur-md hover:border-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light motion-safe:transition-colors";

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${name}, enlarged image`}
      data-lenis-prevent
      onClose={onClose}
      onCancel={onClose}
      onClick={onDialogClick}
      onKeyDown={onKeyDown}
      className={[
        "m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-4 text-white sm:p-8",
        "open:flex open:items-center open:justify-center",
        "backdrop:bg-black/80 backdrop:backdrop-blur-sm",
        // Fade and scale in and out; instant when reduced motion is preferred.
        "scale-95 opacity-0 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0",
        "transition-[opacity,scale,overlay,display] transition-discrete duration-300 ease-out motion-reduce:duration-0",
      ].join(" ")}
    >
      <figure className="relative flex h-full max-h-[900px] w-full max-w-[560px] flex-col items-center justify-center">
        <div className="relative h-full min-h-0 w-full flex-1">
          <Image
            key={src}
            src={src}
            alt={index === 0 ? `Bottle of ${name}` : `${name}, image ${index + 1}`}
            fill
            sizes="(min-width: 640px) 560px, 92vw"
            className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] motion-safe:animate-fade-in"
          />
        </div>
        <figcaption className="mt-4 text-center text-sm text-white/70">
          <span className="font-serif text-lg italic text-white">{name}</span>
          {total > 1 && (
            <span className="ml-3 tabular-nums">
              {index + 1} / {total}
            </span>
          )}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className={`${iconButton} absolute right-4 top-4 sm:right-8 sm:top-8`}
      >
        <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className={`${iconButton} absolute left-4 top-1/2 -translate-y-1/2 sm:left-8`}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className={`${iconButton} absolute right-4 top-1/2 -translate-y-1/2 sm:right-8`}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </>
      )}
    </dialog>
  );
}
