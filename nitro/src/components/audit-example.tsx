import { AuditTicket } from "@/components/audit-ticket";
import { Plate } from "@/components/chrome";

/** The illustrated sample Audit on /audit: the ticket, filled in for a fictional shop. */
export function AuditExample() {
  return (
    <section className="band band--fog" id="sample-audit" aria-labelledby="sample-audit-title">
      <div className="wrap">
        <div className="audit-example-head stack">
          <Plate items={["Illustrative example", "Fictional specialty shop"]} />
          <p className="lede">
            This made-up example shows how a customer observation becomes a useful recommendation. It is not a real
            business, client project, or Forge-CT Audit.
          </p>
        </div>
        <AuditTicket mode="sample" headingId="sample-audit-title" heading="A sample ticket, so you know what comes back." />
      </div>
    </section>
  );
}
