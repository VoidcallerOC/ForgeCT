import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead } from "@/components/chrome";
import { InquiryForm } from "@/components/inquiry-form";
import { pageHead } from "@/lib/seo";
import { SCHEDULING_URL } from "@/lib/site";

export const Route = createFileRoute("/book")({
  head: () => pageHead("/book"),
  component: Book,
});

function Book() {
  const hasCalendar = Boolean(SCHEDULING_URL);

  return (
    <main id="main">
      <PageHead
        plate={["Book FORGE CT", "Working session"]}
        title={hasCalendar ? "Pick a time that works." : "Request a working session."}
      >
        <p className="lede">
          {hasCalendar
            ? "Choose an open slot on the calendar. You will get a confirmation for that time — not a vague request queue."
            : "Share a preferred window for a focused conversation about your shop, site, or next build. This is a request, not a held reservation; I’ll confirm by email."}
        </p>
      </PageHead>
      <section className="band">
        <div className="wrap form-grid">
          <div className="stack">
            <h2>What we’ll cover.</h2>
            <p className="lede">
              A clear plan for your hours, events, products, and the path a customer takes to your door.
            </p>
            <p className="muted">
              Book first. Pay is step two — a payment request only comes after the work and scope are agreed. Prefer{" "}
              <Link className="link" to="/audit">
                a Forge-CT Audit
              </Link>{" "}
              if you want three practical fixes before we talk.
            </p>
            {hasCalendar ? (
              <p>
                <a
                  className="btn"
                  href={SCHEDULING_URL}
                  rel="noopener"
                  data-track="book_calendar_cta"
                >
                  Open the calendar <Arrow dir="out" />
                </a>
              </p>
            ) : null}
          </div>
          {hasCalendar ? (
            <div className="stack">
              <h2>Or send a preferred window.</h2>
              <p className="muted">
                If none of the open slots work, send a request and I’ll confirm another time by email.
              </p>
              <InquiryForm variant="booking" source="booking-page" />
            </div>
          ) : (
            <InquiryForm variant="booking" source="booking-page" />
          )}
        </div>
      </section>
    </main>
  );
}
