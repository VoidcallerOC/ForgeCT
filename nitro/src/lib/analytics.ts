/**
 * Vercel Web Analytics custom events, same names as the certified site so conversion reporting carries
 * over: landing_page_view (with page), lead_form_success (with source), and data-track click events.
 * The queue stub is installed in the document head (see __root.tsx) before the analytics script loads.
 */
type VaQueue = (...args: unknown[]) => void;

export function track(name: string, properties: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const va = (window as unknown as { va?: VaQueue }).va;
  va?.("event", { name, ...properties });
}

export const VA_STUB = "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};";

/** Conversion pages report a stable name, matching data-conversion-page on the certified site. */
export const CONVERSION_PAGES: Record<string, string> = {
  "/audit": "audit",
  "/book": "booking",
  "/contact": "contact",
  "/hartford-web-design": "hartford-web-design",
};
