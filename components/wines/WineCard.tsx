import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/wines/AddToCartButton";
import { displayVintage } from "@/lib/wine-display";
import { formatPrice, type Wine } from "@/lib/wines";

type WineCardProps = {
  wine: Wine;
  /** "lg" is the featured center card, "sm" is a flanking or grid card. */
  size?: "sm" | "lg";
  /** Removes the card from the tab order (used for cloned carousel slides). */
  inactive?: boolean;
};

/*
  The whole card opens the detail page through one overlay <Link> that covers the
  card. The visible content sits above it with pointer-events disabled, so clicks
  fall through to the link. Add to Cart is a sibling of the link (never nested
  inside it) and re-enables pointer events, so it never navigates.
  DOM order gives the tab order: card link first, then Add to Cart.
*/

function CardLink({ wine, inactive }: { wine: Wine; inactive?: boolean }) {
  return (
    <Link
      href={`/wines/${wine.slug}`}
      aria-label={`View details for ${wine.name}`}
      draggable={false}
      tabIndex={inactive ? -1 : undefined}
      className="absolute inset-0 z-0 cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage-light"
    />
  );
}

const cardShell =
  "group relative rounded-3xl border border-ink-line motion-safe:transition-[translate,border-color] motion-safe:duration-300 motion-safe:ease-out hover:border-sage has-[a:focus-visible]:border-sage motion-safe:hover:-translate-y-1";

export default function WineCard({ wine, size = "sm", inactive = false }: WineCardProps) {
  const vintage = displayVintage(wine);

  if (size === "lg") {
    return (
      <article className={`${cardShell} bg-ink-soft`}>
        <CardLink wine={wine} inactive={inactive} />
        <div className="pointer-events-none relative grid items-center gap-8 p-6 sm:grid-cols-[auto_1fr] sm:p-10">
          <div className="relative mx-auto flex h-80 w-28 items-end justify-center sm:h-[420px] sm:w-36">
            <Image
              src={wine.image}
              alt={`Bottle of ${wine.name}`}
              width={200}
              height={600}
              draggable={false}
              className="h-full w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-sage">
              {wine.region}, {wine.country}
            </p>
            <h3 className="mt-3 font-serif text-4xl italic leading-tight group-hover:text-sage-light sm:text-5xl">
              {wine.name}
            </h3>
            {vintage && <p className="mt-2 text-sm text-white/50">{vintage}</p>}
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/75 sm:mx-0">
              {wine.tastingNote}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <p className="font-serif text-3xl">{formatPrice(wine.price)}</p>
              {/* sm:ml-auto: on wider screens the button sits at the right edge of the text column, level with the price. */}
              <div className="pointer-events-auto relative z-10 sm:ml-auto">
                <AddToCartButton wineName={wine.name} tabIndex={inactive ? -1 : undefined} />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${cardShell} h-full bg-ink-soft/60`}>
      <CardLink wine={wine} inactive={inactive} />
      <div className="pointer-events-none relative flex h-full flex-col items-center p-6 text-center">
        <div className="relative flex h-56 w-20 items-end justify-center">
          <Image
            src={wine.image}
            alt={`Bottle of ${wine.name}`}
            width={200}
            height={600}
            draggable={false}
            className="h-full w-auto opacity-90"
          />
        </div>
        <h3 className="mt-5 font-serif text-2xl italic leading-tight group-hover:text-sage-light">
          {wine.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/60">{wine.tastingNote}</p>
        <div className="mt-auto flex flex-col items-center gap-3 pt-5">
          <p className="font-serif text-xl">{formatPrice(wine.price)}</p>
          <div className="pointer-events-auto relative z-10">
            <AddToCartButton wineName={wine.name} size="sm" tabIndex={inactive ? -1 : undefined} />
          </div>
        </div>
      </div>
    </article>
  );
}
