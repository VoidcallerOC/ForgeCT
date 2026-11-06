import { expect, test, type Page } from "@playwright/test";

/**
 * Owner-approved live client roster, written out independently of src/lib/work.ts so a deletion in the
 * app fails here. Voidcaller is a FORGE CT experiment and is never counted as a client.
 */
const APPROVED_CLIENTS = [
  { slug: "harris-in-wonderland", name: "Harris in Wonderland", site: "https://harrisinwonderland.com/" },
  { slug: "thousand-sunny", name: "Thousand Sunny Cards and Collectibles", site: "https://www.thousandsunnytcg.com/" },
  { slug: "m-and-j-video-games", name: "M and J Video Games", site: "https://mjvideogames.com/" },
  { slug: "infinite-heroes", name: "Infinite Heroes", site: "https://infiniteheroes.net/" },
  { slug: "ninos-collectibles", name: "Nino’s Collectibles", site: "https://ninoscollectibles.com/" },
];
const COUNT = APPROVED_CLIENTS.length;

/** Owner-approved rate sheet. Superseded: the $2,000 / $6,000 / $16,000 ladder and extra-fast delivery fees. */
const APPROVED_PACKAGES = [
  { tier: "Basic", label: "Starter Website", price: "$750" },
  { tier: "Standard", label: "Business Website", price: "$1,500" },
  { tier: "Premium", label: "Forge Website", price: "$2,500" },
];
const SUPERSEDED_PRICING = /\$2,000|\$6,000|\$16,000|"(2000|6000|16000)"|Local Business Site|Site and System|Product Site|Extra-fast/i;
const RETIRED = /Hard[\s-]*Hittin/i;
const BANNED = /SousaSaaS|Front Window|Come By/i;

const ROUTES = [
  "/",
  "/work",
  ...APPROVED_CLIENTS.map((c) => `/work/${c.slug}`),
  "/services",
  "/care",
  "/audit",
  "/book",
  "/contact",
  "/why",
  "/hartford-web-design",
  "/farmington-web-design",
  "/west-hartford-web-design",
  "/connecticut-web-design",
  "/pay",
  "/thanks",
  "/privacy",
];

