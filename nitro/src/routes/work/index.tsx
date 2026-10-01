import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead } from "@/components/chrome";
import { NextSteps } from "@/components/next-steps";
import { LabNote, Ledger } from "@/components/work";
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
          <Link to="/contact" className="btn">
            Talk about your project <Arrow />
          </Link>
          <Link to="/services" className="btn btn--line">
            See services
          </Link>
        </div>
      </PageHead>
      <section className="band" aria-labelledby="ledger-title">
        <div className="wrap">
          <h2 id="ledger-title">Built for the way people find a place.</h2>
          <p className="lede">
            From a phone in the parking lot to a deeper inventory experience, these five client projects give each
            business a useful place to be found and understood.
          </p>
          <Ledger headingId="ledger-title" />
          <LabNote />
        </div>
      </section>
      <NextSteps />
    </main>
  );
}
