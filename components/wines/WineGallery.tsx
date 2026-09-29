"use client";

import Image from "next/image";
import { useState } from "react";
import GlareHover from "@/components/ui/GlareHover";
import ImageLightbox from "@/components/wines/ImageLightbox";

type WineGalleryProps = {
  name: string;
  images: string[];
};

/** Large bottle image with small thumbnail selectors below it. */
export default function WineGallery({ name, images }: WineGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col items-center">
      {/*
        Glare sweeps across the whole card. GlareHover clips it to the same 1.5rem
        radius (overflow hidden, its default) and adds no border or spacing of its own.
        cursor default because the card is not a link.
      */}
      <GlareHover
        width="100%"
        height="100%"
        glareColor="#ffffff"
        glareOpacity={0.16}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={800}
        playOnce={false}
        borderRadius="1.5rem"
        style={{ cursor: "default" }}
      >
        {/* Fixed-height card; the bottle is contained inside its 24px padding at every width. */}
        <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-ink-line bg-ink-soft p-6 sm:h-[560px]">
          {/* Glow behind the bottle, kept inside the card instead of a large spilling shadow. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_50%_58%,rgba(143,158,144,0.14),transparent_70%)]"
          />
          {/* Click or tap the bottle to open it in a centered pop-up. */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Enlarge image of ${name}`}
            aria-haspopup="dialog"
            className="relative block h-full w-full cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light"
          >
            <Image
              key={current}
              src={current}
              alt={active === 0 ? `Bottle of ${name}` : `${name}, image ${active + 1}`}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              loading="eager"
              className="max-h-full max-w-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.55)] motion-safe:animate-fade-in"
            />
          </button>
        </div>
      </GlareHover>

      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        index={active}
        onIndexChange={setActive}
        name={name}
      />

      {images.length > 1 && (
        <ul className="mt-5 flex items-center gap-3" aria-label="Choose image">
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active ? "true" : undefined}
                className={`flex h-14 w-10 items-center justify-center rounded-lg border bg-ink-soft p-1 motion-safe:transition-colors ${
                  i === active ? "border-sage-light" : "border-ink-line hover:border-sage"
                }`}
              >
                <Image src={src} alt="" width={40} height={120} className="h-full w-auto" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
