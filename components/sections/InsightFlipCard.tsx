"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FlipCard from "@/components/ui/FlipCard";
import type { InsightGuide } from "@/lib/insights";

type InsightFlipCardProps = {
  guide: InsightGuide;
  /** Serializable array of { slug, name } pairs from lib/wines. */
  wineEntries: { slug: string; name: string }[];
};

const CARD_BG = "#13120e";

export default function InsightFlipCard({ guide, wineEntries }: InsightFlipCardProps) {
  const wineNames = new Map(wineEntries.map((w) => [w.slug, w.name]));

  return (
    <FlipCard
      axis="y"
      flipOnClick
      draggable
      tilt
      tiltMax={10}
      glare
      glareOpacity={0.15}
      hoverScale={1.03}
      width={400}
      height={540}
      radius={22}
      background={CARD_BG}
      color="#f5f5f5"
      shadow
      shadowColor="#000000"
      shadowOpacity={0.5}
      ariaLabel={`${guide.region} — click or press Enter to see details`}
      front={
        /* Front face: full-bleed country photo + gradient overlay + region label */
        <div className="relative h-full w-full overflow-hidden">
          <div
            role="img"
            aria-label={`Landscape of ${guide.country}`}
            className="absolute inset-0 h-full w-full bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${guide.image}")`, backgroundSize: "cover" }}
          />
          {/* Dark gradient so text is always legible over any photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-sage">{guide.country}</p>
            <h3 className="mt-2 font-serif text-4xl italic text-white">{guide.region}</h3>
            <p className="mt-4 text-xs text-white/50">Tap to flip</p>
          </div>
        </div>
      }
      back={
        /* Back face: same content order as the original flat cards */
        <article className="flex h-full flex-col p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-sage">{guide.country}</p>
          <h3 className="mt-3 font-serif text-3xl italic">{guide.region}</h3>
          <dl className="mt-5 space-y-4 text-sm leading-relaxed">
            <div>
              <dt className="text-white/50">Grapes</dt>
              <dd className="mt-1 text-white/80">{guide.grapes}</dd>
            </div>
            <div>
              <dt className="text-white/50">Style</dt>
              <dd className="mt-1 text-white/80">{guide.style}</dd>
            </div>
            <div>
              <dt className="text-white/50">Pairs with</dt>
              <dd className="mt-1 text-white/80">{guide.pairings}</dd>
            </div>
          </dl>
          <ul className="mt-auto space-y-1 pt-6">
            {guide.wineSlugs
              .filter((slug) => wineNames.has(slug))
              .map((slug) => (
                <li key={slug}>
                  {/*
                    onPointerDown stopPropagation: prevents the FlipCard root from
                    capturing the pointer, so the link click navigates instead of
                    flipping the card back to the front.
                  */}
                  <Link
                    href={`/wines/${slug}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="group inline-flex items-center gap-2 text-sm text-sage-light hover:text-white"
                  >
                    {wineNames.get(slug)}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              ))}
          </ul>
        </article>
      }
    />
  );
}
