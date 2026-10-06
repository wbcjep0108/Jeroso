"use client";

import FlipCard from "@/components/ui/FlipCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { InsightGuide } from "@/lib/insights";

type InsightFlipCardProps = {
  guide: InsightGuide;
  /** Serializable array of { slug, name } pairs from lib/wines. */
  wineEntries: { slug: string; name: string }[];
};

const CARD_BG = "#13120e";

export default function InsightFlipCard({ guide, wineEntries }: InsightFlipCardProps) {
  const wineNames = new Map(wineEntries.map((wine) => [wine.slug, wine.name]));

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
        /* Reference treatment: a moody full-bleed image with editorial overlays. */
        <div className="relative h-full w-full overflow-hidden bg-black">
          <div
            role="img"
            aria-label={`Landscape of ${guide.country}`}
            className="absolute inset-0 h-full w-full bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${guide.image}")`, backgroundSize: "cover" }}
          />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
          <div className="absolute inset-x-0 top-0 p-7 sm:p-8">
            <h3 className="max-w-[90%] font-serif text-4xl italic leading-[0.95] tracking-[-0.03em] text-white sm:text-5xl">
              {guide.region}
            </h3>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 text-sm font-medium text-white/70 sm:p-8">
            <span>{guide.country}</span>
            <span className="text-right">Tap to flip</span>
          </div>
        </div>
      }
      back={
        /* Reverse treatment: artwork stays visible while the original wine information remains available. */
        <div className="relative h-full w-full overflow-hidden">
          <div
            role="img"
            aria-label={`${guide.region}, ${guide.country}`}
            className="absolute inset-0 h-full w-full bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${guide.image}")`,
              backgroundSize: "cover",
              filter: "grayscale(1) invert(1)",
            }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <article className="relative flex h-full flex-col p-6 text-white sm:p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-sage">{guide.country}</p>
            <h3 className="mt-3 font-serif text-3xl italic">{guide.region}</h3>
            <dl className="mt-5 space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="text-white/60">Grapes</dt>
                <dd className="mt-1 text-white/85">{guide.grapes}</dd>
              </div>
              <div>
                <dt className="text-white/60">Style</dt>
                <dd className="mt-1 text-white/85">{guide.style}</dd>
              </div>
              <div>
                <dt className="text-white/60">Pairs with</dt>
                <dd className="mt-1 text-white/85">{guide.pairings}</dd>
              </div>
            </dl>
            <ul className="mt-auto space-y-1 pt-6">
              {guide.wineSlugs
                .filter((slug) => wineNames.has(slug))
                .map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/wines/${slug}`}
                      onPointerDown={(event) => event.stopPropagation()}
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
        </div>
      }
    />
  );
}
