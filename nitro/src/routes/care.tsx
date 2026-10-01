import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { CARE, usd } from "@/lib/site";

export const Route = createFileRoute("/care")({
  head: () => pageHead("/care"),
  component: Care,
});

const FAQ = [
  {
    q: "Is hosting included?",
    a: "The live page stays online as part of care. You are not renting a mystery WordPress stack.",
  },
  { q: "What if I need a whole new page?", a: "That is a build, not care. We price it. Care keeps the page you already have true." },
  { q: "Can I stay at $35?", a: "Yes. Care is $35. Care+ is only if you want the extra monthly change." },
  {
    q: "Who is this for?",
    a: "Care is for FORGE-built websites across local retail, restaurants, and service businesses. If we built your site or are planning a build together, Care keeps the details your customers rely on current after launch.",
  },
];

function Care() {
  return (
    <main id="main">
      <PageHead plate={["After launch", "Care plans"]} title="Care you can actually keep.">
        <p className="lede">
          Keep the website your customers already use accurate with updates to hours, services, events, and seasonal
          offerings. Care is {usd(CARE.care.price)} a month, cancel anytime, and your site stays yours.
        </p>
      </PageHead>

      <section className="band" aria-labelledby="plans-title">
        <div className="wrap">
          <Plate items={["Two ways to stay current"]} />
          <h2 id="plans-title">Pick the pace your business changes at.</h2>
          <div className="plans">
            <article className="plan">
              <p className="mono">{CARE.care.name}</p>
              <p className="rate">
                {usd(CARE.care.price)} <small>/ month</small>
              </p>
              <ul>
                {CARE.care.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
            <article className="plan plan--dark">
              <p className="mono">{CARE.carePlus.name}</p>
              <p className="rate">
                {usd(CARE.carePlus.price)} <small>/ month</small>
              </p>
              <ul>
                {CARE.carePlus.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="actions">
            <Link to="/pay" className="btn" data-track="care_start">
              Start care · {usd(CARE.care.price)}/month <Arrow />
            </Link>
            <span className="muted">
              Not ready to start? <Link className="link" to="/contact">Tell me about your business</Link> first.
            </span>
          </div>
        </div>
      </section>

      <section className="band band--fog" aria-labelledby="compare-title">
        <div className="wrap">
          <Plate items={["The usual arrangement, and this one"]} />
          <h2 id="compare-title">No retainer trap.</h2>
          <div className="compare">
            <div>
              <p className="mono">Typical monthly plan</p>
              <ul>
                <li>$89 to $149 a month before anyone changes a line for you.</li>
                <li>WordPress updates and a ticket queue.</li>
                <li>Your price after a call. Your scope in the fine print.</li>
                <li>Built for every trade in the county.</li>
              </ul>
            </div>
            <div>
              <p className="mono">FORGE care</p>
              <ul>
                <li>{usd(CARE.care.price)} to keep your business website current after launch.</li>
                <li>Your hours, holiday closings, services, events, and new offerings.</li>
                <li>On this page. Cancel any month.</li>
                <li>One person, and he already built your page.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="care-faq">
        <div className="wrap">
          <h2 id="care-faq">Questions</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
          <p className="actions muted">
            See <Link className="link" to="/services">website packages</Link>,{" "}
            <Link className="link" to="/work">selected work</Link>, and{" "}
            <Link className="link" to="/connecticut-web-design">Connecticut web design</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
