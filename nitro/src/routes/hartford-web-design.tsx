import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";
import { projectBySlug } from "@/lib/work";

export const Route = createFileRoute("/hartford-web-design")({
  head: () => pageHead("/hartford-web-design"),
  component: Hartford,
});

// Same four proof links and destinations as the certified landing page.
const PROOF = [
  { slug: "thousand-sunny", label: "Shop page", href: "https://www.thousandsunnytcg.com/", track: "landing_proof_thousand_sunny" },
  { slug: "m-and-j-video-games", label: "Storefront online", href: "https://mjvideogames.com/", track: "landing_proof_mj" },
  { slug: "hard-hittin", label: "New launch", href: "https://hardhittincardshop.com/", track: "landing_proof_hard_hittin" },
  { slug: "harris-in-wonderland", label: "Project", href: "", track: "landing_proof_harris" },
];

// Visible answers match the FAQPage structured data for this route.
const FAQ = [
  {
    q: "How much does a shop website cost in Hartford?",
    a: "Basic is $750 for up to 3 pages, Standard is $1,500 for up to 5 pages, and Premium is $2,500 for up to 8 pages. Hosting setup is included in all three packages. E-commerce is a paid add-on; larger custom builds are scoped separately. Care is $35 a month.",
  },
  {
    q: "What does a card shop website need?",
    a: "A useful card shop website makes hours, location, directions, events, collections, services, and the next step easy to find from a phone. FORGE CT builds around the customer visit, not a generic brochure.",
  },
  {
    q: "Do you work with shops outside Hartford?",
    a: "FORGE CT is based in Farmington and works with shops across Greater Hartford and Connecticut. Send your URL to start with three practical website fixes within 24 hours.",
  },
  {
    q: "What is the first step?",
    a: "Send your shop URL and a little context about what feels stuck. FORGE CT will review it like a customer and reply with three practical fixes within 24 hours.",
  },
];

function Hartford() {
  return (
    <main id="main">
      <PageHead plate={["Hartford web design", "Farmington · Greater Hartford", "Built for real shops"]} title="A website your walk-ins can use.">
        <p className="lede">
          Send me your shop URL. I’ll reply with three practical website fixes within 24 hours — no pitch deck, no quote
          maze.
        </p>
        <div className="actions">
          <a href="#contact" className="btn" data-track="landing_hero_cta">
            Get my 3 website fixes <Arrow dir="down" />
          </a>
          <a href="#proof" className="btn btn--line" data-track="landing_hero_work">
            See live shop work
          </a>
        </div>
        <p className="hero-note">
          Live client work in West Hartford, Southington, Canton, and Greater Hartford. Website packages from $750. Care
          $35/month.
        </p>
      </PageHead>

      <section className="band" id="proof" aria-labelledby="proof-title">
        <div className="wrap">
          <Plate items={["Proof", "Live pages"]} />
          <h2 id="proof-title">Real shops. Live pages.</h2>
          <p className="lede">Open the work the way your customers would — from a phone in the parking lot.</p>
          <ul className="index">
            {PROOF.map((item) => {
              const p = projectBySlug(item.slug)!;
              const text = (
                <>
                  <span>
                    {p.name}
                    <br />
                    <span className="mono muted">
                      {p.place} · {item.label}
                    </span>
                  </span>
                  <Arrow dir={item.href ? "out" : "right"} />
                </>
              );
              return (
                <li key={item.slug}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" data-track={item.track}>
                      {text}
                    </a>
                  ) : (
                    <Link to="/work/$slug" params={{ slug: p.slug }} data-track={item.track}>
                      {text}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="band band--fog" id="offer" aria-labelledby="offer-title">
        <div className="wrap split">
          <div className="stack">
            <Plate items={["What changes"]} />
            <h2 id="offer-title">Your hours, your floor, how to walk in.</h2>
            <p className="lede">
              Customers should not have to hunt Facebook for the real hours or guess what you carry. FORGE CT builds the
              page around the visit your shop actually wants.
            </p>
          </div>
          <ul className="cells">
            <li><h3>Find you first</h3><p>Hours, address, directions, and a clear next step on a phone.</p></li>
            <li><h3>Know what you carry</h3><p>Collections, events, services, and inventory without the scroll.</p></li>
            <li><h3>Keep it true</h3><p>Care plans from $35/month for restocks, events, and changes after launch.</p></li>
            <li><h3>Priced up front</h3><p>Basic $750, Standard $1,500, Premium $2,500. <Link className="link" to="/services">See the scope</Link>.</p></li>
          </ul>
        </div>
      </section>

      <section className="band" id="faq" aria-labelledby="faq-title">
        <div className="wrap">
          <Plate items={["FAQ"]} />
          <h2 id="faq-title">Straight answers before you reach out.</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--fog" id="contact" aria-labelledby="fix-title">
        <div className="wrap form-grid">
          <div className="stack">
            <Plate items={["Get the fixes"]} />
            <h2 id="fix-title">Send me your shop URL.</h2>
            <p className="lede">
              Give me five minutes of context. I’ll look at the page like a customer and reply with three practical fixes
              within 24 hours.
            </p>
          </div>
          <InquiryForm variant="audit" source="hartford-web-design" submitLabel="Send my URL" />
        </div>
      </section>
    </main>
  );
}
