import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { PhoneFrame } from "@/components/work";
import { pageHead } from "@/lib/seo";
import { CARE, PACKAGES, usd } from "@/lib/site";
import { projectBySlug } from "@/lib/work";

export const Route = createFileRoute("/connecticut-web-design")({
  head: () => pageHead("/connecticut-web-design"),
  component: Connecticut,
});

/**
 * Live Connecticut storefronts with a documented place.
 * Nino’s Collectibles stays off this page: its case study says the public site still
 * labels itself a concept preview and is not open to search engines.
 */
const FEATURED = ["thousand-sunny", "hard-hittin", "harris-in-wonderland", "m-and-j-video-games", "infinite-heroes"];

/** Visible answers match the FAQPage structured data for this route. */
const FAQ = [
  {
    q: "What does FORGE CT build for Connecticut businesses?",
    a: "Custom websites for shops and local businesses, built around the visit: hours, location, what you carry, and a clear next step on a phone. E-commerce is a paid add-on when the shop sells that way. Larger systems are scoped separately.",
  },
  {
    q: "Where in Connecticut is the work?",
    a: "FORGE CT is based in Farmington. Live client sites include Thousand Sunny Cards and Collectibles in West Hartford, M and J Video Games in Southington, Harris in Wonderland in Canton, Infinite Heroes in Watertown, and Hard Hittin Card Shop in Connecticut.",
  },
  {
    q: "How much does a FORGE CT website cost?",
    a: "Basic is $750 for up to 3 pages, Standard is $1,500 for up to 5 pages, and Premium is $2,500 for up to 8 pages. Hosting setup is included. E-commerce is a paid add-on. Care is $35 a month.",
  },
  {
    q: "What is the first step?",
    a: "Send your website through the Forge-CT Audit. FORGE CT replies with three practical fixes within 24 hours. If you already know the scope, book a working session.",
  },
];

function Connecticut() {
  return (
    <main id="main">
      <PageHead plate={["Farmington, Connecticut", "Local business websites"]} title="Connecticut Web Design for Local Businesses">
        <p className="lede">
          FORGE CT is Nick Sousa in Farmington, building custom websites for Connecticut shops and local businesses.
          Live client work is in West Hartford, Southington, Canton, and Watertown. Packages start at {usd(PACKAGES[0].price)}.
          The first step is three practical fixes within 24 hours.
        </p>
        <div className="actions">
          <Link to="/audit" className="btn" data-track="ct_hero_audit">
            Get your Forge-CT Audit <Arrow />
          </Link>
          <a className="btn btn--line" href="#ct-work">
            See Connecticut work
          </a>
        </div>
      </PageHead>

      <section className="band" aria-labelledby="useful-title">
        <div className="wrap split">
          <div className="stack">
            <Plate items={["Built around the actual visit"]} />
            <h2 id="useful-title">A local business website should do useful work.</h2>
            <p className="lede">
              Your customers may be checking hours from a parking lot, looking for a collection before a drive, comparing
              services, or deciding whether a business feels like their kind of place. Forge builds around those moments
              instead of handing you a generic brochure.
            </p>
            <p className="muted">
              That can mean a focused local business website, a richer ecommerce path, or a custom system for inventory,
              events, intake, and the details that make your operation yours.
            </p>
          </div>
          <ul className="cells">
            <li><h3>Custom websites</h3><p>Clear structure, language, and visual choices shaped around the business.</p></li>
            <li><h3>Web development</h3><p>Responsive pages and useful systems that connect customers to the next step.</p></li>
            <li><h3>Ecommerce when it fits</h3><p>Catalogs and checkout paths that match how the shop actually sells.</p></li>
            <li><h3>Ongoing care</h3><p>Keep hours, events, restocks, and important details current after launch.</p></li>
          </ul>
        </div>
      </section>

      <section className="band band--fog" id="ct-work" aria-labelledby="ct-work-title">
        <div className="wrap">
          <Plate items={["Selected Connecticut work"]} />
          <h2 id="ct-work-title">Real businesses, not invented examples.</h2>
          <p className="lede">
            These are live client sites already in the Forge portfolio. Open a case study for the need, the build, and
            the live site. Hard Hittin Card Shop is documented as Connecticut; a town is not published on its case study.
          </p>
          <ul className="rail rail--light" aria-label="Connecticut case studies">
            {FEATURED.map((slug) => {
              const p = projectBySlug(slug)!;
              return (
                <li key={slug}>
                  <Link to="/work/$slug" params={{ slug }} className="phone">
                    <PhoneFrame project={p} />
                    <div className="phone-cap">
                      <span className="mono muted">
                        {p.category} · {p.place}
                      </span>
                      <strong>{p.name}</strong>
                      <span className="link">Read the case study</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="band" aria-labelledby="ct-price">
        <div className="wrap split">
          <div className="stack">
            <Plate items={["Scope", "Published pricing"]} />
            <h2 id="ct-price">The same packages, published up front.</h2>
            <p className="lede">{FAQ[2].a}</p>
            <p>
              <Link className="link" to="/services">
                See services and the full scope <Arrow />
              </Link>
            </p>
          </div>
          <ul className="cells">
            {PACKAGES.map((p) => (
              <li key={p.id}>
                <h3>
                  {p.tier} · {usd(p.price)}
                </h3>
                <p>
                  Up to {p.pages} pages. {p.label}.
                </p>
              </li>
            ))}
            <li>
              <h3>Care · {usd(CARE.care.price)}/month</h3>
              <p>Hours, events, and other details stay current after launch.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="band band--fog" id="faq" aria-labelledby="ct-faq">
        <div className="wrap">
          <Plate items={["FAQ"]} />
          <h2 id="ct-faq">Straight answers before you reach out.</h2>
          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--tight band--void" aria-labelledby="ct-next">
        <div className="wrap">
          <h2 id="ct-next">Next steps</h2>
          <ul className="index">
            <li><Link to="/audit">Get the Forge-CT Audit <Arrow /></Link></li>
            <li><Link to="/services">See services and published pricing <Arrow /></Link></li>
            <li><Link to="/hartford-web-design">Looking for Hartford web design? <Arrow /></Link></li>
            <li><Link to="/work">Browse the full work index <Arrow /></Link></li>
            <li><Link to="/contact">Contact Forge <Arrow /></Link></li>
            <li><Link to="/book">Book a project conversation <Arrow /></Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
