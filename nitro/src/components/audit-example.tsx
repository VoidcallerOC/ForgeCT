import { Plate } from "@/components/chrome";

const FINDINGS = [
  {
    problem: "A visitor has to scroll to find today's hours and where the shop is.",
    recommendation: "Bring hours, address and a tap-to-call or directions link into the first mobile view.",
  },
  {
    problem: "The page names the business but leaves the in-store offer hard to picture.",
    recommendation: "Show a few clear product or service categories, with a link to current inventory if the shop has it.",
  },
  {
    problem: "The next step is easy to miss on a phone.",
    recommendation: "Choose one primary mobile action — call, directions or visit — and make it easy to reach.",
  },
];

export function AuditExample() {
  return (
    <section className="band band--fog" id="sample-audit" aria-labelledby="sample-audit-title">
      <div className="wrap">
        <div className="audit-example-head stack">
          <Plate items={["Illustrative example", "Fictional specialty shop"]} />
          <h2 id="sample-audit-title">A quick look at what an Audit can contain.</h2>
          <p className="lede">
            This made-up example shows how a customer observation becomes a useful recommendation. It is not a real
            business, client project, or Forge-CT Audit.
          </p>
        </div>
        <ol className="audit-example-list" aria-label="Illustrative audit observations and recommendations">
          {FINDINGS.map((finding, index) => (
            <li key={finding.problem}>
              <span className="audit-example-number mono">Problem {String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="mono muted">What a visitor may miss</p>
                <p>{finding.problem}</p>
              </div>
              <div>
                <p className="mono muted">A practical change</p>
                <p>{finding.recommendation}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
