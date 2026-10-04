/**
 * Approved portfolio taxonomy, from the certified site (work/index.html, generate-seo-pages.mjs,
 * homepage filters):
 *   - Five live client projects. Filters: "Card and tabletop" (4) and "Retail and local" (1).
 *   - One FORGE lab experiment (Voidcaller), always shown apart from client work and never counted as a client.
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
  filter: Filter;
  /** Case-study category label, as certified. */
  category: string;
  place: string;
  image: string;
  imageHeight: number;
  /** Outbound live URL. */
  site?: string;
  siteLabel?: string;
  need: string;
  built: string;
  /** Longer homepage line from the certified work grid. */
  story: string;
  tags: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "harris-in-wonderland",
    name: "Harris in Wonderland",
    filter: "retail-local",
    category: "Retail and local business",
    place: "Canton",
    image: "/images/work/harrisinwonderland.jpg",
    imageHeight: 1429,
    // Live per the owner (2026-10-01) and linked on the certified homepage; the certified case study omitted it.
    site: "https://harrisinwonderland.com/",
    siteLabel: "harrisinwonderland.com",
    need: "Help customers understand the animals, care, and inventory beyond the storefront.",
    built: "Live inventory, a feeder locker, care sheets, and a beginner chooser in one experience.",
    story:
      "The deepest build here: live Square inventory, a feeder locker, care sheets, and a beginner chooser that helps customers pick the right animal.",
    tags: ["Live inventory", "Square", "Care sheets", "Care plan"],
  },
  {
    slug: "thousand-sunny",
    name: "Thousand Sunny Cards and Collectibles",
    filter: "card-tabletop",
    category: "Card and tabletop shop",
    place: "West Hartford",
    image: "/images/work/thousandsunny.jpg",
    imageHeight: 1429,
    site: "https://www.thousandsunnytcg.com/",
    siteLabel: "thousandsunnytcg.com",
    need: "Turn a search into a visit with hours, events, and a clear path to the floor.",
    built: "A shop page with event context and custom illustration that feels like the store.",
    story: "A shop page that turns a search into a visit with clear hours, events, and a direct path to the floor.",
    tags: ["Shop page", "Events", "Custom illustration", "Care plan"],
  },
  {
    slug: "m-and-j-video-games",
    name: "M and J Video Games",
    filter: "card-tabletop",
    category: "Neighborhood video-game shop",
    place: "Southington",
    image: "/images/work/mjvideogames.jpg",
    imageHeight: 1429,
    site: "https://mjvideogames.com/",
    siteLabel: "mjvideogames.com",
    need: "Make trade-ins, services, and a real walk-in path easy to find.",
    built: "A neighborhood storefront online, built for the phone check from the parking lot.",
    story:
      "Neighborhood storefront online. Trade-ins, services, and a clear way to call or walk in — the page a walk-in checks from the parking lot.",
    tags: ["Shop page", "Trade-ins", "Directions"],
  },
  {
    slug: "hard-hittin",
    name: "Hard Hittin Card Shop",
    filter: "card-tabletop",
    category: "Card shop",
    place: "Connecticut",
    image: "/images/work/hardhittin.jpg",
    imageHeight: 1429,
    site: "https://hardhittincardshop.com/",
    siteLabel: "hardhittincardshop.com",
    need: "Give sports cards, graded slabs, breaks, and hobby boxes one clear home.",
    built: "A launch page with the same direct energy as the counter.",
    story:
      "Sports and trading cards, graded slabs, breaks, and hobby boxes — a page that hits as hard as the counter does. Newest launch, still warming up.",
    tags: ["Shop page", "Breaks", "Slabs", "Launch"],
  },
  {
    slug: "infinite-heroes",
    name: "Infinite Heroes",
    filter: "card-tabletop",
    category: "Card and tabletop shop",
    place: "Watertown",
    image: "/images/work/IMG_2604.jpg",
    imageHeight: 1459,
    site: "https://infiniteheroes.net/",
    siteLabel: "infiniteheroes.net",
    need: "Help a Main Street walk-in find new comics and collectibles when the door is open.",
    built: "A clear local shop page built around the Wednesday rhythm and the floor.",
    story:
      "Watertown comic shop on Main Street. New comics on Wednesday, collectibles on the floor whenever the door is open — a page built so a walk-in can find the shop.",
    tags: ["Comics", "Collectibles", "Main Street"],
  },
];

export const LAB = {
  name: "Voidcaller — On-chain metalcore",
  kind: "FORGE experiment · Music and interactive",
  image: "/images/work/voidcaller.jpg",
  site: "https://voidcaller.enterthegrotto.xyz/",
  story:
    "A world that matches the record: player, relics, and lore. Built to prove that a project can go further when the experience itself is part of the brief.",
  tags: ["Interactive", "Custom player", "Worldbuilding"],
} as const;

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const filterCount = (f: Filter) => PROJECTS.filter((p) => p.filter === f).length;
