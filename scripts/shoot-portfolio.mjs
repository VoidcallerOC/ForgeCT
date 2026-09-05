import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../images/work");

const shots = [
  {
    slug: "thousandsunny",
    url: "https://www.thousandsunnytcg.com/",
    ratio: "16-9",
  },
  { slug: "mjvideogames", url: "https://mjvideogames.com/", ratio: "16-9" },
  {
    slug: "hardhittin",
    url: "https://hardhittincardshop.com/",
    ratio: "16-9",
  },
  {
    slug: "harrisinwonderland",
    url: "https://harrisinwonderland.com/",
    ratio: "16-9",
  },
  {
    slug: "voidcaller",
    url: "https://voidcaller.enterthegrotto.xyz/",
    ratio: "16-9",
  },
];

const VIEWPORT = { width: 1440, height: 900 };

async function main() {
  await mkdir(outDir, { recursive: true });
  const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    proxy: proxyServer ? { server: proxyServer } : undefined,
    args: ["--ignore-certificate-errors"],
  });
  try {
    for (const shot of shots) {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();
      console.log("→", shot.url);
      try {
        await page.goto(shot.url, {
          waitUntil: "networkidle",
          timeout: 45000,
        });
      } catch (err) {
        console.warn(
          "  networkidle timed out, falling back to load:",
          err.message,
        );
        await page.goto(shot.url, { waitUntil: "load", timeout: 45000 });
      }
      // Give any late-loaded fonts / hero images a beat
      await page.waitForTimeout(1200);
      const out = path.join(outDir, `${shot.slug}.png`);
      await page.screenshot({
        path: out,
        clip: {
          x: 0,
          y: 0,
          width: VIEWPORT.width,
          height: VIEWPORT.height,
        },
      });
      console.log("  saved", out);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
