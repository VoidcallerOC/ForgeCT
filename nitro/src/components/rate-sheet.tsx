import { Link } from "@tanstack/react-router";
import { Arrow } from "@/components/chrome";
import { CARE, PACKAGES, usd } from "@/lib/site";

const ROWS: { label: string; cell: (i: number) => { text: string; yes?: boolean; no?: boolean } }[] = [
  { label: "Pages", cell: (i) => ({ text: `Up to ${PACKAGES[i].pages}` }) },
  { label: "Custom design and development", cell: () => ({ text: "Included", yes: true }) },
  { label: "Responsive, mobile-first functional website", cell: () => ({ text: "Included", yes: true }) },
  { label: "Hosting setup and social media icons", cell: () => ({ text: "Included", yes: true }) },
  {
    label: "Speed and performance optimization",
    cell: (i) => (PACKAGES[i].performance ? { text: "Included", yes: true } : { text: "—", no: true }),
  },
  {
    label: "Advanced functionality",
    cell: (i) => (PACKAGES[i].advanced ? { text: "Included", yes: true } : { text: "—", no: true }),
  },
  {
    label: "Revisions",
    cell: (i) => ({ text: `${PACKAGES[i].revisions} revision${PACKAGES[i].revisions > 1 ? "s" : ""}` }),
  },
];

/** One-line reading of the published package differences. Not a new offer. */
const OUTCOMES = [
  "Get the shop page online.",
  "More pages, plus performance.",
  "Room for advanced functionality.",
];

/** Scannable starting points above the certified spec table. */
export function PackageChooser() {
  return (
    <ul className="chooser">
      {PACKAGES.map((p, i) => (
        <li key={p.id}>
          <p className="tier">{p.tier}</p>
          <p className="price">{usd(p.price)}</p>
          <p className="outcome">{OUTCOMES[i]}</p>
          <p className="fine">
            Up to {p.pages} pages · {p.revisions} revision{p.revisions > 1 ? "s" : ""}
          </p>
          <Link className="link" to="/book" data-track={`chooser_book_${p.id}`}>
            Book a session about {p.tier} <Arrow />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Basic / Standard / Premium as one spec table. Every value is from the certified /services page. */
export function RateSheet({ caption }: { caption?: string }) {
  return (
    <table className="sheet">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          <td />
          {PACKAGES.map((p) => (
            <th key={p.id} scope="col">
              <span className="tier">{p.tier}</span>
              <span className="price">{usd(p.price)}</span>
              <span className="label">{p.label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {PACKAGES.map((p, i) => {
              const c = row.cell(i);
              return (
                <td key={p.id} className={c.yes ? "yes" : c.no ? "no" : undefined}>
                  {c.no ? <span aria-label="Not included">—</span> : c.text}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td />
          {PACKAGES.map((p) => (
            <td key={p.id}>
              <Link className="link" to="/book" data-track={`sheet_book_${p.id}`}>
                Book <span className="sr-only">a session about {p.tier}</span>
                <Arrow />
              </Link>
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}

export function SheetNotes() {
  return (
    <div className="notes">
      <div className="note">
        <b>E-commerce is a separately priced add-on.</b>
        <p>Not part of any base package. It is a custom quote with no fixed price, and larger custom work is scoped separately.</p>
      </div>
      <div className="note">
        <b>Care after launch.</b>
        <p>
          Care is {usd(CARE.care.price)}/month. Care+ is {usd(CARE.carePlus.price)}/month.
        </p>
      </div>
      <div className="note">
        <b>Performance is not an upsell.</b>
        <p>Performance is part of the FORGE CT development approach, not a paid speed-optimization add-on.</p>
      </div>
    </div>
  );
}
