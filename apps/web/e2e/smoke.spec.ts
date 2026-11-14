import { expect, test } from "@playwright/test";

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

test("theme tokens follow the system color scheme", async ({ page }) => {
  const backgroundFor = async (colorScheme: "light" | "dark") => {
    await page.emulateMedia({ colorScheme });
    return page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
  };

  await page.goto("/");
  const light = await backgroundFor("light");
  const dark = await backgroundFor("dark");

  expect(light).not.toBe("rgba(0, 0, 0, 0)");
  expect(dark).not.toBe(light);
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
