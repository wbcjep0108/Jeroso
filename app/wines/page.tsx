import type { Metadata } from "next";
import AeroShardsBackground from "@/components/effects/AeroShardsBackground";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import WineCard from "@/components/wines/WineCard";
import WineCollection from "@/components/wines/WineCollection";
import { getAllWines } from "@/lib/wines";

export const metadata: Metadata = {
  title: "Wines",
  description: "Explore the full Jeroso wine collection.",
};

export default async function WinesPage() {
  const wines = await getAllWines();

  return (
    // relative + isolate: the -z-10 background stays behind this page's content, not behind the body.
    <div className="relative isolate">
      <AeroShardsBackground />
    <Container className="py-16 sm:py-24">
      <WineCollection wines={wines} showViewAll={false} />

      <section aria-labelledby="all-wines-heading" className="mt-24">
        <Reveal>
          <h2 id="all-wines-heading" className="font-serif text-3xl italic sm:text-4xl">
            All Wines
          </h2>
        </Reveal>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wines.map((wine, i) => (
            <li key={wine.slug}>
              {/* Stagger by column so each row cascades left to right */}
              <Reveal delay={(i % 4) * 90} className="h-full">
                <WineCard wine={wine} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </Container>
    </div>
  );
}
