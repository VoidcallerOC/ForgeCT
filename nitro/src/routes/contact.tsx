import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("/contact"),
  component: Contact,
});

function Contact() {
  return (
    <main id="main">
      <PageHead plate={["Contact FORGE CT", "Farmington, Connecticut"]} title="What’s on your floor?">
        <p className="lede">
          Tell me what your shop needs. I’ll reply with practical next steps for a site, app, or ongoing care plan.
        </p>
      </PageHead>
      <section className="band">
        <div className="wrap form-grid">
          <div className="stack">
            <h2>Start with the business.</h2>
            <p className="lede">
              Why you started it, what you sell or do, and what isn’t coming through online right now.
            </p>
            <p className="muted">
              Want a read on your current site first? <Link className="link" to="/audit">Get the Forge-CT Audit</Link>.
            </p>
          </div>
          <InquiryForm variant="inquiry" source="contact-page" messageLabel="What’s your business?" submitLabel="Send inquiry" />
        </div>
      </section>
    </main>
  );
}
