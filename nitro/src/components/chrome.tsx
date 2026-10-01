import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { BUSINESS, MAILTO } from "@/lib/site";

const NAV = [
  { to: "/work", label: "Work" },
  { to: "/services", label: "Services" },
  { to: "/care", label: "Care" },
  { to: "/why", label: "Why Forge" },
  { to: "/contact", label: "Contact" },
] as const;

export function Wordmark() {
  return (
    <>
      FORGE<span>-CT</span>
    </>
  );
}

type Current = "page" | "true" | undefined;

/**
 * Which masthead link is current. We set aria-current ourselves (TanStack's Link would otherwise mark any
 * prefix match as "page"):
 *   "page"  — the link's own page (/work, /audit, …)
 *   "true"  — a page inside that section (/work/thousand-sunny marks Work)
 *   none    — every link on a 404, including /work/<unknown>, so the masthead never claims a missing page.
 */
function useCurrent() {
  const path = useRouterState({ select: (s) => s.location.pathname.replace(/\/+$/, "") || "/" });
  const missing = useRouterState({
    // A 404 (global, or thrown by a loader such as /work/$slug) leaves _notFound on the root match.
    select: (s) => s.matches.some((m) => m.status === "notFound" || m._notFound === true),
  });
  return (to: string): Current => {
    if (missing) return undefined;
    if (path === to) return "page";
    if (to !== "/" && path.startsWith(`${to}/`)) return "true";
    return undefined;
  };
}

function NavLinks({ className, strip = false }: { className: string; strip?: boolean }) {
  const current = useCurrent();
  const ref = useRef<HTMLElement>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Mobile strip: bring the current item into view horizontally without scrolling the page.
  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!strip || !nav || !active) return;
    const left = active.offsetLeft - nav.offsetLeft;
    if (left < nav.scrollLeft || left + active.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollLeft = Math.max(0, left - 16);
    }
  }, [path, strip]);

  return (
    <nav ref={ref} className={className} aria-label="Primary">
      {NAV.map((item) => (
        <Link key={item.to} to={item.to} activeOptions={{ exact: true }} aria-current={current(item.to)}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Masthead() {
  const current = useCurrent();
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="masthead-row">
          <Link to="/" className="wordmark" aria-label="FORGE CT home" activeOptions={{ exact: true }} aria-current={current("/")}>
            <Wordmark />
          </Link>
          <NavLinks className="nav nav--desk" />
          <Link
            to="/audit"
            className="btn"
            data-track="header_audit_cta"
            activeOptions={{ exact: true }}
            aria-current={current("/audit")}
          >
            <span>
              Get <span className="long">your </span>audit
            </span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <NavLinks className="nav nav--strip" strip />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="stack">
            <h2>Websites for the businesses people drive to.</h2>
            <p>
              {BUSINESS.name} is {BUSINESS.founder}, building custom websites and web systems in {BUSINESS.locality},{" "}
              {BUSINESS.regionLong}, for {BUSINESS.area}.
            </p>
            <p>
              <a className="link" href={MAILTO}>
                {BUSINESS.email}
              </a>
            </p>
          </div>
          <nav aria-label="Site">
            <p className="mono">Site</p>
            <ul>
              <li><Link to="/work">Work</Link></li>
              <li><Link to="/services">Services and pricing</Link></li>
              <li><Link to="/care">Care plans</Link></li>
              <li><Link to="/audit">The Forge-CT Audit</Link></li>
              <li><Link to="/why">Why Forge</Link></li>
            </ul>
          </nav>
          <nav aria-label="More">
            <p className="mono">More</p>
            <ul>
              <li><Link to="/book">Book a session</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/hartford-web-design">Hartford web design</Link></li>
              <li><Link to="/connecticut-web-design">Connecticut web design</Link></li>
              <li><Link to="/pay">Pay or manage Care</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </nav>
        </div>
        <p className="footer-mark" aria-hidden="true">
          <Wordmark />
        </p>
        <div className="footer-base">
          <span suppressHydrationWarning>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</span>
          <span>
            {BUSINESS.locality}, {BUSINESS.regionLong}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Plate({ items, heat }: { items: ReactNode[]; heat?: number }) {
  return (
    <ul className="plate">
      {items.map((item, i) => (
        <li key={i} className={i === heat ? "heat" : undefined}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PageHead({ plate, title, children }: { plate: ReactNode[]; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="page-head">
      <div className="wrap">
        <Plate items={plate} />
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}

export function Arrow({ dir = "right" }: { dir?: "right" | "out" | "down" }) {
  return (
    <span className="arrow" aria-hidden="true">
      {dir === "out" ? "↗" : dir === "down" ? "↓" : "→"}
    </span>
  );
}
