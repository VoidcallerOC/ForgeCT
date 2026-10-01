import type { ErrorComponentProps } from "@tanstack/react-router";
import { BUSINESS } from "./site";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main id="main" className="band lost">
      <div className="wrap stack">
        <p className="mono muted">Something broke</p>
        <h1>This page didn’t load.</h1>
        <p className="lede">
          Try reloading. If it keeps happening, email <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
        </p>
        {import.meta.env.DEV && error instanceof Error ? <pre>{error.message}</pre> : null}
      </div>
    </main>
  );
}
