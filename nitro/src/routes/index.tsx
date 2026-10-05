import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, Plate } from "@/components/chrome";
import { ClientNotes } from "@/components/client-notes";
import { NextSteps } from "@/components/next-steps";
import { PackageChooser, RateSheet, SheetNotes } from "@/components/rate-sheet";
import { LabNote, Ledger, PhoneRail, ProofDeck } from "@/components/work";
import { pageHead } from "@/lib/seo";
import { BUSINESS, CARE, PACKAGES, usd } from "@/lib/site";
import { PROJECTS } from "@/lib/work";

export const Route = createFileRoute("/")({
  head: () => pageHead("/"),
  component: Home,
});

const QUESTIONS = [
  { q: "Are you open right now?", a: "Hours, holiday notes and how to walk in — on the first screen, not buried in a Facebook post." },
  { q: "What’s actually on the floor?", a: "Collections, events, services and inventory your customers can find without a scroll hunt." },
  { q: "How do I get there, or reach you?", a: "Your address, your map, your phone and a clear next step that works from the parking lot." },
  { q: "Is this my kind of place?", a: "Why you started, what you care about and what makes you different — said in your shop’s own voice." },
];

const BUILDER_PLEDGES = [
  { title: "Talk to the builder.", copy: "Your first conversation is with Nick, not an account manager passing notes along." },
  { title: "One hand from audit to launch.", copy: "The person who reads your Audit is the person who shapes and builds the site." },
  { title: "Start with your storefront.", copy: "The structure and language come from your business and its customers — not a template marketplace." },
];

function Home() {
  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <Plate
            heat={2}
            items={[`${BUSINESS.locality}, Connecticut`, BUSINESS.area, <span key="a"><span className="dot" aria-hidden="true" />Available</span>]}
          />
          <h1 id="hero-title">
            Custom websites for the businesses people <em>drive&nbsp;to.</em>
          </h1>
          <p className="lede">
            Websites for shops and local businesses around {BUSINESS.area}. Built for the phone check before someone
            walks in. Packages from {usd(PACKAGES[0].price)}.
          </p>
          <div className="actions">
            <Link to="/audit" className="btn" data-track="hero_audit_cta">
              Get your Forge-CT Audit <Arrow />
            </Link>
            <a className="btn btn--line" href="#work" data-track="hero_work_cta">
              See the work
            </a>
          </div>
          <p className="hero-note">
            Built and run by {BUSINESS.founder} in {BUSINESS.locality}, CT. Already know the scope?{" "}
            <Link to="/book" data-track="hero_book_cta">
              Book a working session
            </Link>
            .
          </p>
          <PhoneRail />
        </div>
      </section>

      <section className="band" aria-labelledby="test-title">
        <div className="wrap test-grid">
          <div className="sticky stack">
            <Plate items={["The parking-lot test"]} />
            <h2 id="test-title">Every local site gets judged from a phone, in seconds.</h2>
            <p className="lede">
              A FORGE site starts from the business, not a template, and answers the four questions a customer asks
              before they come in.
            </p>
          </div>
          <ol className="questions">
            {QUESTIONS.map((item) => (
              <li key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--tight band--fog" aria-labelledby="audit-title">
        <div className="wrap">
          <div className="ticket">
            <div className="ticket-main">
              <Plate items={["The Forge-CT Audit", "Free", "No pitch deck"]} />
              <h2 id="audit-title">Before I build anything, I’ll show you what your customers see.</h2>
              <ol className="steps-inline">
                <li>
                  <b>Send your URL</b>
                  <span>And a line on what feels stuck.</span>
                </li>
                <li>
                  <b>Get the audit</b>
                  <span>What works, what’s getting lost, what I’d change.</span>
                </li>
                <li>
                  <b>Decide from there</b>
                  <span>Keep the fixes, or talk about a build.</span>
                </li>
              </ol>
              <p className="fine audit-sample-link">
                Want to see the format first? <a className="link" href="/audit#sample-audit">Read an illustrated sample Audit</a>.
              </p>
            </div>
            <div className="ticket-stub">
              <div>
                <p className="stamp">24h</p>
                <p className="muted">Three practical fixes, specific to your business, within 24 hours.</p>
              </div>
              <Link to="/audit" className="btn" data-track="ticket_audit_cta">
                Get your audit <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--void" aria-labelledby="builder-title">
        <div className="wrap">
          <div className="split builder-proof">
            <div className="stack">
              <Plate items={["Who builds it", "No agency handoff"]} />
              <h2 id="builder-title">One person, start to finish.</h2>
              <p className="lede">
                Nick is the person you talk to, the person who reads your Audit, and the person who designs and builds
                your site. Direct conversation; no relay chain between an account team and a separate build team.
              </p>
            </div>
            <ul className="builder-points">
              {BUILDER_PLEDGES.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </li>
              ))}
            </ul>
          </div>
          <dl className="counts">
            <div>
              <dt>Live client sites</dt>
              <dd>{PROJECTS.length}</dd>
            </div>
            <div>
              <dt>Build tiers</dt>
              <dd>{PACKAGES.length}</dd>
            </div>
            <div>
              <dt>Audit reply</dt>
              <dd>24h</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="band" id="work" aria-labelledby="work-title">
        <div className="wrap">
          <Plate items={["Work", `${PROJECTS.length} live client sites`, "Connecticut"]} />
          <div className="split">
            <h2 id="work-title">Real businesses. Real reasons to build.</h2>
            <p className="lede">
              Five live client sites. The screenshot is the proof. The line under it is the documented need and the build —
              not a result we did not measure.
            </p>
          </div>
          <ProofDeck />
          <h3 className="index-label">Index</h3>
          <Ledger headingId="work-title" />
          <LabNote />
        </div>
      </section>
      <ClientNotes />

      <section className="band band--fog" id="pricing" aria-labelledby="pricing-title">
        <div className="wrap">
          <Plate items={["Rate sheet", "Published pricing"]} />
          <div className="split">
            <h2 id="pricing-title">Three clear packages. The scope is on the page.</h2>
            <p className="lede">
              Pick a starting point. The table under the cards is the full spec —{" "}
              <Link className="link" to="/services">
                services and add-ons
              </Link>
              .
            </p>
          </div>
          <PackageChooser />
          <RateSheet caption="FORGE CT website packages" />
          <SheetNotes />
          <p className="actions">
            <span>
              After launch, <Link className="link" to="/care">Care</Link> keeps the details true for {usd(CARE.care.price)} a
              month — first month free after any build.
            </span>
          </p>
        </div>
      </section>

      <NextSteps sectionId="contact" />
    </main>
  );
}
