/**
 * Wine data layer.
 *
 * Every page reads wines only through the async functions at the bottom of this
 * file (getAllWines, getFeaturedWines, getWineBySlug, getWeeklyPick). To move to a
 * CMS or database, keep the `Wine` type and replace the bodies of those functions
 * with real queries. No page or component imports `sampleWines` directly.
 */

export type Rating = 1 | 2 | 3 | 4 | 5;

export type WineCharacteristics = {
  flavorIntensity: Rating;
  body: Rating;
  tannin: Rating;
  acidity: Rating;
  alcohol: Rating;
};

export type Wine = {
  slug: string;
  name: string;
  region: string;
  appellation: string;
  country: string;
  vintage: number;
  sizeMl: number;
  abv: number;
  /** Price in Philippine pesos (PHP), e.g. 2750 = PHP 2,750.00 */
  price: number;
  /** One-line tasting note used on cards */
  tastingNote: string;
  story: string;
  /** Primary bottle image, path under /public */
  image: string;
  /** Additional gallery images for the detail page (primary image is prepended automatically) */
  gallery: string[];
  /** Optional pill tags, e.g. "Sommelier's Pick" */
  tags?: string[];
  characteristics: WineCharacteristics;
  featured?: boolean;
  weeklyPick?: boolean;
};

export const characteristicLabels: Record<keyof WineCharacteristics, string> = {
  flavorIntensity: "Flavor intensity",
  body: "Body",
  tannin: "Tannin",
  acidity: "Acidity",
  alcohol: "Alcohol",
};

