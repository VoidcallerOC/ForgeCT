import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Plate } from "@/components/chrome";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";
import { breadcrumbLd, faqPageLd, type FaqItem } from "@/lib/structured-data";

const FAQ: FaqItem[] = [
  {
    q: "How much does a shop website cost in Hartford?",
    a: "Local Business Site from $2,000. Site and System $6,000. Product Site $16,000. Care is $35/month or Care+ is $79/month.",
  },
  {
    q: "What does a Hartford shop website need?",
    a: "A useful shop website makes hours, location, directions, what you offer, and the next step easy to find from a phone. FORGE CT builds around the customer visit, not a generic brochure.",
  },
  {
    q: "Do you work with shops outside Hartford?",
    a: "FORGE CT is based in Farmington and works with shops across Greater Hartford and Connecticut. Send your URL to start with three practical website fixes within 24 hours.",
  },
  {
    q: "What is the first step?",
    a: "Send your shop URL and a little context about what feels stuck. FORGE CT will review it like a customer and reply with three practical fixes within 24 hours. Or call (959) 229-0653.",
  },
];

export const Route = createFileRoute("/hartford-web-design")({
  head: () =>
    pageHead("/hartford-web-design", undefined, [
      faqPageLd(FAQ),
      breadcrumbLd("Hartford Web Design", "/hartford-web-design"),
    ]),
  component: Hartford,
});

function Hartford() {
  return (
    <main id="main">
      <PageHead plate={["Hartford", "Farmington builder", "Sites and apps"]} title="Hartford web design for shops people drive to">
        <p className="lede">
          Hartford businesses compete for the same phone screen as every agency client in the city. FORGE CT is one builder
          in Farmington, just west of Hartford, who makes websites and web systems for Hartford shops, restaurants and
          local services.
        </p>
        <p>
          You get published prices, live client sites you can open before you commit, and no agency relay team. Local
          Business Site from $2,000. Site and System $6,000. Product Site $16,000. Care $35/month or Care+ $79/month.
        </p>
        <p>
          <strong>Proof you can open today:</strong>{" "}
          <Link className="link" to="/work/$slug" params={{ slug: "thousand-sunny" }}>
            Thousand Sunny
          </Link>
          ,{" "}
          <Link className="link" to="/work/$slug" params={{ slug: "m-and-j-video-games" }}>
            M&J Video Games
          </Link>
          , Hard Hittin and{" "}
          <Link className="link" to="/work/$slug" params={{ slug: "infinite-heroes" }}>
            Infinite Heroes
          </Link>
          .
        </p>
        <p>
          <strong>Start here:</strong> a free{" "}
          <Link className="link" to="/audit">
            FORGE CT Audit
          </Link>{" "}
          with three fixes within 24 hours, or call <a href="tel:+19592290653">(959) 229-0653</a>.
        </p>
      </PageHead>

      <section className="band" id="faq" aria-labelledby="faq-title">
        <div className="wrap">
          <Plate items={["FAQ"]} />
          <h2 id="faq-title">Straight answers before you reach out.</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.q === "Do you work with shops outside Hartford?" ? <ConnecticutAnswer text={f.a} /> : f.a}</div>
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

/** Keeps the published answer text and links the state name to the Connecticut page. */
function ConnecticutAnswer({ text }: { text: string }) {
  const [before, after] = text.split("Connecticut");
  return (
    <>
      {before}
      <Link className="link" to="/connecticut-web-design">
        Connecticut
      </Link>
      {after}
    </>
  );
}
