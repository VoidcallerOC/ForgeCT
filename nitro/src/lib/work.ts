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
  short: string;
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
  /** Feature-level explanation of the intended customer path, only where documented. */
  designIntent?: string;
  customerPath?: string[];
  tags: string[];
  /** In-progress engagements only: stage label, robots override, dated status lines and a second screenshot. */
  stage?: string;
  robots?: string;
  statusCheckedOn?: string;
  status?: string[];
  figure?: { image: string; imageHeight: number; alt: string; caption: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "harris-in-wonderland",
    name: "Harris in Wonderland",
    short: "Harris in Wonderland",
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
    designIntent:
      "Bring inventory, practical care information and a beginner chooser together so visitors can explore the offer and learn what they need before a visit.",
    customerPath: [
      "Browse live Square inventory.",
      "Use the beginner chooser to explore which animal may be a fit.",
      "Find care sheets and feeder-locker information alongside the shop offer.",
    ],
    tags: ["Live inventory", "Square", "Care sheets", "Care plan"],
  },
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
    slug: "hard-hittin",
    name: "Hard Hittin Card Shop",
    short: "Hard Hittin",
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
    short: "Infinite Heroes",
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

/**
 * Engagements in progress: real work for a real business that is not an approved live client launch.
 * Kept out of PROJECTS so the five-client taxonomy, counts, filters and homepage rail stay as certified.
 * Each line below was checked against the client repo and the live site on statusCheckedOn; re-check before
 * changing it. The case study stays noindex until the client approves the site (it is noindex itself).
 */
export const IN_PROGRESS: Project[] = [
  {
    slug: "ninos-collectibles",
    name: "Nino’s Collectibles",
    short: "Nino’s Collectibles",
    filter: "card-tabletop",
    stage: "In progress",
    category: "Trading-card dealer",
    place: "Card shows and Instagram",
    image: "/images/work/ninoscollectibles.jpg",
    imageHeight: 1428,
    site: "https://ninoscollectibles.com/",
    siteLabel: "ninoscollectibles.com",
    robots: "noindex,follow",
    need: "Nino buys and sells Pokémon and One Piece cards at card shows, on Instagram and in Whatnot live shows. Buyers need to see what he deals in and where he is vending next; sellers need a first look at what a card might fetch before they meet him.",
    built:
      "A phone-first site built from Nino’s own Instagram posts, with a show list read from his OnTreasure profile and a card scanner for people selling to him.",
    story:
      "A site built from Nino’s own Instagram posts, a show list read from OnTreasure, and a card scanner for sellers. Live as a concept preview, kept out of search until Nino approves it.",
    designIntent:
      "Keep every claim traceable. Photos and captions come from Nino’s public posts with their dates, and past pulls are labelled as not a stock list. Show dates are read from OnTreasure, never typed in. The scanner never fills in a price, a condition or a grade: it shows an estimate only from a dated market price, the customer picks the condition, and the final offer is made in person.",
    customerPath: [
      "See recent pulls and deals from Nino’s Instagram, labelled as past posts.",
      "Follow a link to where Nino is vending next.",
      "Message Nino on Instagram to buy, sell or meet at a show.",
    ],
    statusCheckedOn: "11 October 2026",
    status: [
      "Live at ninoscollectibles.com. The site’s own footer labels it a concept preview, and it stays out of search engines until Nino approves it.",
      "Card scanner: the phone reads the collector number with on-device OCR, searches the catalog, and asks the customer to confirm the printing and condition. It passes its end-to-end test against a test catalog. Live pricing is not switched on yet, so on the live site the scanner cannot return a match or an estimate.",
      "Show list: built to read Nino’s OnTreasure vendor profile. On the check date it reported the list unavailable and linked to his profile instead.",
      "Owner tools for inventory, photo drafts, events and Square sync are built and tested against a mock of Square. They are not yet connected to Nino’s Square account.",
    ],
    figure: {
      image: "/images/work/ninoscollectibles-scan.jpg",
      imageHeight: 1428,
      alt: "Nino’s Collectibles card scanner page shown on a mobile phone",
      caption: "The public scanner page. Card search and estimates switch on once live pricing is configured.",
    },
    tags: ["Instagram-sourced feed", "OnTreasure shows", "Card scanner (OCR)", "Owner tools"],
  },
];

export const projectBySlug = (slug: string) => [...PROJECTS, ...IN_PROGRESS].find((p) => p.slug === slug);
export const filterCount = (f: Filter) => PROJECTS.filter((p) => p.filter === f).length;
