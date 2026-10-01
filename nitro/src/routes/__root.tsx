import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer, Masthead } from "@/components/chrome";
import { CONVERSION_PAGES, VA_STUB, track } from "@/lib/analytics";
import appCss from "../styles.css?url";

const analyticsScripts = import.meta.env.PROD
  ? [
      { children: VA_STUB },
      { src: "https://cdn.vercel-insights.com/v1/script.js", defer: true },
      { src: "/_vercel/speed-insights/script.js", defer: true },
    ]
  : [{ children: VA_STUB }];

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0a0a" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: analyticsScripts,
  }),
  notFoundComponent: NotFound,
  component: RootDocument,
});

function NotFound() {
  return (
    <main id="main" className="band lost">
      <div className="wrap stack">
        <p className="mono muted">404 · Not on this site</p>
        <h1>That page isn’t here.</h1>
        <p className="lede">It may have moved when the site was rebuilt. The work, the prices and the audit are all one click away.</p>
        <div className="actions">
          <Link to="/" className="btn">
            FORGE CT home
          </Link>
          <Link to="/work" className="link">
            See the work
          </Link>
        </div>
      </div>
    </main>
  );
}

function useAnalytics() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    track("landing_page_view", { page: CONVERSION_PAGES[path] ?? path });
  }, [path]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.("[data-track]");
      const name = target?.getAttribute("data-track");
      if (name) track(name);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function RootDocument() {
  useAnalytics();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Masthead />
        <Outlet />
        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
