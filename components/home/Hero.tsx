import Image from "next/image";
import Link from "next/link";
import { preload } from "react-dom";
import HalftoneHero from "@/components/effects/HalftoneHero";
import { HERO_HALFTONE_SRC } from "@/components/effects/halftone-config";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import { displayWineMeta } from "@/lib/wine-display";
import type { Wine } from "@/lib/wines";

type HeroProps = {
  weeklyPick: Wine;
};

const headline = ["Journey.", "Essence.", "Nectar."];

export default function Hero({ weeklyPick }: HeroProps) {
 
  preload(HERO_HALFTONE_SRC, { as: "image", crossOrigin: "anonymous", fetchPriority: "high" });

  return (
    <section aria-labelledby="hero-heading" className="relative isolate flex h-svh min-h-[560px] items-center overflow-hidden">
      {/* Full-bleed halftone background (homepage only). Static image fallback lives inside HalftoneHero. */}
      <div className="absolute inset-0 -z-10">
        <HalftoneHero />
      </div>
      {/* Scrims for text readability, top and bottom. pointer-events-none so hover reaches the canvas. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-linear-to-b from-ink/90 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-ink via-ink/60 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-ink/30" />

      <Container className="pointer-events-none [&_a]:pointer-events-auto">
        <Reveal className="flex flex-col items-center text-center">
        <h1 id="hero-heading" className="font-serif text-6xl italic leading-[0.95] sm:text-7xl lg:text-8xl">
          {headline.map((word, i) => (
            <span
              key={word}
              className="block motion-safe:animate-fade-up"
              style={{ animationDelay: `${i * 140}ms` }}
            >
              {word}
            </span>
          ))}
        </h1>
       
        <Link
          href="/wines"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-medium text-ink hover:bg-sage-light motion-safe:transition-colors motion-safe:animate-fade-up [animation-delay:600ms]"
        >
          Start Your Journey
        </Link>
        </Reveal>
      </Container>

      {/* Floating feature card, bottom-left (hidden on mobile). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8">
        <Container>
          <Reveal delay={200} className="flex items-end justify-between">
          <Link
            href={`/wines/${weeklyPick.slug}`}
            className="pointer-events-auto hidden max-w-sm items-center md:flex gap-4 rounded-2xl border border-white/10 bg-ink/60 p-4 backdrop-blur-md hover:border-sage motion-safe:transition-colors"
          >
            <span className="flex h-20 w-10 shrink-0 items-center justify-center">
              <Image
                src={weeklyPick.image}
                alt=""
                width={40}
                height={120}
                className="h-full w-auto"
              />
            </span>
            <span className="flex flex-col text-left">
              <span className="text-[11px] uppercase tracking-[0.2em] text-sage">
                This week&apos;s picks by sommeliers
              </span>
              <span className="mt-1 font-serif text-xl italic">{weeklyPick.name}</span>
              <span className="mt-1 text-xs text-white/60">{displayWineMeta(weeklyPick)}</span>
            </span>
          </Link>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
