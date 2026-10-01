import { createFileRoute, Link } from "@tanstack/react-router";
import { Arrow, PageHead, Plate } from "@/components/chrome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/why")({
  head: () => pageHead("/why"),
  component: Why,
});

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How long does my shop page take?",
    a: "Extra-fast delivery is available for a defined package scope: 1 day for Basic (+$250), 3 days for Standard (+$500), or 5 days for Premium (+$750). Larger or custom projects need their own schedule.",
  },
  { q: "Do I have to write the site?", a: "Give me hours, address, and what you carry. I write the page so a walk-in can use it." },
  { q: "Is this WordPress?", a: "No. A fast page that holds up on a phone in the parking lot. Not a plugin stack." },
  { q: "What if I want off the care plan?", a: "$35 a month. Cancel anytime. The site stays yours." },
  {
    q: "Who is this not for?",
    a: "Not for you if you are a national brand, you want a six-month brand deck, or a Facebook page is all you need.",
  },
  {
    q: "Can I see the work before we talk?",
    a: (
      <>
        Yes. These three featured live client shops are open right now:{" "}
        <a className="link" href="https://www.thousandsunnytcg.com/" target="_blank" rel="noopener noreferrer">Thousand Sunny</a>,{" "}
        <a className="link" href="https://mjvideogames.com/" target="_blank" rel="noopener noreferrer">M and J</a>, and{" "}
        <a className="link" href="https://hardhittincardshop.com/" target="_blank" rel="noopener noreferrer">Hard Hittin</a>. See all five
        approved live client projects in the <Link className="link" to="/work">Forge portfolio</Link>.
      </>
    ),
  },
];

function Why() {
  return (
    <main id="main">
      <PageHead plate={["Why FORGE"]} title="Agencies quote you. I show you live shops.">
        <p className="lede">
          Hartford agencies will sell you a free consult, same as they sell every other trade. I build the page your shop
          actually uses on the floor.
        </p>
      </PageHead>
      <section className="band" aria-labelledby="compare-title">
        <div className="wrap">
          <Plate items={["Side by side"]} />
          <h2 id="compare-title">What changes when the builder is one person you can meet.</h2>
          <div className="compare">
            <div>
              <p className="mono">What you get from a typical Hartford agency</p>
              <ul>
                <li>Any industry. You are one of many.</li>
                <li>Your price comes after a call.</li>
                <li>WordPress template, then a monthly mystery retainer.</li>
                <li>Portfolio of logos. Few live shop URLs.</li>
                <li>2 to 4 weeks of meetings.</li>
              </ul>
            </div>
            <div>
              <p className="mono">FORGE CT</p>
              <ul>
                <li>Built for shops like yours around Hartford.</li>
                <li>Basic is $750, with the package scope listed up front.</li>
                <li>Custom page. Care at $35/month, cancel anytime.</li>
                <li>Three featured live client shops you can open right now.</li>
                <li>Walk in. Shape. Build. Launch.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="band band--fog" aria-labelledby="why-faq">
        <div className="wrap">
          <h2 id="why-faq">Straight answers.</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
          <div className="actions">
            <Link to="/contact" className="btn">
              Tell me about your business <Arrow />
            </Link>
            <span className="muted">
              Or see <Link className="link" to="/services">services</Link>,{" "}
              <Link className="link" to="/connecticut-web-design">Connecticut work</Link>, or{" "}
              <Link className="link" to="/hartford-web-design">Hartford shop work</Link>.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
