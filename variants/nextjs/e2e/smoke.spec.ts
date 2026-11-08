import { expect, test } from "@playwright/test";

test("start page renders from the production server", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "supastarter core" })).toBeVisible();
  await expect(page.getByTestId("node-env")).toHaveText("production");
  expect(errors).toEqual([]);
});

test("health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    status: "ok",
    framework: "nextjs",
    nodeEnv: "production",
  });
});

test("unknown routes return 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist");

  expect(response?.status()).toBe(404);
});
