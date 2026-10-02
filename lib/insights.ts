export type InsightGuide = {
  slug: string;
  region: string;
  country: string;
  /** Path under /public, used for the FlipCard front-face image. */
  image: string;
  grapes: string;
  style: string;
  pairings: string;
  /** Wine slugs from lib/wines.ts */
  wineSlugs: string[];
};

const guides: InsightGuide[] = [
  {
    slug: "rioja",
    region: "Rioja",
    country: "Spain",
    image: "/images/countries/spain.png",
    grapes: "Tempranillo, often blended with Garnacha, Graciano and Mazuelo",
    style:
      "Red Rioja is labelled by aging. A Reserva red spends at least three years aging before release, at least one of them in oak barrels.",
    pairings: "Roast lamb, grilled meats and cured ham",
    wineSlugs: ["valle-oscuro-reserva-2019"],
  },
  {
    slug: "sancerre",
    region: "Sancerre",
    country: "France (eastern Loire Valley)",
    image: "/images/countries/France (eastern Loire Valley).png",
    grapes: "Sauvignon Blanc for the white wines",
    style: "White Sancerre is dry, with high acidity and a fresh, citrus and herbal character.",
    pairings: "Goat cheese, shellfish and grilled fish",
    wineSlugs: ["maison-lumiere-sancerre-2022"],
  },
  {
    slug: "barolo",
    region: "Barolo",
    country: "Italy (Piedmont)",
    image: "/images/countries/Italy (Piedmont).png",
    grapes: "Nebbiolo only",
    style:
      "A full-bodied red with firm tannins and high acidity. The rules require aging before release, and the wines often improve for years in bottle.",
    pairings: "Braised beef, mushroom and truffle dishes, and aged hard cheeses",
    wineSlugs: ["colline-nere-barolo-2018"],
  },
  {
    slug: "chablis",
    region: "Chablis",
    country: "France (northern Burgundy)",
    image: "/images/countries/France (northern Burgundy).png",
    grapes: "Chardonnay",
    style:
      "Crisp and mineral, usually made with little or no new oak. Premier Cru is a classification for the region's better-rated vineyards.",
    pairings: "Oysters, shellfish and white fish",
    wineSlugs: ["domaine-sauge-chablis-2021"],
  },
  {
    slug: "mosel",
    region: "Mosel",
    country: "Germany",
    image: "/images/countries/germany.png",
    grapes: "Riesling",
    style:
      "Kabinett is the lightest level of Germany's Pradikat ripeness scale. Mosel Kabinett is typically low in alcohol and often off-dry, balanced by high acidity.",
    pairings: "Mildly spicy dishes, pork and fruit-based desserts",
    wineSlugs: ["weingut-stein-riesling-2022"],
  },
  {
    slug: "douro",
    region: "Douro",
    country: "Portugal",
    image: "/images/countries/portugal.png",
    grapes: "Native grapes such as Touriga Nacional, Touriga Franca and Tinta Roriz",
    style:
      "The same valley that produces Port also makes dry table wines. The reds are usually full-bodied blends.",
    pairings: "Grilled meats, stews and hard cheeses",
    wineSlugs: ["quinta-do-rio-douro-tinto-2019"],
  },
  {
    slug: "cava",
    region: "Cava",
    country: "Spain (mostly Penedes, Catalonia)",
    image: "/images/countries/Spain (mostly Penedes, Catalonia).png",
    grapes: "Traditionally Macabeo, Xarel-lo and Parellada",
    style:
      "Sparkling wine made by the traditional method, with its second fermentation in the bottle. Brut Nature means no sugar is added after that fermentation, so it is very dry.",
    pairings: "Tapas, fried foods and seafood",
    wineSlugs: ["casa-alba-brut-nature-2021"],
  },
  {
    slug: "cremant-dalsace",
    region: "Cremant d'Alsace",
    country: "France (Alsace)",
    image: "/images/countries/France (Alsace).png",
    grapes: "Mostly Pinot Blanc, also Auxerrois, Riesling, Pinot Gris, Pinot Noir and Chardonnay",
    style: "Traditional-method sparkling wine, usually fresh and light.",
    pairings: "As an aperitif, with light starters and soft cheeses",
    wineSlugs: ["clos-verdier-cremant-2020"],
  },
  {
    slug: "central-otago",
    region: "Central Otago",
    country: "New Zealand (South Island)",
    image: "/images/countries/New Zealand (South Island).png",
    grapes: "Pinot Noir is the main grape",
    style:
      "One of the world's southernmost wine regions, with a dry, continental climate. Its Pinot Noir is known for ripe red fruit.",
    pairings: "Duck, salmon and mushroom dishes",
    wineSlugs: ["kaimai-ridge-pinot-noir-2021"],
  },
  {
    slug: "mendoza",
    region: "Mendoza",
    country: "Argentina",
    image: "/images/countries/argentina.png",
    grapes: "Malbec, Argentina's signature grape",
    style:
      "Argentina's largest wine region, with vineyards at high altitude in the foothills of the Andes. Its Malbec is usually deep in color with dark fruit.",
    pairings: "Grilled beef and barbecue",
    wineSlugs: ["alto-andes-malbec-2020"],
  },
];

export async function getInsightGuides(): Promise<InsightGuide[]> {
  return guides;
}
