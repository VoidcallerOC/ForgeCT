import { test, expect } from "@playwright/test";

const CONTACT_RESPONSE = { ok: true };

async function mockContact(page) {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CONTACT_RESPONSE),
    });
  });
}

test.describe("business-critical flows", () => {
  test("contact form submits a normalized inquiry", async ({ page }) => {
    await mockContact(page);
    await page.goto("/contact");

    await page.getByLabel("Name").fill("  Test Business  ");
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Company").fill("Test Business");
    await page
      .getByLabel("What’s your business?")
      .fill("A local service business looking for clearer information.");
    await page.getByRole("button", { name: /Send inquiry/ }).click();

    await expect(page.locator("[data-form-status]")).toHaveText(
      /Received.*three practical fixes/i,
    );
  });

  test("Care and Care+ CTAs point to their configured Stripe links", async ({
    page,
  }) => {
    await page.goto("/pay");

    await expect(
      page.getByRole("link", { name: "Start Care — $35/month" }),
    ).toHaveAttribute("href", /^https:\/\/buy\.stripe\.com\//);
    await expect(
      page.getByRole("link", { name: "Start Care+ — $79/month" }),
    ).toHaveAttribute("href", /^https:\/\/buy\.stripe\.com\//);
    await expect(page.locator('[data-payment-when="care:unset"]')).toBeHidden();
    await expect(page.locator('[data-payment-when="care:set"]')).toBeVisible();
  });

  test("Care welcomes local businesses across multiple industries", async ({
    page,
  }) => {
    await page.goto("/care");
    const audienceFaq = page
      .locator(".faq-grid details")
      .filter({ hasText: "Who is this for?" });

    await expect(audienceFaq).toContainText(
      "local retail, restaurants, and service businesses",
    );
    await expect(audienceFaq).toContainText("FORGE-built websites");
    await expect(page.locator("main")).not.toContainText(
      "card or tabletop shop",
    );
    await expect(page.locator("main")).toContainText(
      "Tell me about your business",
    );
  });

  test("canonical website packages and add-ons are visible and the package picker works on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const cards = page.locator("#pricing .price-card");
    await expect(cards).toHaveCount(3);
    await expect(page.locator("#pricing")).toContainText("$750");
    await expect(page.locator("#pricing")).toContainText("$1,500");
    await expect(page.locator("#pricing")).toContainText("$2,500");
    await expect(page.locator("#pricing")).toContainText("Hosting setup");
    await expect(
      page.locator("#pricing .price-card").filter({ hasText: "Hosting setup" }),
    ).toHaveCount(3);
    await expect(page.locator("#pricing")).toContainText("Extra-fast delivery");

    await expect(page.locator("[data-package-price]")).toHaveText("$750");
    await expect(page.locator("[data-package-name]")).toHaveText(
      "Basic — Starter Website",
    );
    await page.getByRole("tab", { name: "Standard", exact: true }).click();
    await expect(page.locator("[data-package-price]")).toHaveText("$1,500");
    await expect(page.locator("[data-package-name]")).toHaveText(
      "Standard — Business Website",
    );
    await page.getByRole("tab", { name: "Premium", exact: true }).click();
    await expect(page.locator("[data-package-price]")).toHaveText("$2,500");
    await expect(page.locator("[data-package-name]")).toHaveText(
      "Premium — Forge Website",
    );

    const pricingFits = await page
      .locator("#pricing")
      .evaluate(
        (section) =>
          section.scrollWidth <= document.documentElement.clientWidth,
      );
    expect(pricingFits).toBe(true);

    const cardContentDoesNotOverlap = async () =>
      cards.evaluateAll((priceCards) =>
        priceCards.every((card) => {
          const boxes = [...card.children]
            .map((child) => child.getBoundingClientRect())
            .filter((box) => box.width > 0 && box.height > 0);
          return boxes.every((box, index) =>
            boxes.slice(index + 1).every((next) => box.bottom <= next.top + 1),
          );
        }),
      );
    expect(await cardContentDoesNotOverlap()).toBe(true);

    await page.setViewportSize({ width: 514, height: 844 });
    expect(await cardContentDoesNotOverlap()).toBe(true);
    const narrowPricingFits = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(narrowPricingFits).toBe(true);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await cardContentDoesNotOverlap()).toBe(true);
    const desktopPricingFits = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(desktopPricingFits).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/services");
    const serviceCopy = page.locator("main");
    const packageCompareCards = page.locator(
      ".compare-grid--packages .compare-col",
    );
    await expect(packageCompareCards).toHaveCount(3);
    const packageCardsAreCenteredAndInset = async () =>
      packageCompareCards.evaluateAll((packageCards) =>
        packageCards.every((card) => {
          const cardRect = card.getBoundingClientRect();
          const padding = Number.parseFloat(getComputedStyle(card).paddingLeft);
          const content = card.querySelectorAll(
            ".compare-kicker, h3, li, .form-note",
          );
          return (
            getComputedStyle(card).textAlign === "center" &&
            padding >= 16 &&
            [...content].every((element) => {
              const rect = element.getBoundingClientRect();
              return rect.left > cardRect.left && rect.right < cardRect.right;
            })
          );
        }),
      );
    expect(await packageCardsAreCenteredAndInset()).toBe(true);
    await expect(serviceCopy).toContainText("Basic: +$250 for 1-day delivery");
    await expect(serviceCopy).toContainText(
      "Standard: +$500 for 3-day delivery",
    );
    await expect(serviceCopy).toContainText(
      "Premium: +$750 for 5-day delivery",
    );
    await expect(serviceCopy).toContainText("+$150 · +1 day");
    await expect(serviceCopy).toContainText("+$100 · +1 day");
    await expect(serviceCopy).toContainText("+$750 · +5 days");
    await expect(serviceCopy).toContainText("+$250 · +2 days");
    await expect(serviceCopy).toContainText(
      "E-commerce is a paid add-on, not part of the base package.",
    );
    await expect(serviceCopy).toContainText("Need something more complex?");

    const addonCards = page.locator(
      ".compare-grid:not(.compare-grid--packages) .compare-col",
    );
    const customScope = page.locator(".payment-cta");
    const serviceLayoutFits = async () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      );
    const cardsAreCenteredAndNonOverlapping = async () =>
      addonCards.evaluateAll((cards) =>
        cards.every((card) => {
          const cardRect = card.getBoundingClientRect();
          const content = card.querySelectorAll(".compare-kicker, h3, li");
          const boxes = [...card.children]
            .map((child) => child.getBoundingClientRect())
            .filter((box) => box.width > 0 && box.height > 0);
          return (
            getComputedStyle(card).textAlign === "center" &&
            boxes.every((box, index) =>
              boxes
                .slice(index + 1)
                .every((next) => box.bottom <= next.top + 1),
            ) &&
            [...content].every((element) => {
              const rect = element.getBoundingClientRect();
              return rect.left > cardRect.left && rect.right < cardRect.right;
            })
          );
        }),
      );
    const customScopeChildrenFit = async () =>
      customScope.evaluate((panel) => {
        const panelRect = panel.getBoundingClientRect();
        return [...panel.children].every((child) => {
          const rect = child.getBoundingClientRect();
          return rect.left >= panelRect.left && rect.right <= panelRect.right;
        });
      });

    await expect(addonCards).toHaveCount(4);
    expect(await cardsAreCenteredAndNonOverlapping()).toBe(true);
    expect(await customScopeChildrenFit()).toBe(true);
    expect(await serviceLayoutFits()).toBe(true);

    await page.setViewportSize({ width: 990, height: 900 });
    expect(await packageCardsAreCenteredAndInset()).toBe(true);
    expect(await cardsAreCenteredAndNonOverlapping()).toBe(true);
    expect(await customScopeChildrenFit()).toBe(true);
    expect(await serviceLayoutFits()).toBe(true);
  });

  test("receipt-bound portal button posts the receipt session id", async ({
    page,
  }) => {
    let request;
    await page.route("**/api/portal", async (route) => {
      request = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          url: "https://billing.stripe.test/session",
        }),
      });
    });
    await page.goto("/thanks?session_id=cs_test_receipt");

    const portal = page.getByRole("button", { name: /billing|card|cancel/i });
    await expect(portal).toBeVisible();
    await portal.click();

    await expect.poll(() => request).toEqual({ session_id: "cs_test_receipt" });
  });
});
