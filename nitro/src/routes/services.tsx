import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { RateSheet, SheetNotes } from "@/components/rate-sheet";
import { pageHead } from "@/lib/seo";
import { CARE, usd } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => pageHead("/services"),
  component: Services,
});

const BUILDS = [
  { t: "Custom business websites", d: "Clear structure, language and visual choices shaped around the business." },
  { t: "E-commerce", d: "Catalogs and checkout paths that match how the shop actually sells." },
  { t: "Custom functionality and admin systems", d: "Database-driven features, APIs and integrations when the business needs them." },
  { t: "Hosting, deployment and local SEO foundations", d: "With performance-focused development from the first page." },
];

function Services() {
  return (
    <main id="main">
      <PageHead plate={["Services", "Published pricing"]} title="Website packages: Local Business Site, Site and System, Product Site">
        <p className="lede">
          Local Business Site from $2,000. Site and System $6,000. Product Site $16,000. Care is {usd(CARE.care.price)}/month
          or Care+ is {usd(CARE.carePlus.price)}/month. Larger systems and custom applications are scoped separately.
        </p>
        <div className="actions">
          <Link to="/audit" className="btn" data-track="services_hero_audit">
            Get your FORGE CT Audit <Arrow />
          </Link>
          <Link to="/book" className="btn btn--line" data-track="services_hero_book">
            Book a working session
          </Link>
        </div>
      </PageHead>

      <section className="band" aria-labelledby="packages-title">
        <div className="wrap">
          <Plate items={["Website packages", "Published prices"]} />
          <h2 id="packages-title">Website packages</h2>
          <RateSheet caption="Website packages compared" />
          <SheetNotes />
        </div>
      </section>

      <section className="band" aria-labelledby="beyond-title">
        <div className="wrap split">
          <div className="stack">
            <Plate items={["Beyond the package"]} />
            <h2 id="beyond-title">Need something more complex?</h2>
            <p className="lede">
              Custom functionality and larger builds can be scoped separately. Admin systems, database-driven features,
              APIs, integrations, infrastructure, and substantial e-commerce work may need a custom quote.
            </p>
            <p className="muted">
              These prices do not include unlimited revisions, pages, products, integrations, databases, admin systems, APIs,
              or infrastructure.
            </p>
            <div className="actions">
              <Link to="/contact" className="btn">
                Scope your project <Arrow />
              </Link>
            </div>
          </div>
          <ul className="cells">
            {BUILDS.map((b) => (
              <li key={b.t}>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band--tight band--void" aria-labelledby="after-title">
        <div className="wrap">
          <h2 id="after-title">After launch</h2>
          <p className="lede">
            Need ongoing site updates after launch? Care keeps hours, services and events current.
          </p>
          <ul className="index">
            <li><Link to="/care">See Care and Care+ plans <Arrow /></Link></li>
            <li><Link to="/work">Selected work <Arrow /></Link></li>
            <li><Link to="/connecticut-web-design">Connecticut web design <Arrow /></Link></li>
            <li><Link to="/hartford-web-design">Hartford web design <Arrow /></Link></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
