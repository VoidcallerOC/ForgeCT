import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { AuditExample } from "@/components/audit-example";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/audit")({
  head: () => pageHead("/audit"),
  component: Audit,
});

const READS = [
  { k: "Find", t: "What works", d: "The parts of your page already doing their job — the reasons a customer keeps reading instead of closing the tab." },
  { k: "Miss", t: "What’s getting lost", d: "Hours buried, a floor no one can picture, events stuck on Facebook. What a customer came for and could not find." },
  { k: "Forge", t: "What I’d change", d: "Three practical fixes, specific to your shop — the kind you can act on whether or not you ever hire me." },
  { k: "Next", t: "What I’d build", d: "If the fixes point to something bigger, where a Shop Site, a system, or a custom build would take it." },
];

function Audit() {
  return (
    <main id="main">
      <PageHead plate={["The Forge-CT Audit", "Farmington", "Greater Hartford"]} title="The digital inspection ticket for your storefront.">
        <p className="lede">
          Give me your website. I’ll show you what your customer sees — and reply with three practical fixes within 24
          hours. No pitch deck, no quote maze.
        </p>
        <div className="actions">
          <a href="#audit-form" className="btn" data-track="audit_hero_cta">
            Get your Forge-CT Audit <Arrow dir="down" />
          </a>
          <Link to="/book" className="btn btn--line">
            Book a working session
          </Link>
        </div>
      </PageHead>

      <section className="band" aria-labelledby="reads-title">
        <div className="wrap split">
          <div className="stack">
            <Plate items={["What you get"]} />
            <h2 id="reads-title">Four questions, answered for your shop.</h2>
            <p className="lede">
              Not a score out of a hundred. A read of your page the way a customer meets it — before they decide whether
              to drive over.
            </p>
          </div>
          <ul className="cells">
            {READS.map((r) => (
              <li key={r.k}>
                <p className="mono muted">{r.k}</p>
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AuditExample />

      <section className="band band--fog" id="audit-form" aria-labelledby="form-title">
        <div className="wrap form-grid">
          <div className="stack">
            <Plate items={["Get your audit"]} />
            <h2 id="form-title">Give me your business URL.</h2>
            <p className="lede">
              Five minutes of context is plenty. I’ll look at the page like a customer and reply with your audit — three
              practical fixes — within 24 hours.
            </p>
            <ol className="steps-inline">
              <li><b>Send your URL</b><span>And a line on what feels stuck.</span></li>
              <li><b>Get the audit</b><span>What works, what’s getting lost, what I’d change.</span></li>
              <li><b>Decide from there</b><span>Keep the fixes, or talk about a build.</span></li>
            </ol>
          </div>
          <InquiryForm variant="audit" source="audit" />
        </div>
      </section>
    </main>
  );
}
