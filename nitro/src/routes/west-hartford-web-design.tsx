import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Plate } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { PRICE_SENTENCE } from "@/lib/site";
import { breadcrumbLd, faqPageLd, type FaqItem } from "@/lib/structured-data";

const FAQ: FaqItem[] = [
  {
    q: "How much does a West Hartford shop website cost?",
    a: PRICE_SENTENCE,
  },
  {
    q: "What is the first step?",
    a: "Start with a free FORGE CT Audit, with three fixes within 24 hours, or call (959) 229-0653.",
  },
];

export const Route = createFileRoute("/west-hartford-web-design")({
  head: () =>
    pageHead("/west-hartford-web-design", undefined, [
      faqPageLd(FAQ),
      breadcrumbLd("West Hartford Web Design", "/west-hartford-web-design"),
    ]),
  component: WestHartford,
});

function WestHartford() {
  return (
    <main id="main">
      <PageHead plate={["West Hartford", "Farmington builder"]} title="West Hartford web design for local shops">
        <p className="lede">
          FORGE CT built the site for{" "}
          <Link className="link" to="/work/$slug" params={{ slug: "thousand-sunny" }}>
            Thousand Sunny Cards and Collectibles
          </Link>{" "}
          in West Hartford. It covers event nights, what's on the shelves and how to get there, all on a phone. I'm Nick
          Sousa, a few minutes away in Farmington, and I build the same kind of site for West Hartford Center, Blue Back
          Square, Elmwood and Bishops Corner businesses.
        </p>
      </PageHead>

      <section className="band">
        <div className="wrap stack">
          <p>
            Pricing is published. {PRICE_SENTENCE}
          </p>
          <p>
            <strong>See it live:</strong>{" "}
            <Link className="link" to="/work/$slug" params={{ slug: "thousand-sunny" }}>
              Thousand Sunny case study
            </Link>
            {" · "}
            <strong>Start:</strong> free{" "}
            <Link className="link" to="/audit">
              FORGE CT Audit
            </Link>
            , with three fixes within 24 hours, or call <a href="tel:+19592290653">(959) 229-0653</a>.
          </p>
        </div>
      </section>

      <section className="band band--fog" id="faq" aria-labelledby="west-hartford-faq">
        <div className="wrap">
          <Plate items={["FAQ"]} />
          <h2 id="west-hartford-faq">Straight answers before you reach out.</h2>
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
    </main>
  );
}