const sampleWines: Wine[] = [
  {
    slug: "valle-oscuro-reserva-2019",
    name: "Marques de Murrieta Reserva",
    region: "Rioja",
    appellation: "Rioja DOCa",
    country: "Spain",
    vintage: 2018,
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 2790,
    tastingNote: "Tempranillo blend, oak-aged.",
    story:
      "A Reserva from Rioja DOCa in northern Spain, made from a Tempranillo-based blend and aged in oak before release.",
    image: "/wines/Marques.png",
    gallery: ["/wines/Marques1.png"],
    tags: ["Sommelier's Pick", "Romantic Pick"],
    characteristics: { flavorIntensity: 4, body: 5, tannin: 4, acidity: 3, alcohol: 4 }, // TODO: review ratings
    featured: true,
    weeklyPick: true,
  },
  {
    slug: "maison-lumiere-sancerre-2022",
    name: "Henri Bourgeois Sancerre \"Les Baronnes\"",
    region: "Loire Valley",
    appellation: "Sancerre AOC",
    country: "France",
    vintage: 2022,
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 2029,
    tastingNote: "Sauvignon Blanc.",
    story:
      "A white Sancerre AOC from the eastern Loire Valley in France, made from Sauvignon Blanc.",
    image: "/wines/Henri.png",
    gallery: ["/wines/Henri1.png"],
    tags: ["Sommelier's Pick"],
    characteristics: { flavorIntensity: 3, body: 2, tannin: 1, acidity: 5, alcohol: 2 }, // TODO: review ratings
    featured: true,
  },
  {
    slug: "colline-nere-barolo-2018",
    name: "Pio Cesare Barolo",
    region: "Piedmont",
    appellation: "Barolo DOCG",
    country: "Italy",
    vintage: 2019,
    sizeMl: 750,
    abv: 14.5,
    price: 6690,
    tastingNote: "Nebbiolo.",
    story:
      "A red Barolo DOCG from Piedmont in northwest Italy, made from Nebbiolo.",
    image: "/wines/Pio.png",
    gallery: ["/wines/Pio1.png"],
    tags: ["Sommelier's Pick"],
    characteristics: { flavorIntensity: 5, body: 5, tannin: 5, acidity: 4, alcohol: 4 }, // TODO: review ratings
    featured: true,
  },
  {
    slug: "domaine-sauge-chablis-2021",
    name: "William Fevre Chablis 1er Cru Montmains",
    region: "Burgundy",
    appellation: "Chablis Premier Cru",
    country: "France",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 5035, // estimated from US retail price, verify before launch
    tastingNote: "Chardonnay, unoaked.",
    story:
      "A Chablis Premier Cru from the Montmains vineyard in northern Burgundy, France, made from Chardonnay in an unoaked style.",
    image: "/wines/William.png",
    gallery: ["/wines/William1.png"],
    characteristics: { flavorIntensity: 3, body: 3, tannin: 1, acidity: 5, alcohol: 2 }, // TODO: review ratings
  },
  {
    slug: "weingut-stein-riesling-2022",
    name: "J.J. Prum Wehlener Sonnenuhr Riesling Kabinett",
    region: "Mosel",
    appellation: "Mosel Kabinett",
    country: "Germany",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 3770, // estimated from US retail price, verify before launch
    tastingNote: "Riesling, off-dry.",
    story:
      "A Riesling Kabinett from the Wehlener Sonnenuhr vineyard in Germany's Mosel region, made in an off-dry style.",
    image: "/wines/J.J.png",
    gallery: ["/wines/J.J1.png"],
    characteristics: { flavorIntensity: 3, body: 1, tannin: 1, acidity: 5, alcohol: 1 }, // TODO: review ratings
  },
  {
    slug: "quinta-do-rio-douro-tinto-2019",
    name: "Quinta do Crasto Douro Red",
    region: "Douro",
    appellation: "Douro DOC",
    country: "Portugal",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 990, // estimated from US retail price, verify before launch
    tastingNote: "Touriga Nacional blend.",
    story:
      "A red Douro DOC from northern Portugal, made from a blend led by Touriga Nacional.",
    image: "/wines/Quinta.png",
    gallery: ["/wines/Quinta1.png"],
    characteristics: { flavorIntensity: 4, body: 4, tannin: 4, acidity: 3, alcohol: 4 }, // TODO: review ratings
  },
  {
    slug: "casa-alba-brut-nature-2021",
    name: "Juve & Camps Reserva de la Familia",
    region: "Penedes",
    appellation: "Cava DO",
    country: "Spain",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 1150, // estimated from US retail price, verify before launch
    tastingNote: "Traditional method, brut nature.",
    story:
      "A Cava DO from Spain, a traditional-method sparkling wine made in the brut nature style.",
    image: "/wines/Juve.png",
    gallery: ["/wines/Juve1.png"],
    tags: ["Romantic Pick"],
    characteristics: { flavorIntensity: 3, body: 2, tannin: 1, acidity: 4, alcohol: 2 }, // TODO: review ratings
    featured: true,
  },
  {
    slug: "clos-verdier-cremant-2020",
    name: "Pierre Sparr Cremant d'Alsace Brut Reserve",
    region: "Alsace",
    appellation: "Cremant d'Alsace AOC",
    country: "France",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 1235, // estimated from US retail price, verify before launch
    tastingNote: "Traditional method sparkling.",
    story:
      "A Cremant d'Alsace AOC from Alsace in northeastern France, a sparkling wine made by the traditional method.",
    image: "/wines/Pierre.png",
    gallery: ["/wines/Pierre1.png"],
    characteristics: { flavorIntensity: 2, body: 2, tannin: 1, acidity: 4, alcohol: 2 }, // TODO: review ratings
  },
  {
    slug: "kaimai-ridge-pinot-noir-2021",
    name: "Felton Road Pinot Noir (Bannockburn)",
    region: "Central Otago",
    appellation: "Central Otago",
    country: "New Zealand",
    vintage: 0, // TODO: copy from bottle
    sizeMl: 750,
    abv: 0, // TODO: copy from bottle
    price: 3895, // estimated from US retail price, verify before launch
    tastingNote: "Pinot Noir.",
    story:
      "A red wine from the Bannockburn area of Central Otago in New Zealand, made from Pinot Noir.",
    image: "/wines/Felton.png",
    gallery: ["/wines/Felton1.png"],
    characteristics: { flavorIntensity: 3, body: 3, tannin: 2, acidity: 4, alcohol: 3 }, // TODO: review ratings
    featured: true,
  },
  {
    slug: "alto-andes-malbec-2020",
    name: "Catena Malbec",
    region: "Mendoza",
    appellation: "Mendoza",
    country: "Argentina",
    vintage: 2022,
    sizeMl: 750,
    abv: 13.5,
    price: 1290,
    tastingNote: "Malbec.",
    story:
      "A red wine from Mendoza, Argentina's largest wine region, made from Malbec.",
    image: "/wines/Catena.png",
    gallery: ["/wines/Catena1.png"],
    tags: ["Romantic Pick"],
    characteristics: { flavorIntensity: 4, body: 4, tannin: 3, acidity: 3, alcohol: 4 }, // TODO: review ratings
  },
];

/* ---------- Data access: swap these bodies for a CMS or database ---------- */

export async function getAllWines(): Promise<Wine[]> {
  return sampleWines;
}

export async function getFeaturedWines(): Promise<Wine[]> {
  return sampleWines.filter((wine) => wine.featured);
}

export async function getWineBySlug(slug: string): Promise<Wine | undefined> {
  return sampleWines.find((wine) => wine.slug === slug);
}

export async function getWeeklyPick(): Promise<Wine> {
  return sampleWines.find((wine) => wine.weeklyPick) ?? sampleWines[0];
}

/* ---------- Formatting helpers ---------- */

const priceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

export function formatWineMeta(wine: Wine): string {
  const size = wine.sizeMl >= 1000 ? `${wine.sizeMl / 1000}L` : `${wine.sizeMl}ml`;
  return [wine.region, String(wine.vintage), size, `${wine.abv}% ABV`].join(" / ");
}
