import { expect, type Page, test } from "@playwright/test";

const background = (page: Page) =>
  page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);

test("home page renders data from the API", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "supastarter" })).toBeVisible();
  await expect(page.getByText("Hello, supastarter!")).toBeVisible();
  expect(errors).toEqual([]);
});

test("color mode defaults to system and follows the system color scheme", async ({ page }) => {
  const html = page.locator("html");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "System" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(html).toContainClass("light");
  const light = await background(page);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(html).toContainClass("dark");
  const dark = await background(page);

  expect(light).not.toBe("rgba(0, 0, 0, 0)");
  expect(dark).not.toBe(light);
});

test("a chosen color mode overrides the system and survives a reload", async ({ page }) => {
  const html = page.locator("html");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(html).toContainClass("light");
  const light = await background(page);

  await page.getByRole("button", { name: "Dark" }).click();
  await expect(html).toContainClass("dark");
  expect(await background(page)).not.toBe(light);

  await page.reload();
  await expect(html).toContainClass("dark");
  await expect(page.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "System" }).click();
  await expect(html).toContainClass("light");
  expect(await background(page)).toBe(light);
});

test("API serves procedures over HTTP", async ({ request }) => {
  const response = await request.post("/api/rpc/greeting", {
    data: { json: { name: "Ada" } },
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ json: { message: "Hello, Ada!" } });
});

test("API rejects invalid input", async ({ request }) => {
  const response = await request.post("/api/rpc/greeting", { data: { json: { name: "" } } });

  expect(response.status()).toBe(400);
});

test("unknown routes return 404", async ({ page, request }) => {
  expect((await page.goto("/does-not-exist"))?.status()).toBe(404);
  expect((await request.post("/api/rpc/does-not-exist")).status()).toBe(404);
});
