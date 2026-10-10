import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/work",
  "/work/thousand-sunny",
  "/work/hard-hittin",
  "/work/harris-in-wonderland",
  "/work/m-and-j-video-games",
  "/work/infinite-heroes",
  "/services",
  "/care",
  "/audit",
  "/book",
  "/contact",
  "/why",
  "/hartford-web-design",
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
    await form.getByRole("button", { name: /Get my Forge-CT Audit/ }).click();
    expect(bodies).toHaveLength(0);
    await form.getByLabel("Your website URL").fill("example.com");
    await form.getByRole("button", { name: /Get my Forge-CT Audit/ }).click();
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
    await expect(sample).toContainText("not a real business, client project, or Forge-CT Audit");
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
    await expect(finalCta.getByRole("link", { name: /Get your Forge-CT Audit/ })).toHaveAttribute("href", "/audit");
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
    await expect(faq).toContainText("FORGE-built websites");
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
  test("ledger lists the five live clients, filters 4 + 1, and keeps the lab apart", async ({ page }) => {
    await page.goto("/work");
    const rows = page.locator("table.ledger tbody tr");
    await expect(rows).toHaveCount(5);
    await expect(page.getByRole("button", { name: /^All/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Card and tabletop/ }).click();
    await expect(page.locator("table.ledger tbody tr:visible")).toHaveCount(4);
    await page.getByRole("button", { name: /Retail and local/ }).click();
    await expect(page.locator("table.ledger tbody tr:visible")).toHaveCount(1);
    await expect(page.locator("table.ledger tbody tr:visible")).toContainText("Harris in Wonderland");
    await expect(page.locator("table.ledger")).not.toContainText("Voidcaller");
    await expect(page.locator(".lab")).toContainText("not client work");
  });

  test("only approved live client URLs are linked as live sites", async ({ page }) => {
    const approved = new Set([
      "https://www.thousandsunnytcg.com/",
      "https://mjvideogames.com/",
      "https://hardhittincardshop.com/",
      "https://infiniteheroes.net/",
      "https://harrisinwonderland.com/",
      "https://voidcaller.enterthegrotto.xyz/",
    ]);
    for (const path of ROUTES) {
      await page.goto(path);
      const external = await page.$$eval("main a[href^='http']", (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const href of external) {
        if (/^https:\/\/(buy|billing)\.stripe\.com\//.test(href)) continue;
        expect(approved.has(href), `${path} links unapproved ${href}`).toBe(true);
      }
    }
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

  test("rate sheet shows all three packages and fits a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const sheet = page.locator("#pricing table.sheet");
    for (const price of ["$750", "$1,500", "$2,500"]) await expect(sheet).toContainText(price);
    await expect(sheet.locator("tbody tr").filter({ hasText: "Hosting setup" }).locator("td")).toHaveCount(3);
    await expect(sheet).toContainText("Extra-fast delivery");
    const fits = await sheet.evaluate((t) => t.getBoundingClientRect().right <= document.documentElement.clientWidth);
    expect(fits).toBe(true);
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

test.describe("ambient starfield", () => {
  test("is decorative, behind the content, and never intercepts input", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas.starfield");
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    await expect(canvas).toHaveAttribute("data-mode", "animated");
    expect(await canvas.evaluate((c) => getComputedStyle(c).pointerEvents)).toBe("none");
    const cta = page.locator(".hero .btn").first();
    const hit = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    });
    expect(hit).toBe(true);
    await cta.click();
    await expect(page).toHaveURL(/\/audit$/);
  });

  test("renders one static frame when reduced motion is requested", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const canvas = page.locator("canvas.starfield");
    await expect(canvas).toHaveAttribute("data-mode", "static");
    const snapshot = () =>
      canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL().length + ":" + c.toDataURL().slice(-64));
    const first = await snapshot();
    await page.mouse.move(400, 300);
    await page.waitForTimeout(600);
    expect(await snapshot()).toBe(first);
    await context.close();
  });

  test("keeps the canvas light on phones", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto("/");
    const width = await page.locator("canvas.starfield").evaluate((c: HTMLCanvasElement) => c.width);
    expect(width).toBeLessThanOrEqual(Math.round(390 * 1.25));
    await context.close();
  });
});