async function captureContact(page: Page) {
  const bodies: Record<string, string>[] = [];
  await page.route("**/api/contact", async (route) => {
    bodies.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  return bodies;
}

test.describe("certified business-critical flows", () => {
  test("contact form submits the certified payload", async ({ page }) => {
    const bodies = await captureContact(page);
    await page.goto("/contact");
    await page.getByLabel("Name").fill("  Test Business  ");
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Company (optional)").fill("Test Business");
    await page.getByLabel("What’s your business?").fill("A local service business looking for clearer information.");
    await page.getByRole("button", { name: /Send inquiry/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "Received" })).toHaveText(/Received.*three practical fixes/i);
    expect(bodies).toEqual([
      {
        name: "Test Business",
        email: "owner@example.com",
        company: "Test Business",
        siteUrl: "",
        message: "A local service business looking for clearer information.",
        website: "",
        source: "inquiry",
      },
    ]);
  });

  test("audit form requires a URL and accepts one typed without https://", async ({ page }) => {
    const bodies = await captureContact(page);
    await page.goto("/audit");
    const form = page.locator("#audit-form form");
    await form.getByLabel("Your name").fill("Pat Owner");
    await form.getByLabel("Email").fill("pat@example.com");
    await form.getByRole("button", { name: /Get my FORGE CT Audit/ }).click();
    expect(bodies).toHaveLength(0);
    await form.getByLabel("Your website URL").fill("example.com");
    await form.getByRole("button", { name: /Get my FORGE CT Audit/ }).click();
    await expect(form.getByRole("status")).toHaveText(/three practical fixes within 24 hours/);
    expect(bodies[0]).toMatchObject({
      name: "Pat Owner",
      siteUrl: "example.com",
      message: "",
      source: "audit",
    });
  });

  test("sample Audit is explicitly fictional and pairs three observations with practical changes", async ({ page }) => {
    await page.goto("/audit#sample-audit");
    const sample = page.locator("#sample-audit");
    await expect(sample).toContainText("Fictional specialty shop");
    await expect(sample).toContainText("not a real business, client project, or FORGE CT Audit");
    await expect(sample.locator("ol > li")).toHaveCount(3);
    await expect(sample.getByText("What a visitor may miss")).toHaveCount(3);
    await expect(sample.getByText("A practical change")).toHaveCount(3);
  });

  test("three featured case studies explain the documented customer path without outcome claims", async ({ page }) => {
    for (const path of ["/work/harris-in-wonderland", "/work/thousand-sunny", "/work/m-and-j-video-games"]) {
      await page.goto(path);
      await expect(page.locator(".facts")).toContainText("Design intent");
      await expect(page.locator(".facts")).toContainText("What visitors can do");
      await expect(page.locator(".case-path li")).toHaveCount(3);
      await expect(page.locator(".facts")).toContainText("No conversion, revenue or other performance result is claimed");
    }
  });

  test("homepage ends with an Audit-first path and keeps Care management in the footer", async ({ page }) => {
    await page.goto("/");
    const finalCta = page.locator("#contact");
    await expect(finalCta.getByRole("link", { name: /Get your FORGE CT Audit/ })).toHaveAttribute("href", "/audit");
    await expect(finalCta.getByRole("link", { name: /Already know\? Book a working session/ })).toHaveAttribute("href", "/book");
    const manageCare = page.getByRole("link", { name: "Manage Care", exact: true });
    await expect(manageCare).toHaveAttribute("href", "/pay");
    await expect(page.locator("header.masthead").getByRole("link", { name: "Manage Care" })).toHaveCount(0);
    await expect(page.locator(".client-notes")).toHaveCount(0);
  });

  test("booking folds date, time and time zone into the message", async ({ page }) => {
    const bodies = await captureContact(page);
    await page.goto("/book");
    await page.getByLabel("Name").fill("Pat Owner");
    await page.getByLabel("Email").fill("pat@example.com");
    await page.getByLabel("Preferred date").fill("2026-10-20");
    await page.getByLabel("Preferred time").fill("10:30");
    await page.getByLabel("What should we cover? (optional)").fill("Events page");
    await page.getByRole("button", { name: /Request this time/ }).click();
    await expect(page.getByRole("status")).toHaveText(/confirm the appointment by email/);
    expect(bodies[0].message).toBe(
      "Appointment request:\nPreferred date: 2026-10-20\nPreferred time: 10:30\nTime zone: Eastern Time\n\nEvents page",
    );
    expect(bodies[0].source).toBe("booking");
  });

  test("API failure shows the server's message, never a false success", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: "The inquiry form is not configured yet. Email create@forge-ct.com instead." }) }),
    );
    await page.goto("/contact");
    await page.getByLabel("Name").fill("Pat Owner");
    await page.getByLabel("Email").fill("pat@example.com");
    await page.getByLabel("What’s your business?").fill("Shop");
    await page.getByRole("button", { name: /Send inquiry/ }).click();
    await expect(page.getByRole("status")).toHaveText(/not configured yet/);
  });

  test("Care and Care+ CTAs point to Stripe Payment Links; portal to Stripe billing", async ({ page }) => {
    await page.goto("/pay");
    await expect(page.getByRole("link", { name: /Start Care — \$35\/month/ })).toHaveAttribute("href", /^https:\/\/buy\.stripe\.com\//);
    await expect(page.getByRole("link", { name: /Start Care\+ — \$79\/month/ })).toHaveAttribute("href", /^https:\/\/buy\.stripe\.com\//);
    await expect(page.getByRole("link", { name: "Update your card or cancel" })).toHaveAttribute("href", /^https:\/\/billing\.stripe\.com\//);
  });

  test("Care welcomes local businesses across multiple industries", async ({ page }) => {
    await page.goto("/care");
    const faq = page.locator("details").filter({ hasText: "Who is this for?" });
    await expect(faq).toContainText("local retail, restaurants, and service businesses");
    await expect(faq).toContainText("FORGE CT sites");
    await expect(page.locator("main")).not.toContainText("card or tabletop shop");
    await expect(page.locator("main")).toContainText("Tell me about your business");
  });

  test("receipt-bound portal button posts the receipt session id", async ({ page }) => {
    await page.goto("/thanks");
    await expect(page.getByRole("button", { name: /Open billing/ })).toHaveCount(0);

    let posted: unknown;
    await page.route("**/api/portal", async (route) => {
      posted = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, url: "/services" }) });
    });
    await page.goto("/thanks?session_id=cs_test_receipt");
    await page.getByRole("button", { name: /Open billing/ }).click();
    await page.waitForURL("**/services");
    expect(posted).toEqual({ session_id: "cs_test_receipt" });
  });
});

