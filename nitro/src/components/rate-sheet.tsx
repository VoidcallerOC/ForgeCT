import { Link } from "@tanstack/react-router";
import { Arrow } from "@/components/chrome";
import { PACKAGES, packagePrice, usd } from "@/lib/site";

const ROWS: { label: string; cell: (i: number) => { text: string } }[] = [
  { label: "Price", cell: (i) => ({ text: packagePrice(PACKAGES[i]) }) },
  { label: "Scope", cell: (i) => ({ text: PACKAGES[i].summary }) },
];

/** Scannable starting points above the spec table. */
export function PackageChooser() {
  return (
    <ul className="chooser">
      {PACKAGES.map((p) => (
        <li key={p.id}>
          <p className="tier">{p.name}</p>
          <p className="price">{packagePrice(p)}</p>
          <p className="outcome">{p.summary}</p>
          <Link className="link" to="/book" data-track={`chooser_book_${p.id}`}>
            Book a session about {p.name} <Arrow />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Local Business Site, Site and System, and Product Site. */
export function RateSheet({ caption }: { caption?: string }) {
  return (
    <table className="sheet">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          <td />
          {PACKAGES.map((p) => (
            <th key={p.id} scope="col">
              <span className="tier">{p.name}</span>
              <span className="price">{packagePrice(p)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {PACKAGES.map((p, i) => (
              <td key={p.id}>{row.cell(i).text}</td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td />
          {PACKAGES.map((p) => (
            <td key={p.id}>
              <Link className="link" to="/book" data-track={`sheet_book_${p.id}`}>
                Book <span className="sr-only">a session about {p.name}</span>
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
        <b>Local Business Site from $2,000.</b>
        <p>Site and System is $6,000 and covers booking, inventory, and intake. Product Site is $16,000.</p>
      </div>
      <div className="note">
        <b>Care after launch.</b>
        <p>
          Care is {usd(35)}/month. Care+ is {usd(79)}/month.
        </p>
      </div>
    </div>
  );
}
