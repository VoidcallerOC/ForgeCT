import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead } from "@/components/chrome";
import { NextSteps } from "@/components/next-steps";
import { LabNote, Ledger, ProofDeck } from "@/components/work";
import { pageHead } from "@/lib/seo";
import { PROJECTS } from "@/lib/work";

export const Route = createFileRoute("/work/")({
  head: () => pageHead("/work"),
  component: WorkIndex,
});

function WorkIndex() {
  return (
    <main id="main">
      <PageHead plate={["Forge CT portfolio", "Live client work", "Connecticut"]} title="Real businesses. Real reasons to build.">
        <p className="lede">
          These are the {PROJECTS.length === 5 ? "five" : PROJECTS.length} approved Forge CT live client projects for shops and
          local businesses. Each case study records the documented need and build, without claims that are not
          established.
        </p>
        <div className="actions">
          <Link to="/audit" className="btn" data-track="work_audit_cta">
            Get your Forge-CT Audit <Arrow />
          </Link>
          <Link to="/book" className="btn btn--line" data-track="work_book_cta">
            Book a working session
          </Link>
        </div>
      </PageHead>
      <section className="band" aria-labelledby="ledger-title">
        <div className="wrap">
          <h2 id="ledger-title">Built for the way people find a place.</h2>
          <p className="lede">Open a case. The screenshot is the existing site. The lines are the documented need and build.</p>
          <ProofDeck />
          <h3 className="index-label">Index</h3>
          <Ledger headingId="ledger-title" />
          <LabNote />
        </div>
      </section>
      <NextSteps />
    </main>
  );
}
