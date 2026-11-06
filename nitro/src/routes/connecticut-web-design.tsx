import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { PhoneFrame } from "@/components/work";
import { pageHead } from "@/lib/seo";
import { breadcrumbLd, faqPageLd } from "@/lib/structured-data";
import { CARE, PACKAGES, packagePrice, usd } from "@/lib/site";
import { TOWN_PROJECTS, joinNames } from "@/lib/work";

const FAQ = [
  {
    q: "What does FORGE CT build for Connecticut businesses?",
    a: "Sites and apps for shops and local businesses, built around the visit: hours, location, what you carry, and a clear next step on a phone. Site and System covers booking, inventory, and intake. Larger systems are scoped separately.",
  },
  {
    q: "Where in Connecticut is the work?",
    a: `FORGE CT is based in Farmington. Live client sites include ${joinNames(TOWN_PROJECTS.map((p) => `${p.name} in ${p.town}`))}.`,
  },
  {
    q: "How much does a FORGE CT website cost?",
    a: "Local Business Site from $2,000. Site and System $6,000. Product Site $16,000. Care is $35/month or Care+ is $79/month.",
  },
  {
    q: "What is the first step?",
    a: "Send your website through the FORGE CT Audit. FORGE CT replies with three practical fixes within 24 hours. If you already know the scope, book a working session.",
  },
];

export const Route = createFileRoute("/connecticut-web-design")({
  head: () =>
    pageHead("/connecticut-web-design", undefined, [
      faqPageLd(FAQ),
      breadcrumbLd("Connecticut Web Design", "/connecticut-web-design"),
    ]),
  component: Connecticut,
});

/** Case studies with a documented Connecticut town, derived from the approved roster. */
const TOWNS = joinNames(TOWN_PROJECTS.map((p) => p.town!));

function Connecticut() {
  return (
    <main id="main">
      <PageHead plate={["Farmington, Connecticut", "Local business websites"]} title="Connecticut Web Design for Local Businesses">
        <p className="lede">
          FORGE CT is Nick Sousa in Farmington, building sites and apps for Connecticut shops and local businesses.
          Live client work is in {TOWNS}. Local Business Sites from {usd(PACKAGES[0].price)}.
          The first step is three practical fixes within 24 hours.
        </p>
        <div className="actions">
          <Link to="/audit" className="btn" data-track="ct_hero_audit">
            Get your FORGE CT Audit <Arrow />
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
              services, or deciding whether a business feels like their kind of place. FORGE CT builds around those moments
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
            These are FORGE CT live client sites. Open a case study for the need, the build, and
            the live site.
          </p>
          <ul className="rail rail--light" aria-label="Connecticut case studies">
            {TOWN_PROJECTS.map((p) => {
              return (
                <li key={p.slug}>
                  <Link to="/work/$slug" params={{ slug: p.slug }} className="phone">
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
                  {p.name} · {packagePrice(p)}
                </h3>
                <p>{p.summary}</p>
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
            <li><Link to="/audit">Get the FORGE CT Audit <Arrow /></Link></li>
            <li><Link to="/services">See services and published pricing <Arrow /></Link></li>
            <li><Link to="/hartford-web-design">Looking for Hartford web design? <Arrow /></Link></li>
            <li><Link to="/work">Browse the full work index <Arrow /></Link></li>
            <li><Link to="/contact">Contact FORGE CT <Arrow /></Link></li>
            <li><Link to="/book">Book a project conversation <Arrow /></Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