test.describe("approved portfolio taxonomy", () => {
  test("ledger lists all five approved clients, filters 4 + 1, and keeps the lab apart", async ({ page }) => {
    await page.goto("/work");
    const rows = page.locator("table.ledger tbody tr");
    await expect(rows).toHaveCount(COUNT);
    for (const c of APPROVED_CLIENTS) await expect(page.locator("table.ledger")).toContainText(c.name);
    await expect(page.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Card and tabletop/ }).click();
    await expect(page.locator("table.ledger tbody tr:visible")).toHaveCount(4);
    await page.getByRole("button", { name: /Retail and local/ }).click();
    await expect(page.locator("table.ledger tbody tr:visible")).toHaveCount(1);
    await expect(page.locator("table.ledger tbody tr:visible")).toContainText("Harris in Wonderland");
    await expect(page.locator("table.ledger")).not.toContainText("Voidcaller");
    await expect(page.locator(".lab")).toContainText("not client work");
  });

  test("visible client counts match the approved roster", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".rail-wrap")).toContainText(`Live client sites · ${COUNT}`);
    await expect(page.locator(".rail > li")).toHaveCount(COUNT);
    await expect(page.locator("#work .proof-deck > article")).toHaveCount(COUNT);
    await expect(page.locator("#work")).toContainText(`Live client sites · ${COUNT}`);
    await expect(page.locator("#work")).toContainText("Five live client sites");
    for (const c of APPROVED_CLIENTS) {
      await expect(page.locator(".rail")).toContainText(c.name);
      await expect(page.locator("#work .proof-deck")).toContainText(c.name);
    }
    await page.goto("/work");
    await expect(page.locator("main")).toContainText("Five live client sites");
    await page.goto("/why");
    await expect(page.locator("main")).toContainText(`${COUNT} live client sites you can open right now`);
    for (const path of ROUTES) {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      expect(text, `${path} shows a stale client count`).not.toMatch(/Live client sites · (?!5\b)\d|\b(three|four|six) (featured |approved )?live client/i);
    }
  });

  test("Harris and Nino’s case studies are live, indexable and linked from the ledger", async ({ page }) => {
    for (const c of APPROVED_CLIENTS.filter((x) => ["harris-in-wonderland", "ninos-collectibles"].includes(x.slug))) {
      await page.goto("/work");
      await page.locator("table.ledger").getByRole("link", { name: c.name }).click();
      await expect(page).toHaveURL(new RegExp(`/work/${c.slug}$`));
      await expect(page.locator("h1")).toHaveText(c.name);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.forge-ct.com/work/${c.slug}`);
      await expect(page).toHaveTitle(`${c.name} — FORGE CT case study`);
      await expect(page.locator("main").getByRole("link", { name: /^Visit / })).toHaveAttribute("href", c.site);
    }
    await page.goto("/work/ninos-collectibles");
    await expect(page.locator(".facts")).toContainText("Checked 11 October 2026");
    await expect(page.locator(".facts")).toContainText("Live pricing is not switched on yet");
  });

  test("restored case studies return 200, not a redirect", async ({ request }) => {
    for (const c of APPROVED_CLIENTS) {
      const res = await request.get(`/work/${c.slug}`, { maxRedirects: 0 });
      expect(res.status(), c.slug).toBe(200);
    }
  });

  test("sitemap lists every approved case study and no retired one", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const c of APPROVED_CLIENTS) expect(xml, c.slug).toContain(`<loc>https://www.forge-ct.com/work/${c.slug}</loc>`);
    expect(xml).not.toMatch(RETIRED);
    expect([...xml.matchAll(/\/work\/[a-z0-9-]+</g)]).toHaveLength(COUNT);
  });

  test("/work structured data lists the approved roster", async ({ page }) => {
    await page.goto("/work");
    const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent || "{}")));
    const collection = blocks.find((b) => b["@type"] === "CollectionPage");
    expect(collection.mainEntity.map((e: { name: string }) => e.name)).toEqual(APPROVED_CLIENTS.map((c) => c.name));
    expect(collection.numberOfItems).toBe(COUNT);
  });

  test("Hard Hittin is not active proof anywhere: copy, meta, social tags or JSON-LD", async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      expect(await page.content(), path).not.toMatch(RETIRED);
    }
  });

  test("banned brands never appear", async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      expect(await page.content(), path).not.toMatch(BANNED);
    }
  });

  test("only approved live client URLs are linked as live sites", async ({ page }) => {
    const approved = new Set([...APPROVED_CLIENTS.map((c) => c.site), "https://voidcaller.enterthegrotto.xyz/"]);
    for (const path of ROUTES) {
      await page.goto(path);
      const external = await page.$$eval("main a[href^='http']", (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const href of external) {
        if (/^https:\/\/(buy|billing)\.stripe\.com\//.test(href)) continue;
        expect(approved.has(href), `${path} links unapproved ${href}`).toBe(true);
      }
    }
  });

  test("every indexable page has a title, description, self canonical and index,follow", async ({ page }) => {
    for (const path of ROUTES.filter((r) => !["/pay", "/thanks", "/privacy"].includes(r))) {
      await page.goto(path);
      expect((await page.title()).length, path).toBeGreaterThan(10);
      await expect(page.locator('meta[name="description"]'), path).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute("content", "index,follow");
      await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute("href", `https://www.forge-ct.com${path === "/" ? "/" : path}`);
    }
  });

  test("footer carries the sites-and-apps tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer.footer")).toContainText("Sites and apps for Connecticut shops.");
    await expect(page.locator("footer.footer")).not.toContainText("Websites for the businesses people drive to.");
  });
});

