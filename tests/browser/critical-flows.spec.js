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

    await page.getByLabel("Name").fill("  Test Shop  ");
    await page.getByLabel("Email").fill("owner@example.com");
    await page.getByLabel("Company").fill("Test Shop");
    await page
      .getByLabel("What’s your shop?")
      .fill("A local shop looking for clearer hours.");
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

  test("deposit checkout posts the selected Care plan and email", async ({
    page,
  }) => {
    let request;
    await page.route("**/api/checkout", async (route) => {
      request = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          url: "https://checkout.stripe.test/session",
        }),
      });
    });
    await page.goto("/pay");

    await page.getByLabel("Care plan after launch").selectOption("care-plus");
    await page
      .getByLabel("Email for your Stripe receipt")
      .fill("owner@example.com");
    await page.getByRole("button", { name: "Pay the $1,000 deposit" }).click();

    await expect
      .poll(() => request)
      .toEqual({
        plan: "site-deposit",
        email: "owner@example.com",
        care_plan: "care-plus",
      });
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
