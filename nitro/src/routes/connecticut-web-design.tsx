import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { PhoneFrame } from "@/components/work";
import { pageHead } from "@/lib/seo";
import { projectBySlug } from "@/lib/work";

export const Route = createFileRoute("/connecticut-web-design")({
  head: () => pageHead("/connecticut-web-design"),
  component: Connecticut,
});

// The four case studies featured on the certified Connecticut page.
const FEATURED = ["thousand-sunny", "hard-hittin", "harris-in-wonderland", "m-and-j-video-games"];

function Connecticut() {
  return (
    <main id="main">
      <PageHead plate={["Farmington, Connecticut", "Local business websites"]} title="Connecticut Web Design for Local Businesses">
        <p className="lede">
          FORGE CT is a Farmington studio building custom websites and web development for Connecticut businesses. Every
          build starts with what customers actually need to know, then gives your local business a clear place to be
          found, understood, and visited.
        </p>
        <div className="actions">
          <Link to="/contact" className="btn">
            Talk about your project <Arrow />
          </Link>
          <Link to="/work" className="btn btn--line">
            See the work
          </Link>
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

      <section className="band band--fog" aria-labelledby="ct-work-title">
        <div className="wrap">
          <Plate items={["Selected Connecticut work"]} />
          <h2 id="ct-work-title">Real businesses, not invented examples.</h2>
          <p className="lede">
            These are projects already represented in the Forge portfolio. Open a case study for the need, build, and live
            site.
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

      <section className="band band--tight band--void" aria-labelledby="ct-next">
        <div className="wrap">
          <h2 id="ct-next">Next steps</h2>
          <ul className="index">
            <li><Link to="/">Start with the Forge point of view <Arrow /></Link></li>
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
