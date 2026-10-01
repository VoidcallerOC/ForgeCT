import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { pageHead } from "@/lib/seo";
import { BUSINESS, MAILTO } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy"),
  component: Privacy,
});

/**
 * Text is the certified notice, with one factual edit: this build self-hosts its fonts, so the sentence
 * about Google Fonts was removed. Not legal advice; have counsel review before relying on it, and update
 * the effective date when this version is published.
 */
function Privacy() {
  const email = (
    <a className="link" href={MAILTO}>
      {BUSINESS.email}
    </a>
  );
  return (
    <main id="main">
      <PageHead plate={["Privacy Notice"]} title="Privacy, in plain language.">
        <p className="lede">
          This notice explains how FORGE CT handles information when you visit this website or choose to get in touch.
        </p>
        <p className="lede">
          <strong>Effective date:</strong> 28 August 2026
        </p>
      </PageHead>
      <section className="band">
        <div className="wrap prose">
          <h2>Information you choose to share</h2>
          <p>
            The inquiry form submits your name, email address, company, and shop details to a FORGE CT server function so
            the message can be delivered by email. The website does not keep a public database of inquiries. If you email
            FORGE CT directly, the information in your message is used to respond and discuss potential work.
          </p>
          <h2>Information processed automatically</h2>
          <p>
            This website is delivered through Vercel. Like most web-hosting services, Vercel may process standard technical
            request information, such as IP address, browser type, requested page, and time of request, to deliver and
            secure the site. FORGE CT does not operate advertising pixels, visitor profiling, or account registration on
            this website.
          </p>
          <h2>How information is used</h2>
          <p>
            Information is used to operate and secure the site, respond to inquiries, prepare proposals, and provide
            requested services. FORGE CT does not sell personal information.
          </p>
          <h2>Service providers and sharing</h2>
          <p>
            Information may be processed by service providers that support hosting, email, communication, or delivery of
            requested services. Information may also be disclosed where required by law or when necessary to protect
            rights, safety, and the integrity of the website and services.
          </p>
          <p>
            Payments are handled by Stripe on pages hosted by Stripe. Payment links on this website open Stripe directly;
            this website does not collect, transmit, or store card or bank account numbers. Any information entered on a
            Stripe page is processed by Stripe under its own privacy policy, and FORGE receives only the billing contact
            details and payment status needed to run a care plan or an invoice.
          </p>
          <h2>Your choices</h2>
          <p>
            You may ask about, correct, or request deletion of personal information you have provided by emailing {email}.
            Some information may need to be retained when reasonably necessary for legitimate business, legal, security, or
            recordkeeping purposes.
          </p>
          <h2>Children</h2>
          <p>
            This site is intended for businesses and adults seeking professional shop pages. It is not directed to children,
            and FORGE CT does not knowingly collect personal information from children through this website.
          </p>
          <h2>Changes to this notice</h2>
          <p>
            This notice may be updated when the site, services, or data practices change. The effective date above
            indicates when it was last revised.
          </p>
          <h2>Contact</h2>
          <p>For questions about this notice or personal information, contact {email}.</p>
        </div>
      </section>
    </main>
  );
}
