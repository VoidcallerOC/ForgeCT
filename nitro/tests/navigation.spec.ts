import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

/**
 * Masthead navigation: destinations, active states, keyboard use, dead links and 404 behaviour,
 * at desktop width (inline nav) and phone width (scrollable nav strip).
 */
const PRIMARY = [
  { label: "Work", path: "/work", h1: "Real businesses. Real reasons to build." },
  { label: "Services", path: "/services", h1: "Custom websites. Built fast." },
  { label: "Care", path: "/care", h1: "Care you can actually keep." },
  { label: "Why Forge", path: "/why", h1: "Agencies quote you. I show you live shops." },
  { label: "Contact", path: "/contact", h1: "What’s on your floor?" },
];
const CTA = { path: "/audit", h1: "The digital inspection ticket for your storefront." };

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, nav: "nav.nav--desk" },
  { name: "mobile", width: 390, height: 844, nav: "nav.nav--strip" },
] as const;

/** Certified route baseline: every URL in the certified sitemap plus the certified non-indexed pages. */
function certifiedRoutes() {
  let xml: string;
  try {
    xml = readFileSync(new URL("../../sitemap.xml", import.meta.url), "utf8");
  } catch {
    xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  }
  const routes = [...xml.matchAll(/<loc>https:\/\/www\.forge-ct\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  return new Set([...routes, "/pay", "/thanks", "/privacy"]);
}

const masthead = (page: Page) => page.locator("header.masthead");
const currentLinks = (page: Page) =>
  masthead(page)
    .locator("a[aria-current]")
    .evaluateAll((as) =>
      as
        .filter((a) => (a as HTMLElement).offsetParent !== null)
        .map((a) => `${a.getAttribute("href")}=${a.getAttribute("aria-current")}`),
    );

for (const vp of VIEWPORTS) {
  test.describe(`masthead on ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("exactly one primary nav is shown", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("header nav:visible")).toHaveCount(1);
      await expect(page.locator(vp.nav)).toBeVisible();
      await expect(page.locator(vp.nav).getByRole("link")).toHaveText(PRIMARY.map((p) => p.label));
    });

    for (const item of PRIMARY) {
      test(`${item.label} goes to ${item.path} and is the current page there`, async ({ page }) => {
        await page.goto("/");
        await page.locator(vp.nav).getByRole("link", { name: item.label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${item.path}$`));
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.h1);
        expect(await currentLinks(page)).toEqual([`${item.path}=page`]);
      });
    }

    test("Get your audit goes to /audit and is the current page there", async ({ page }) => {
      await page.goto("/work");
      await masthead(page).locator("a.btn").click();
      await expect(page).toHaveURL(/\/audit$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(CTA.h1);
      await expect(masthead(page).locator("a.btn")).toHaveAttribute("aria-current", "page");
      expect(await currentLinks(page)).toEqual(["/audit=page"]);
    });

    test("wordmark goes home and is current only on /", async ({ page }) => {
      await page.goto("/services");
      await masthead(page).getByRole("link", { name: "FORGE CT home" }).click();
      await expect(page).toHaveURL(/\/$/);
      expect(await currentLinks(page)).toEqual(["/=page"]);
    });

    test("a case study marks Work as its section, not as the page", async ({ page }) => {
      await page.goto("/work/thousand-sunny");
      expect(await currentLinks(page)).toEqual(["/work=true"]);
    });

    test("pages outside the primary nav mark nothing current", async ({ page }) => {
      for (const path of ["/book", "/pay", "/privacy", "/hartford-web-design", "/connecticut-web-design"]) {
        await page.goto(path);
        expect(await currentLinks(page), path).toEqual([]);
      }
    });

    test("keyboard: Tab reaches every masthead link and Enter follows it", async ({ page }) => {
      await page.goto("/");
      const reached: string[] = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        const href = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          return el?.closest("header.masthead") ? el.getAttribute("href") : null;
        });
        if (href) reached.push(href);
      }
      for (const href of ["/", ...PRIMARY.map((p) => p.path), CTA.path]) expect(reached, href).toContain(href);

      await page.goto("/");
      const target = page.locator(vp.nav).getByRole("link", { name: "Services", exact: true });
      await target.focus();
      await expect(target).toBeFocused();
      const ring = await target.evaluate((a) => getComputedStyle(a).outlineStyle);
      expect(ring).not.toBe("none");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/services$/);
    });

    test("404 pages return 404, mark nothing current, and the nav still works", async ({ page }) => {
      for (const path of ["/not-a-page", "/work/not-a-client"]) {
        const response = await page.goto(path);
        expect(response?.status(), path).toBe(404);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page isn’t here.");
        expect(await currentLinks(page), path).toEqual([]);
      }
      await page.locator(vp.nav).getByRole("link", { name: "Work", exact: true }).click();
      await expect(page).toHaveURL(/\/work$/);
      expect(await currentLinks(page)).toEqual(["/work=page"]);
    });
  });
}

