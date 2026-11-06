/**
 * Approved portfolio. Three case studies (Thousand Sunny, M&J Video Games, Infinite Heroes)
 * plus Hard Hittin, who is named in proof lists only and has no case page.
 * One FORGE CT lab experiment (Voidcaller) is always shown apart from client work.
 * Case-study copy is limited to the documented need, build, tags and location. No outcomes or metrics.
 */
export type Filter = "card-tabletop" | "retail-local";

export const FILTERS: { id: Filter; label: string }[] = [
  { id: "card-tabletop", label: "Card and tabletop" },
  { id: "retail-local", label: "Retail and local" },
];

export type Project = {
  slug: string;
  name: string;
  short: string;
  filter: Filter;
  /** Case-study category label, as certified. */
  category: string;
  place: string;
  image: string;
  /** Intrinsic pixel size of the screenshot file (WebP variants are generated at 480w and 160w). */
  imageWidth?: number;
  imageHeight: number;
  /** What the business is and who it serves, in one line — from the documented category, place and need. */
  business: string;
  /** Outbound live URL. */
  site?: string;
  siteLabel?: string;
  need: string;
  built: string;
  /** Longer homepage line from the certified work grid. */
  story: string;
  /** Feature-level explanation of the intended customer path, only where documented. */
  designIntent?: string;
  customerPath?: string[];
  tags: string[];
  /** Optional: robots override, dated status lines and a second screenshot. */
  robots?: string;
  statusCheckedOn?: string;
  status?: string[];
  figure?: { image: string; imageHeight: number; alt: string; caption: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "thousand-sunny",
    name: "Thousand Sunny Cards and Collectibles",
    short: "Thousand Sunny",
    filter: "card-tabletop",
    category: "Card and tabletop shop",
    place: "West Hartford",
    image: "/images/work/thousandsunny.jpg",
    imageHeight: 1429,
    site: "https://www.thousandsunnytcg.com/",
    siteLabel: "thousandsunnytcg.com",
    business:
      "A card and tabletop shop in West Hartford: cards, collectibles and in-store events for players and collectors.",
    need: "Turn a search into a visit with hours, events, and a clear path to the floor.",
    built: "A shop page with event context and custom illustration that feels like the store.",
    story: "A shop page that turns a search into a visit with clear hours, events, and a direct path to the floor.",
    designIntent:
      "Pair practical shop and event context with custom illustration, so the page gives visitors both useful details and a feel for the store.",
    customerPath: [
      "Find the shop's hours and location before heading over.",
      "See the event context on the shop page.",
      "Get a direct path from the page to the store experience.",
    ],
    tags: ["Shop page", "Events", "Custom illustration", "Care plan"],
  },
  {
    slug: "m-and-j-video-games",
    name: "M and J Video Games",
    short: "M and J Video Games",
    filter: "card-tabletop",
    category: "Neighborhood video-game shop",
    place: "Southington",
    image: "/images/work/mjvideogames.jpg",
    imageHeight: 1429,
    site: "https://mjvideogames.com/",
    siteLabel: "mjvideogames.com",
    business: "A neighborhood video-game shop in Southington: games, trade-ins and services for walk-in customers.",
    need: "Make trade-ins, services, and a real walk-in path easy to find.",
    built: "A neighborhood storefront online, built for the phone check from the parking lot.",
    story:
      "Neighborhood storefront online. Trade-ins, services, and a clear way to call or walk in — the page a walk-in checks from the parking lot.",
    designIntent:
      "Put trade-ins, services and the walk-in path in one neighborhood storefront page that can be checked on a phone before the trip.",
    customerPath: [
      "See trade-in and service information in one place.",
      "Check the shop from a phone before making the trip.",
      "Find a clear way to call or walk in.",
    ],
    tags: ["Shop page", "Trade-ins", "Directions"],
  },
  {
    slug: "infinite-heroes",
    name: "Infinite Heroes",
    short: "Infinite Heroes",
    filter: "card-tabletop",
    category: "Card and tabletop shop",
    place: "Watertown",
    image: "/images/work/IMG_2604.jpg",
    imageWidth: 1170,
    imageHeight: 2532,
    site: "https://infiniteheroes.net/",
    siteLabel: "infiniteheroes.net",
    business:
      "A comic shop on Main Street in Watertown: new comics on Wednesday, collectibles on the floor whenever the door is open.",
    need: "Help a Main Street walk-in find new comics and collectibles when the door is open.",
    built: "A clear local shop page built around the Wednesday rhythm and the floor.",
    story:
      "Watertown comic shop on Main Street. New comics on Wednesday, collectibles on the floor whenever the door is open — a page built so a walk-in can find the shop.",
    tags: ["Comics", "Collectibles", "Main Street"],
  },
];

export const LAB = {
  name: "Voidcaller — On-chain metalcore",
  kind: "FORGE CT experiment · Music and interactive",
  image: "/images/work/voidcaller.jpg",
  site: "https://voidcaller.enterthegrotto.xyz/",
  story:
    "A world that matches the record: player, relics, and lore. Built to prove that a project can go further when the experience itself is part of the brief.",
  tags: ["Interactive", "Custom player", "Worldbuilding"],
} as const;

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const filterCount = (f: Filter) => PROJECTS.filter((p) => p.filter === f).length;
