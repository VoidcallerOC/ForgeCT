import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Arrow } from "@/components/chrome";
import { FILTERS, IN_PROGRESS, LAB, PROJECTS, filterCount, type Filter, type Project } from "@/lib/work";

export function PhoneFrame({ project, eager = false }: { project: Project; eager?: boolean }) {
  return (
    <div className="phone-frame">
      <img
        src={project.image}
        alt={`${project.name} website shown on a mobile phone`}
        width={720}
        height={project.imageHeight}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}

/** Visual emphasis only — labels taken from the documented category, not a claimed result. */
const EMPHASIS: Record<string, string> = {
  "harris-in-wonderland": "Systems",
  "thousand-sunny": "Storefront",
  "m-and-j-video-games": "Walk-in",
  "hard-hittin": "Launch",
  "infinite-heroes": "Main Street",
};

/**
 * Case-study rhythm for the homepage and work index.
 * Uses only documented need, build, tags, place, and existing screenshots.
 */
export function ProofDeck() {
  return (
    <div className="proof-deck">
      {PROJECTS.map((p) => (
        <article className="proof" key={p.slug} data-emphasis={EMPHASIS[p.slug] ?? p.category}>
          <Link to="/work/$slug" params={{ slug: p.slug }} className="proof-shot" data-track={`proof_${p.slug}`}>
            <img
              src={p.image}
              alt={`${p.name} website`}
              width={720}
              height={p.imageHeight}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <div className="proof-copy">
            <p className="mono">
              {EMPHASIS[p.slug] ?? p.category} · {p.place}
            </p>
            <h3>
              <Link to="/work/$slug" params={{ slug: p.slug }}>
                {p.name}
              </Link>
            </h3>
            <p className="proof-kicker">The problem</p>
            <p>{p.need}</p>
            <p className="proof-kicker">The Forge</p>
            <p>{p.built}</p>
            <ul className="tag-row">
              {p.tags.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="actions">
              <Link className="btn btn--line" to="/work/$slug" params={{ slug: p.slug }}>
                Case study <Arrow />
              </Link>
              {p.site ? (
                <a className="link" href={p.site} target="_blank" rel="noopener noreferrer" data-track={`proof_live_${p.slug}`}>
                  Visit {p.siteLabel} <Arrow dir="out" />
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/** The five live client sites, as they look on the phone a customer is holding. */
export function PhoneRail() {
  return (
    <div className="rail-wrap">
      <div className="rail-head">
        <p className="mono">
          <span className="dot" aria-hidden="true" />
          Live client sites · {PROJECTS.length}
        </p>
        <p className="mono" aria-hidden="true">
          Swipe <Arrow />
        </p>
      </div>
      <ul className="rail" aria-label="Live client sites">
        {PROJECTS.map((p, i) => (
          <li key={p.slug}>
            <Link to="/work/$slug" params={{ slug: p.slug }} className="phone" data-track={`rail_${p.slug}`}>
              <PhoneFrame project={p} eager={i < 3} />
              <div className="phone-cap">
                <span className="mono">Live · {p.place}</span>
                <strong>{p.name}</strong>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The work ledger: every approved live client project as a row, filterable by the approved taxonomy.
 * All rows are in the server HTML; the filter only hides rows, so nothing depends on JavaScript.
 */
export function Ledger({ headingId }: { headingId?: string }) {
  const [filter, setFilter] = useState<Filter | "all">("all");
  const shown = PROJECTS.filter((p) => filter === "all" || p.filter === filter);
  const chips: { id: Filter | "all"; label: string; n: number }[] = [
    { id: "all", label: "All", n: PROJECTS.length },
    ...FILTERS.map((f) => ({ id: f.id, label: f.label, n: filterCount(f.id) })),
  ];
  return (
    <>
      <div className="ledger-tools">
        <div className="chips" role="group" aria-label="Filter live client sites">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
              <span className="n">{c.n}</span>
            </button>
          ))}
        </div>
        <p className="mono muted" aria-live="polite">
          Showing {shown.length} of {PROJECTS.length}
        </p>
      </div>
      <table className="ledger" aria-labelledby={headingId}>
        <thead>
          <tr>
            <td />
            <th scope="col">Client</th>
            <th scope="col">Town</th>
            <th scope="col">What the site does</th>
            <th scope="col">
              <span className="sr-only">Links</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p) => (
            <tr key={p.slug} hidden={filter !== "all" && p.filter !== filter}>
              <td className="thumb">
                <img src={p.image} alt="" width={56} height={78} loading="lazy" decoding="async" />
              </td>
              <th scope="row" className="name">
                <Link to="/work/$slug" params={{ slug: p.slug }}>
                  {p.name}
                </Link>
                <p className="tags">{p.tags.join(" · ")}</p>
              </th>
              <td className="place">
                <span className="mono">{p.place}</span>
              </td>
              <td className="what">{p.story}</td>
              <td className="go">
                <Link className="link" to="/work/$slug" params={{ slug: p.slug }}>
                  Case study
                </Link>
                {p.site ? (
                  <a className="link" href={p.site} target="_blank" rel="noopener noreferrer" data-track={`ledger_live_${p.slug}`}>
                    {p.siteLabel} <Arrow dir="out" />
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length === 0 ? (
        <p className="empty">
          Nothing under that filter yet.{" "}
          <button type="button" className="chip" onClick={() => setFilter("all")}>
            Show all
          </button>
        </p>
      ) : null}
    </>
  );
}

/** The lab build, kept visibly apart from client work. */
export function LabNote() {
  return (
    <aside className="lab" aria-labelledby="lab-title">
      <img src={LAB.image} alt="Voidcaller interactive music site on mobile" width={120} height={238} loading="lazy" />
      <div className="stack">
        <p className="mono muted">{LAB.kind} · not client work</p>
        <h3 id="lab-title">{LAB.name}</h3>
        <p className="muted">
          {LAB.story} The lab is where FORGE tests richer interaction, sound, and worldbuilding — separate from the
          client work, but available when a project calls for it.
        </p>
        <p>
          <a className="link" href={LAB.site} target="_blank" rel="noopener noreferrer">
            Visit the lab experiment <Arrow dir="out" />
          </a>
        </p>
      </div>
    </aside>
  );
}

/** Engagements in progress, kept apart from the approved live client work and never counted with it. */
export function InProgressNote() {
  if (IN_PROGRESS.length === 0) return null;
  return (
    <section className="wip" aria-labelledby="wip-title">
      <h3 id="wip-title" className="index-label">
        In progress
      </h3>
      {IN_PROGRESS.map((p) => (
        <article className="wip-item" key={p.slug}>
          <Link to="/work/$slug" params={{ slug: p.slug }} data-track={`wip_${p.slug}`}>
            <img src={p.image} alt={`${p.name} website`} width={120} height={238} loading="lazy" decoding="async" />
          </Link>
          <div className="stack">
            <p className="mono muted">
              {p.stage} · {p.category} · not counted as a live client launch
            </p>
            <h4>
              <Link to="/work/$slug" params={{ slug: p.slug }}>
                {p.name}
              </Link>
            </h4>
            <p className="muted">{p.story}</p>
            <div className="actions">
              <Link className="btn btn--line" to="/work/$slug" params={{ slug: p.slug }}>
                Case study <Arrow />
              </Link>
              {p.site ? (
                <a className="link" href={p.site} target="_blank" rel="noopener noreferrer" data-track={`wip_live_${p.slug}`}>
                  Visit {p.siteLabel} <Arrow dir="out" />
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
