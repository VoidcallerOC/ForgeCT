import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { RateSheet, SheetNotes } from "@/components/rate-sheet";
import { pageHead } from "@/lib/seo";
import { ADD_ONS, usd } from "@/lib/site";

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
      <PageHead plate={["Services", "Published pricing"]} title="Custom websites. Built fast.">
        <p className="lede">
          Choose a clearly scoped package for your small business, shop, restaurant, or local service. Larger systems and
          custom applications are scoped separately.
        </p>
        <div className="actions">
          <Link to="/contact" className="btn" data-track="services_hero_contact">
            Talk about your project <Arrow />
          </Link>
          <a href="#addons" className="btn btn--line">
            Add-ons <Arrow dir="down" />
          </a>
        </div>
      </PageHead>

      <section className="band" aria-labelledby="packages-title">
        <div className="wrap">
          <Plate items={["Website packages", "Basic · Standard · Premium"]} />
          <h2 id="packages-title">Website packages</h2>
          <RateSheet caption="Website packages compared" />
          <SheetNotes />
        </div>
      </section>

      <section className="band band--fog" id="addons" aria-labelledby="addons-title">
        <div className="wrap">
          <Plate items={["Additional services"]} />
          <h2 id="addons-title">Add-ons with a defined size.</h2>
          <p className="lede">Each add-on extends an otherwise applicable package by a defined amount of work and time.</p>
          <ul className="addons">
            {ADD_ONS.map((a) => (
              <li key={a.name}>
                <b>{a.name}</b>
                <span className="cost">
                  +{usd(a.price)} · +{a.days} day{a.days > 1 ? "s" : ""}
                </span>
                <p>{a.note}</p>
              </li>
            ))}
          </ul>
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
              Standard package prices do not include unlimited revisions, pages, products, integrations, databases, admin
              systems, APIs, or infrastructure.
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
