import { expect, test } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL || "https://www.paypertap.in";

const appRoutes = [
  "/",
  "/auth",
  "/login",
  "/onboarding/store",
  "/onboarding/product",
  "/dashboard",
  "/test-store",
  "/test-store/product/test-product",
  "/test-store/checkout/test-product",
  "/test-store/booking-success/test-checkout",
];

test.use({ channel: "chrome" });

for (const route of appRoutes) {
  test(`direct load renders app route: ${route}`, async ({ page }) => {
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);

    const bodyText = await page.locator("body").innerText();

    expect(response?.status(), `${route} HTTP status`).toBeLessThan(400);
    expect(bodyText, `${route} should not show Vercel 404`).not.toContain(
      "404: NOT_FOUND",
    );
    expect(pageErrors, `${route} uncaught page errors`).toEqual([]);
  });
}

test("production integration test page is not exposed", async ({ page }) => {
  const response = await page.goto(`${baseUrl}/integration-test`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("load");

  const bodyText = await page.locator("body").innerText();

  expect(response?.status(), "/integration-test HTTP status").toBeLessThan(400);
  expect(bodyText).not.toContain("PayPerTap Integration Test");
});

const apiRoutes = ["/api/send-event-email", "/api/upload-image"];

for (const route of apiRoutes) {
  test(`GET is handled by API route: ${route}`, async ({ request }) => {
    const response = await request.get(`${baseUrl}${route}`);

    expect(response.status(), `${route} should exist and reject GET`).toBe(405);
  });
}

test("test email endpoint is disabled in production", async ({ request }) => {
  const response = await request.get(`${baseUrl}/api/test-email`);

  expect(response.status()).toBe(404);
});
