import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Plate } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { breadcrumbLd, faqPageLd, type FaqItem } from "@/lib/structured-data";
import { TOWN_PROJECTS } from "@/lib/work";

const FAQ: FaqItem[] = [
  {
    q: "How much does a Farmington business website cost?",
    a: "Local Business Site from $2,000. Site and System (booking, inventory, intake) $6,000. Product Site $16,000. After launch, Care is $35/month or Care+ is $79/month.",
  },
  {
    q: "What is the first step?",
    a: "Send your current site for a free FORGE CT Audit. You'll get three practical fixes within 24 hours. Or call (959) 229-0653 or email create@forge-ct.com.",
  },
];

export const Route = createFileRoute("/farmington-web-design")({
  head: () =>
    pageHead("/farmington-web-design", undefined, [
      faqPageLd(FAQ),
      breadcrumbLd("Farmington CT Web Design", "/farmington-web-design"),
    ]),
  component: Farmington,
});

function Farmington() {
  return (
    <main id="main">
      <PageHead plate={["Farmington, CT 06032", "Sites and apps"]} title="Farmington web design: sites and apps for local businesses">
        <p className="lede">
          FORGE CT is based in Farmington. I'm Nick Sousa, and I design and build websites for the shops, studios and
          service businesses around Farmington Center, Unionville and the Route 4 and Route 10 corridors. You talk to the
          person who builds the site from the first email to launch day.
        </p>
      </PageHead>

      <section className="band">
        <div className="wrap stack">
          <p>
            A Farmington customer usually checks you on a phone before driving over. Can they see your hours, where to
            park, and what's in stock or on the schedule? Every FORGE CT site is built to answer those questions on the
            first screen.
          </p>
          <p>
            <strong>What it costs:</strong> Local Business Site from $2,000. Site and System (booking, inventory, intake)
            $6,000. Product Site $16,000. After launch, Care is $35/month or Care+ is $79/month.
          </p>
          <p>
            <strong>Live work nearby:</strong>{" "}
            {TOWN_PROJECTS.map((p, i) => (
              <span key={p.slug}>
                {i > 0 ? (i === TOWN_PROJECTS.length - 1 ? ", and " : ", ") : null}
                <Link className="link" to="/work/$slug" params={{ slug: p.slug }}>
                  {p.name}
                </Link>{" "}
                in {p.town}
              </span>
            ))}
            .
          </p>
          <p>
            <strong>First step:</strong> send your current site for a free{" "}
            <Link className="link" to="/audit">
              FORGE CT Audit
            </Link>
            . You'll get three practical fixes within 24 hours. Or call <a href="tel:+19592290653">(959) 229-0653</a> or
            email <a href="mailto:create@forge-ct.com">create@forge-ct.com</a>.
          </p>
        </div>
      </section>

      <section className="band band--fog" id="faq" aria-labelledby="farmington-faq">
        <div className="wrap">
          <Plate items={["FAQ"]} />
          <h2 id="farmington-faq">Straight answers before you reach out.</h2>
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
