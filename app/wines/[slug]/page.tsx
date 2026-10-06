import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import PurchasePanel from "@/components/wines/PurchasePanel";
import RatingDots from "@/components/wines/RatingDots";
import WineGallery from "@/components/wines/WineGallery";
import WishlistButton from "@/components/wines/WishlistButton";
import { displayWineMeta } from "@/lib/wine-display";
import {
  characteristicLabels,
  formatPrice,
  getAllWines,
  getWineBySlug,
  type WineCharacteristics,
} from "@/lib/wines";

export async function generateStaticParams() {
  const wines = await getAllWines();
  return wines.map((wine) => ({ slug: wine.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/wines/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) return { title: "Wine not found" };
  return { title: wine.name, description: wine.tastingNote };
}

export default async function WineDetailPage({ params }: PageProps<"/wines/[slug]">) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) notFound();

  const characteristicKeys = Object.keys(characteristicLabels) as (keyof WineCharacteristics)[];

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/wines"
        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <WineGallery name={wine.name} images={[wine.image, ...wine.gallery]} />
        </Reveal>

        <div>
          <Reveal delay={100}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage">
                {wine.appellation}
              </p>
              <h1 className="mt-3 font-serif text-5xl italic leading-tight sm:text-6xl">
                {wine.name}
              </h1>
              <p className="mt-3 text-sm text-white/60">
                {displayWineMeta(wine, { withCountry: true })}
              </p>
            </div>
            <WishlistButton wineSlug={wine.slug} wineName={wine.name} />
          </div>

          <p className="mt-6 font-serif text-4xl">{formatPrice(wine.price)}</p>

          {wine.tags && wine.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Highlights">
              {wine.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-sage-dark bg-sage-dark/20 px-3 py-1 text-xs text-sage-light"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-lg leading-relaxed text-white/80">{wine.tastingNote}</p>

          <div className="mt-8">
            <PurchasePanel wine={wine} />
          </div>
          </Reveal>

          <Reveal className="mt-14">
          <section aria-labelledby="characteristics-heading">
            <h2 id="characteristics-heading" className="font-serif text-3xl italic">
              Characteristics
            </h2>
            <dl className="mt-4">
              {characteristicKeys.map((key) => (
                <RatingDots
                  key={key}
                  label={characteristicLabels[key]}
                  value={wine.characteristics[key]}
                />
              ))}
            </dl>
          </section>
          </Reveal>

          <Reveal className="mt-14">
          <section aria-labelledby="story-heading">
            <h2 id="story-heading" className="font-serif text-3xl italic">
              The Story
            </h2>
            <p className="mt-4 leading-relaxed text-white/75">{wine.story}</p>
          </section>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
