import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";
import InsightFlipCard from "@/components/sections/InsightFlipCard";
import InsightsHomeExperience from "@/components/sections/InsightsHomeExperience";
import { getInsightGuides } from "@/lib/insights";
import { getAllWines } from "@/lib/wines";

const HOME_LIMIT = 3;
const SECTION_EYEBROW = "Insights";
const SECTION_TITLE = "Know the regions";
const SECTION_INTRO = "Short guides to the places behind our wines: where they are, which grapes they grow, and what to pour them with.";

export default async function InsightsSection({ context, showHeader = true }: { context: SectionContext; showHeader?: boolean }) {
  const [allGuides, wines] = await Promise.all([getInsightGuides(), getAllWines()]);
  /*
    Convert to a plain array of { slug, name } objects so it can be serialized
    across the Server -> Client Component boundary (Maps cannot be serialized).
  */
  const wineEntries = wines.map((wine) => ({ slug: wine.slug, name: wine.name }));
  const guides = context === "home" ? allGuides.slice(0, HOME_LIMIT) : allGuides;
  const cardsRevealOnce = context === "home" || !showHeader;

  const section = (
    <SectionShell
      id="insights"
      context={context}
      eyebrow={SECTION_EYEBROW}
      title={SECTION_TITLE}
      intro={SECTION_INTRO}
      showHeader={context === "home" ? false : showHeader}
    >
      <ul className="grid gap-8 justify-items-center md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Reveal delay={cardsRevealOnce ? i * 55 : (i % 3) * 90} subtle={cardsRevealOnce} once={cardsRevealOnce}>
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

  if (context !== "home") return section;

  return (
    <InsightsHomeExperience eyebrow={SECTION_EYEBROW} title={SECTION_TITLE} intro={SECTION_INTRO}>
      {section}
    </InsightsHomeExperience>
  );
}
