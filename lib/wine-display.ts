import type { Wine } from "@/lib/wines";

/*
  Display helpers that hide unknown values. Missing vintage or ABV is stored as 0
  (or may later be null/undefined), and must never render as "0", "null" or "undefined".
*/

function isKnown(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function displayVintage(wine: Wine): string | null {
  const vintage: number | null | undefined = wine.vintage;
  return isKnown(vintage) ? String(vintage) : null;
}

export function displayAbv(wine: Wine): string | null {
  const abv: number | null | undefined = wine.abv;
  return isKnown(abv) ? `${abv}% ABV` : null;
}

export function displaySize(wine: Wine): string | null {
  const size: number | null | undefined = wine.sizeMl;
  if (!isKnown(size)) return null;
  return size >= 1000 ? `${size / 1000}L` : `${size}ml`;
}

/** Region / vintage / size / ABV, skipping any unknown part. */
export function displayWineMeta(wine: Wine, { withCountry = false } = {}): string {
  return [
    withCountry ? wine.country : null,
    wine.region,
    displayVintage(wine),
    displaySize(wine),
    displayAbv(wine),
  ]
    .filter((part): part is string => Boolean(part))
    .join(" / ");
}
