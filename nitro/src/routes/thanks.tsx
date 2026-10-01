import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Arrow, PageHead } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { BUSINESS } from "@/lib/site";

export const Route = createFileRoute("/thanks")({
  head: () => pageHead("/thanks"),
  component: Thanks,
});

const FALLBACK = `Could not open checkout. Email ${BUSINESS.email} and I will send an invoice.`;

/**
 * Stripe returns here with ?session_id=… The billing button posts it to /api/portal (unchanged certified
 * handler) and follows the returned Stripe-hosted URL. Without a session id the button stays hidden,
 * as on the certified page. The id is read after mount so the prerendered HTML hydrates cleanly.
 */
function Thanks() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSessionId(new URLSearchParams(window.location.search).get("session_id"));
  }, []);

  async function openBilling() {
    if (!sessionId) return;
    setBusy(true);
    setStatus("Opening secure checkout…");
    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !result.ok || !result.url) throw new Error(result.error || FALLBACK);
      window.location.assign(result.url);
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : FALLBACK);
      setBusy(false);
    }
  }

  return (
    <main id="main">
      <PageHead plate={["Payment received"]} title="That went through. Thank you.">
        <p className="lede">
          Stripe emailed your receipt. I get the same notice in the studio inbox and will reply from {BUSINESS.email} —
          usually the same day.
        </p>
      </PageHead>
      <section className="band">
        <div className="wrap stack measure">
          <h2>Manage your plan</h2>
          <p className="lede">
            On a Care plan, this opens Stripe’s billing page. Update the card, read past receipts, or cancel any month.
            Bookmark this page to come back to it.
          </p>
          <div className="actions">
            {sessionId ? (
              <button type="button" className="btn" onClick={openBilling} disabled={busy} aria-describedby="portal-status">
                Open billing <Arrow dir="out" />
              </button>
            ) : null}
            <Link to="/services" className="btn btn--line">
              Back to services
            </Link>
          </div>
          <p id="portal-status" className="form-status" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </section>
    </main>
  );
}
