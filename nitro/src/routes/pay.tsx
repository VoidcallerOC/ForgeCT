import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { CARE, PAYMENT_LINKS, usd } from "@/lib/site";

export const Route = createFileRoute("/pay")({
  head: () => pageHead("/pay"),
  component: Pay,
});

const FAQ = [
  { q: "Where does my card go?", a: "To Stripe, on their page, not this one. FORGE never sees or stores a card number." },
  {
    q: "How do I cancel care?",
    a: "The billing link opens your own billing page. Cancel there and the plan stops at the end of the month you paid for. You do not have to ask me first.",
  },
  {
    q: "Can I pay by check?",
    a: "For a build invoice, yes. Ask and I will send it as a bank transfer invoice or take a check. Care plans need a card or bank account on file so the month does not turn into an invoice chase.",
  },
  {
    q: "What happens if a payment fails?",
    a: "Stripe retries it and emails you. The page stays up while that sorts itself out. Nothing goes dark over an expired card.",
  },
];

/**
 * Plain outbound links to Stripe-hosted pages (no card data on this origin, CSP unchanged).
 * The certified page shipped an "unconfigured" fallback state; all three links are configured,
 * so only the configured state is rendered.
 */
function Pay() {
  return (
    <main id="main">
      <PageHead plate={["Pay", "Stripe-hosted checkout"]} title="Start care, or settle a build.">
        <p className="lede">
          Card details never touch this page. Payments open on Stripe, the same checkout the shops you already know use.
          Care is month to month and you cancel it yourself.
        </p>
      </PageHead>
      <section className="band" aria-labelledby="care-plans">
        <div className="wrap">
          <h2 id="care-plans">Care plans</h2>
          <div className="plans">
            <article className="plan">
              <p className="mono">{CARE.care.name}</p>
              <p className="rate">
                {usd(CARE.care.price)} <small>/ month</small>
              </p>
              <ul>
                <li>Hours, holiday notes, events, restocks.</li>
                <li>The page stays up. You still own it.</li>
                <li>Cancel any month, from your own receipt.</li>
              </ul>
              <a className="btn" href={PAYMENT_LINKS.care} rel="noopener" data-track="pay_care">
                Start Care — {usd(CARE.care.price)}/month <Arrow dir="out" />
              </a>
            </article>
            <article className="plan plan--dark">
              <p className="mono">{CARE.carePlus.name}</p>
              <p className="rate">
                {usd(CARE.carePlus.price)} <small>/ month</small>
              </p>
              <ul>
                <li>Everything in Care.</li>
                <li>One extra block or small page change a month.</li>
                <li>Same or next business day.</li>
              </ul>
              <a className="btn" href={PAYMENT_LINKS.carePlus} rel="noopener" data-track="pay_care_plus">
                Start Care+ — {usd(CARE.carePlus.price)}/month <Arrow dir="out" />
              </a>
            </article>
          </div>
          <p className="actions muted">
            <span>
              Already on a plan? <a className="link" href={PAYMENT_LINKS.portal} rel="noopener">Update your card or cancel</a>. No
              email required, no retainer trap.
            </span>
          </p>
        </div>
      </section>
      <section className="band band--fog" aria-labelledby="builds">
        <div className="wrap split">
          <div className="stack">
            <h2 id="builds">Website builds</h2>
            <p className="lede">
              Review the <Link className="link" to="/services">Basic, Standard, and Premium packages and their add-ons</Link>.
              Build payments are arranged after the project scope is confirmed; e-commerce, custom functionality, and larger
              systems may need a separate quote.
            </p>
            <p className="muted">
              Ready to scope a build? <Link className="link" to="/contact">Tell FORGE CT about your project</Link>. You will
              receive a payment request only after the work and scope are agreed.
            </p>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
