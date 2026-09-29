import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";
import { getInsightGuides } from "@/lib/insights";
import { getAllWines } from "@/lib/wines";

/** Guides shown on the homepage; /insights shows all of them. */
const HOME_LIMIT = 6;

export default async function InsightsSection({ context }: { context: SectionContext }) {
  const [allGuides, wines] = await Promise.all([getInsightGuides(), getAllWines()]);
  const wineNames = new Map(wines.map((wine) => [wine.slug, wine.name]));
  const guides = context === "home" ? allGuides.slice(0, HOME_LIMIT) : allGuides;

  return (
    <SectionShell
      id="insights"
      context={context}
      eyebrow="Insights"
      title="Know the regions"
      intro="Short guides to the places behind our wines: where they are, which grapes they grow, and what to pour them with."
    >
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Reveal delay={(i % 3) * 90} className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-ink-line bg-ink-soft p-6">
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
                        <Link
                          href={`/wines/${slug}`}
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
            </Reveal>
          </li>
        ))}
      </ul>

      {context === "home" && allGuides.length > guides.length && (
        <div className="mt-10">
          <Link
            href="/insights"
            className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            See all {allGuides.length} guides
            <ArrowRight aria-hidden="true" className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </SectionShell>
  );
}
