import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/book")({
  head: () => pageHead("/book"),
  component: Book,
});

function Book() {
  return (
    <main id="main">
      <PageHead plate={["Book FORGE CT", "Working session"]} title="Put time on the calendar.">
        <p className="lede">
          Choose a preferred window for a focused conversation about your shop, site, or next build. I’ll confirm the
          appointment by email.
        </p>
      </PageHead>
      <section className="band">
        <div className="wrap form-grid">
          <div className="stack">
            <h2>What we’ll cover.</h2>
            <p className="lede">A clear plan for your hours, events, products, and the path a customer takes to your door.</p>
            <p className="muted">Book first. Pay is step two — a payment request only comes after the work and scope are agreed.</p>
          </div>
          <InquiryForm variant="booking" source="booking-page" />
        </div>
      </section>
    </main>
  );
}
