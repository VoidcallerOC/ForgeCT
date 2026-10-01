/**
 * Response headers for every route. Same policy family as the certified site's vercel.json, with two
 * deliberate differences:
 * - Fonts are self-hosted (@fontsource), so Google Fonts and jsDelivr are no longer allowed origins.
 * - HTML pages revalidate (no-cache); hashed build assets and images are long-lived.
 * script-src keeps 'unsafe-inline' because the framework writes inline hydration data, exactly as the
 * certified policy already allowed. No inline style attributes are used, so style-src-attr stays 'none'.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://cdn.vercel-insights.com",
  "script-src-attr 'none'",
  "style-src 'self'",
  "style-src-attr 'none'",
  "font-src 'self'",
  "img-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-analytics.com",
  "form-action 'self'",
  "frame-src 'none'",
  "media-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  "block-all-mixed-content",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};
