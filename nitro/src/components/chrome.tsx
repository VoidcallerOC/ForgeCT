import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
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

function NavLinks({ className, label }: { className: string; label: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className={className} aria-label={label}>
      {NAV.map((item) => {
        const current = path === item.to || path.startsWith(`${item.to}/`);
        return (
          <Link key={item.to} to={item.to} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="masthead-row">
          <Link to="/" className="wordmark" aria-label="FORGE CT home">
            <Wordmark />
          </Link>
          <NavLinks className="nav nav--desk" label="Primary" />
          <Link to="/audit" className="btn" data-track="header_audit_cta">
            <span>
              Get <span className="long">your </span>audit
            </span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <NavLinks className="nav nav--strip" label="Primary (compact)" />
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
