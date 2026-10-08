import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { SECURITY_HEADERS } from "./security-headers.ts";

/**
 * FORGE CT on the Forge Nitro stack.
 *
 * - Every page is prerendered to static HTML (crawled from "/"), so production pages
 *   are served from the CDN; /api/* stays dynamic in the Nitro function.
 * - Security headers and the apex → www redirect are written straight into
 *   .vercel/output/config.json, so they cover static files and the function alike.
 *   They match the certified site's vercel.json (see security-headers.ts).
 */
export default defineConfig(({ command, isPreview }) => ({
  server: { host: "0.0.0.0", port: 8080, strictPort: true },
  preview: { host: "127.0.0.1", port: 8081, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: true, failOnError: true },
      pages: [{ path: "/thanks" }, { path: "/pay" }, { path: "/privacy" }],
    }),
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: "vercel",
            vercel: {
              config: {
                routes: [
                  {
                    src: "/(.*)",
                    has: [{ type: "host", value: "forge-ct.com" }],
                    status: 308,
                    headers: { Location: "https://www.forge-ct.com/$1" },
                  },
                  { src: "/(.*)", headers: SECURITY_HEADERS, continue: true },
                  {
                    src: "/(images|brand)/(.*)",
                    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
                    continue: true,
                  },
                  // Client proposal document shell. Match public_id only (no dots) so
                  // /proposals/proposal.css|js stay as static files. Dest /proposals/
                  // (clean URL) — /proposals/index.html 404s on this Nitro output.
                  {
                    src: "/proposals/([A-Za-z0-9_-]{12,})/?",
                    dest: "/proposals/",
                  },
                ],
              },
            },
          }),
        ]
      : []),
    viteReact(),
  ],
}));