test("every masthead destination is a certified route and resolves (no dead links)", async ({ page, request }) => {
  const baseline = certifiedRoutes();
  await page.goto("/");
  const hrefs = await masthead(page)
    .locator("a")
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")!))]);
  expect(hrefs.length).toBe(PRIMARY.length + 2);
  for (const href of hrefs) {
    expect(href.startsWith("/"), `${href} should be internal`).toBe(true);
    expect(baseline.has(href), `${href} is not in the certified route baseline`).toBe(true);
    expect((await request.get(href, { maxRedirects: 0 })).status(), href).toBe(200);
  }
});

test("mobile strip keeps the current item in view at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const item of PRIMARY) {
    await page.goto(item.path);
    const inView = await page.locator("nav.nav--strip a[aria-current]").evaluate((a) => {
      const r = a.getBoundingClientRect();
      const s = a.closest("nav")!.getBoundingClientRect();
      return r.left >= s.left - 1 && r.right <= s.right + 1;
    });
    expect(inView, item.path).toBe(true);
    expect(await page.evaluate(() => window.scrollY), `${item.path} page scroll`).toBe(0);
  }
});

test("nav switches cleanly at the 900px breakpoint without overflow", async ({ page }) => {
  for (const width of [899, 900]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/contact");
    await expect(page.locator("header nav:visible")).toHaveCount(1);
    await expect(page.locator(width < 900 ? "nav.nav--strip" : "nav.nav--desk")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test.describe("mobile strip scroll position across client-side navigation", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  const strip = (page: Page) => page.locator("nav.nav--strip");
  const scrollLeft = (page: Page) => strip(page).evaluate((n) => n.scrollLeft);
  const linkInView = (page: Page, label: string) =>
    strip(page)
      .getByRole("link", { name: label, exact: true })
      .evaluate((a) => {
        const r = a.getBoundingClientRect();
        const s = a.closest("nav")!.getBoundingClientRect();
        return r.left >= s.left - 1 && r.right <= s.right + 1;
      });
  const go = async (page: Page, label: string, url: RegExp) => {
    if (label === "Get audit") await masthead(page).locator("a.btn").click();
    else await strip(page).getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(url);
  };

  test("regression: Home → Contact → Audit resets the strip so Work is visible", async ({ page }) => {
    await page.goto("/");
    await go(page, "Contact", /\/contact$/);
    await expect.poll(() => linkInView(page, "Contact")).toBe(true);
    expect(await scrollLeft(page)).toBeGreaterThan(0);
    await go(page, "Get audit", /\/audit$/);
    await expect.poll(() => scrollLeft(page)).toBe(0);
    expect(await linkInView(page, "Work")).toBe(true);
  });

  test("every hop keeps the current item (or the strip start) in view", async ({ page }) => {
    const hops: [string, RegExp, string | null][] = [
      ["Work", /\/work$/, "Work"],
      ["Contact", /\/contact$/, "Contact"],
      ["Get audit", /\/audit$/, null],
      ["Work", /\/work$/, "Work"],
      ["Get audit", /\/audit$/, null],
      ["Services", /\/services$/, "Services"],
      ["Get audit", /\/audit$/, null],
      ["Why Forge", /\/why$/, "Why Forge"],
      ["Get audit", /\/audit$/, null],
      ["Contact", /\/contact$/, "Contact"],
    ];
    await page.goto("/");
    for (const [label, url, current] of hops) {
      await go(page, label, url);
      if (current) {
        await expect.poll(() => linkInView(page, current), { message: `${label} in view` }).toBe(true);
      } else {
        await expect.poll(() => scrollLeft(page), { message: `strip reset on ${url}` }).toBe(0);
        expect(await linkInView(page, "Work")).toBe(true);
      }
    }
  });
});
