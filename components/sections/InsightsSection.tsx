import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";
import InsightFlipCard from "@/components/sections/InsightFlipCard";
import { getInsightGuides } from "@/lib/insights";
import { getAllWines } from "@/lib/wines";

/** Guides shown on the homepage; /insights shows all of them. */
const HOME_LIMIT = 6;

export default async function InsightsSection({ context }: { context: SectionContext }) {
  const [allGuides, wines] = await Promise.all([getInsightGuides(), getAllWines()]);
  /*
    Convert to a plain array of { slug, name } objects so it can be serialized
    across the Server -> Client Component boundary (Maps cannot be serialized).
  */
  const wineEntries = wines.map((wine) => ({ slug: wine.slug, name: wine.name }));
  const guides = context === "home" ? allGuides.slice(0, HOME_LIMIT) : allGuides;

  return (
    <SectionShell
      id="insights"
      context={context}
      eyebrow="Insights"
      title="Know the regions"
      intro="Short guides to the places behind our wines: where they are, which grapes they grow, and what to pour them with."
    >
      <ul className="grid gap-8 justify-items-center md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Reveal delay={(i % 3) * 90}>
              {/*
                InsightFlipCard is a Client Component that owns the FlipCard and
                both its faces, including the onPointerDown handler on the wine link.
                Only serializable props (strings, plain objects) cross the boundary.
              */}
              <InsightFlipCard
                guide={guide}
                wineEntries={wineEntries}
              />
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
