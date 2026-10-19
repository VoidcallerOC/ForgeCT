import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Arrow } from "@/components/chrome";
import { BUSINESS } from "@/lib/site";

/**
 * The Forge-CT Audit Ticket: the one light "paper" object on a dark site. It is the inspection
 * record a shop gets back — FIND / MISS / FORGE / NEXT — rendered as a printed ticket with a
 * perforated stub.
 *
 * Two modes, both honest:
 *   "offer"  — what each line of a real ticket covers. No findings are shown, nothing is "issued".
 *   "sample" — a fictional specialty shop, stamped ILLUSTRATIVE. The findings are made up to show
 *              the format. It is never presented as a real business or a real Forge-CT Audit.
 * No score, no verification badge, no automated check: the Audit is written by one person.
 */

type Mark = "pass" | "miss" | "fix" | "next";

const MARK: Record<Mark, { glyph: string; label: string }> = {
  pass: { glyph: "■", label: "Working" },
  miss: { glyph: "▲", label: "Getting lost" },
  fix: { glyph: "✚", label: "Practical fix" },
  next: { glyph: "→", label: "If the fixes point to more" },
};

/** Fictional sample content. Every line here is invented and labelled as such on the ticket. */
const SAMPLE = {
  shop: "A fictional specialty shop",
  url: "example-shop.com",
  find: "The shop name, the street and one photo of the counter are on the first screen. A visitor knows they are in the right place.",
  miss: "Today's hours, the address and the phone number are below three screens of scrolling. Nothing on the first screen says what is on the floor.",
  fixes: [
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
  ],
  next: "Decide after the fixes. If a build makes sense, the package scope and prices are published; nothing here commits the shop to one.",
};

function Row({ mark, code, title, children }: { mark: Mark; code: string; title: string; children: ReactNode }) {
  return (
    <div className="tk-row" data-mark={mark}>
      <dt>
        <span className="tk-mark" aria-hidden="true">
          {MARK[mark].glyph}
        </span>
        <span className="tk-code">{code}</span>
        <span className="sr-only">{MARK[mark].label}: </span>
        <span className="tk-title">{title}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function AuditTicket({ mode, headingId, heading }: { mode: "offer" | "sample"; headingId: string; heading: ReactNode }) {
  const sample = mode === "sample";
  return (
    <article className="ticket" aria-labelledby={headingId} data-mode={mode}>
      <div className="tk-main">
        <header className="tk-head">
          <p className="tk-brand">
            <span>Forge-CT Audit</span>
            <span className="tk-sub">Inspection record · your storefront, read as a customer</span>
          </p>
          <p className="tk-no">
            <span className="tk-label">Ticket</span>
            <span>{sample ? "No. SAMPLE" : "No. — issued after review"}</span>
          </p>
        </header>
        <div className="tk-meta">
          <p>
            <span className="tk-label">Shop</span>
            <span>{sample ? SAMPLE.shop : "Yours"}</span>
          </p>
          <p>
            <span className="tk-label">URL</span>
            <span>{sample ? SAMPLE.url : "The one you send"}</span>
          </p>
          <p>
            <span className="tk-label">Reply</span>
            <span>Within 24 hours</span>
          </p>
          <p>
            <span className="tk-label">Cost</span>
            <span>Free · no pitch deck</span>
          </p>
        </div>
        {sample ? (
          <p className="tk-stamp-line" role="note">
            <span className="tk-stamp">Illustrative</span>
            Fictional specialty shop. This is not a real business, client project, or Forge-CT Audit — it shows the
            format only.
          </p>
        ) : null}
        <h2 id={headingId} className="tk-heading">
          {heading}
        </h2>
        <dl className="tk-rows">
          <Row mark="pass" code="Find" title="What works">
            {sample ? SAMPLE.find : "What already earns attention — the reasons a customer keeps reading instead of closing the tab."}
          </Row>
          <Row mark="miss" code="Miss" title="What’s getting lost">
            {sample ? SAMPLE.miss : "What a customer came for and could not find: hours buried, a floor no one can picture, events stuck on Facebook."}
          </Row>
          <Row mark="fix" code="Forge" title="Three practical fixes">
            {sample ? (
              <ol className="tk-fixes" aria-label="Illustrative audit observations and recommendations">
                {SAMPLE.fixes.map((f, i) => (
                  <li key={f.problem}>
                    <span className="tk-fix-no">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="tk-label">What a visitor may miss</span>
                      <span>{f.problem}</span>
                    </span>
                    <span>
                      <span className="tk-label">A practical change</span>
                      <span>{f.recommendation}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              "Specific to your shop — the kind you can act on whether or not you ever hire me."
            )}
          </Row>
          <Row mark="next" code="Next" title="What I’d build, if anything">
            {sample ? SAMPLE.next : "Where a shop page, a system or a custom build would take it — only if the fixes point there."}
          </Row>
        </dl>
        <footer className="tk-foot">
          <span>
            Written by {BUSINESS.founder} · {BUSINESS.locality}, {BUSINESS.region}
          </span>
          <span>One person reads it, one person writes it. No score out of a hundred.</span>
        </footer>
      </div>
      <aside className="tk-stub" aria-label="Get your audit">
        <p className="tk-stub-top">
          <span className="tk-label">Reply</span>
          <span className="stamp">24h</span>
        </p>
        <p className="tk-stub-copy">
          {sample
            ? "Your ticket is written for your shop, from your URL. Send it below."
            : "Three practical fixes, specific to your business, within 24 hours."}
        </p>
        {sample ? (
          <a href="#audit-form" className="btn" data-track="sample_ticket_cta">
            Send your URL <Arrow dir="down" />
          </a>
        ) : (
          <Link to="/audit" className="btn" data-track="ticket_audit_cta">
            Get your audit <Arrow />
          </Link>
        )}
        {!sample ? (
          <p className="fine audit-sample-link">
            Want to see the format first? <a className="link" href="/audit#sample-audit">Read an illustrated sample Audit</a>.
          </p>
        ) : null}
      </aside>
    </article>
  );
}
