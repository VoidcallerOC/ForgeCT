import { Link } from "@tanstack/react-router";
import { Arrow } from "@/components/chrome";

export function NextSteps({ sectionId }: { sectionId?: string }) {
  return (
    <section id={sectionId} className="band band--tight band--fog next-steps" aria-labelledby="next-title">
      <div className="wrap next-steps-inner">
        <p className="mono muted">The Forge-CT Audit · Free · No pitch deck</p>
        <h2 id="next-title">See what your customers see.</h2>
        <p className="lede">
          Send your business URL and get three practical fixes within 24 hours. Start there, then decide what you want to
          do.
        </p>
        <div className="actions">
          <Link to="/audit" className="btn" data-track="next_audit_cta">
            Get your Forge-CT Audit <Arrow />
          </Link>
          <Link to="/book" className="btn btn--line" data-track="next_book_cta">
            Already know? Book a working session <Arrow />
          </Link>
        </div>
        <p className="fine">
          Have a different question? <Link className="link" to="/contact">Contact Nick directly</Link>.
        </p>
      </div>
    </section>
  );
}