test.describe("layout and platform", () => {
  for (const width of [360, 390, 514, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ROUTES) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("rate sheet shows the approved Basic / Standard / Premium packages and fits a phone", async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      const sheet = page.locator("#pricing table.sheet");
      const heads = sheet.locator("thead th");
      await expect(heads).toHaveCount(3);
      for (const [i, pk] of APPROVED_PACKAGES.entries()) {
        await expect(heads.nth(i)).toContainText(pk.tier);
        await expect(heads.nth(i)).toContainText(pk.price);
        await expect(heads.nth(i)).toContainText(pk.label);
      }
      await expect(sheet.locator("tbody tr").filter({ hasText: "Pages" }).locator("td")).toHaveText(["Up to 3", "Up to 5", "Up to 8"]);
      await expect(sheet.locator("tbody tr").filter({ hasText: "Revisions" }).locator("td")).toHaveText(["1 revision", "2 revisions", "3 revisions"]);
      await expect(sheet).not.toContainText(/Extra-fast|delivery/i);
      await expect(page.locator("#pricing .chooser")).toContainText("$750");
      await expect(page.locator("#pricing .notes")).toContainText("E-commerce is a separately priced add-on.");
      const fits = await sheet.evaluate((t) => t.getBoundingClientRect().right <= document.documentElement.clientWidth);
      expect(fits, `rate sheet overflows at ${width}px`).toBe(true);
    }
  });

  test("services lists the approved add-ons, with e-commerce quoted per project", async ({ page }) => {
    await page.goto("/services");
    const addons = page.locator("#addons .addons li");
    await expect(addons).toHaveCount(4);
    await expect(addons.filter({ hasText: "Additional page" })).toContainText("+$150");
    await expect(addons.filter({ hasText: "Additional revision" })).toContainText("+$100");
    await expect(addons.filter({ hasText: "Additional product" })).toContainText("+$250");
    await expect(addons.filter({ hasText: "E-commerce functionality" }).locator(".cost")).toHaveText("Quoted per project");
    await expect(page.locator("#addons")).not.toContainText(/day/);
  });

  test("superseded high-priced packages and extra-fast fees appear nowhere: copy, meta or JSON-LD", async ({ page }) => {
    for (const path of ROUTES) {
      await page.goto(path);
      expect(await page.content(), path).not.toMatch(SUPERSEDED_PRICING);
    }
  });

  test("business JSON-LD offers carry the approved prices", async ({ page }) => {
    await page.goto("/services");
    const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => JSON.parse(e.textContent || "{}")));
    const business = blocks.find((b) => b["@type"] === "ProfessionalService");
    expect(business.priceRange).toBe("$750–$2,500");
    const priced = business.makesOffer.filter((o: { price?: string }) => o.price);
    expect(priced.map((o: { name: string; price: string }) => [o.name, o.price])).toEqual(
      APPROVED_PACKAGES.map((pk) => [`${pk.tier} — ${pk.label}`, pk.price.replace(/[$,]/g, "")]),
    );
  });

  test("no Content Security Policy violations or script errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(String(e)));
    page.on("console", (m) => {
      const text = m.text();
      if (/Content Security Policy|Refused to/.test(text) && !/vercel-insights|speed-insights/.test(text)) problems.push(text);
    });
    for (const path of ROUTES) await page.goto(path, { waitUntil: "networkidle" });
    expect(problems).toEqual([]);
  });

  test("every internal link resolves", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const path of ROUTES) {
      await page.goto(path);
      const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!));
      hrefs.forEach((h) => seen.add(h.split("#")[0] || "/"));
    }
    for (const href of seen) {
      const res = await request.get(href, { maxRedirects: 0 });
      expect(res.status(), href).toBe(200);
    }
  });

  test("API routes answer GET with 405 and Allow: POST", async ({ request }) => {
    for (const path of [
      "/api/contact",
      "/api/portal",
      "/api/stripe-webhook",
      "/api/proposal-accept",
      "/api/proposal-checkout",
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(405);
      expect(res.headers()["allow"], path).toContain("POST");
    }
    // proposals supports GET (templates / public id) as well as mutations
    const proposalsGet = await request.get("/api/proposals?action=templates");
    expect(proposalsGet.status()).toBe(200);
    expect((await proposalsGet.json()).ok).toBe(true);
  });

  test("security headers on pages and apex redirect to www", async ({ request }) => {
    const res = await request.get("/services");
    for (const h of ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]) {
      expect(res.headers()[h], h).toBeTruthy();
    }
    const apex = await request.get("/work?x=1", { headers: { Host: "forge-ct.com" }, maxRedirects: 0 });
    expect(apex.status()).toBe(308);
    expect(apex.headers()["location"]).toBe("https://www.forge-ct.com/work");
  });

  test("retired Hard Hittin case study still redirects to /work", async ({ request }) => {
    const res = await request.get("/work/hard-hittin", { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toBe("/work");
  });

  test("unknown routes return 404", async ({ request }) => {
    expect((await request.get("/not-a-page")).status()).toBe(404);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/services");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test("phone rail cards are equal in size and aligned on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/connecticut-web-design"]) {
    await page.goto(path);
    const boxes = await page.locator("ul.rail .phone-frame").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      }),
    );
    expect(boxes.length, path).toBeGreaterThan(1);
    for (const b of boxes) expect(b, path).toEqual(boxes[0]);
  }
});
