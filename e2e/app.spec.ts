import { expect, test } from "@playwright/test";

const DESIGNS = ["v1-bohus", "v2-besta", "v3-billy", "v4-metod", "v5-string"];

for (const id of DESIGNS) {
  test(`${id}: 3D view renders`, async ({ page }) => {
    await page.goto(`/#/${id}/3d`);
    await expect(page.getByTestId("three-container")).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();
    // Let the first frames render before the screenshot.
    await page.waitForTimeout(900);
    await page.screenshot({ path: `docs/screenshots/${id}-3d.png` });
  });

  test(`${id}: elevations render with dimensions`, async ({ page }) => {
    await page.goto(`/#/${id}/tegning`);
    await expect(page.getByTestId("front-elevation").locator("svg")).toBeVisible();
    await expect(page.getByTestId("side-elevation").locator("svg")).toBeVisible();
    await expect(page.getByTestId("front-elevation")).toContainText("3602 mm fri vegg");
    await expect(page.getByTestId("front-elevation")).toContainText("2380 til nedhakk");
    await page.screenshot({ path: `docs/screenshots/${id}-tegning.png`, fullPage: true });
  });

  test(`${id}: parts list has IKEA lines and a total`, async ({ page }) => {
    await page.goto(`/#/${id}/deler`);
    await expect(page.locator("table").first()).toContainText("IKEA");
    await expect(page.locator("tfoot")).toContainText("kr");
    await page.screenshot({ path: `docs/screenshots/${id}-deler.png`, fullPage: true });
  });

  test(`${id}: presentational render draws`, async ({ page }) => {
    await page.goto(`/#/${id}/render`);
    await expect(page.getByTestId("render-svg")).toBeVisible();
    await page.screenshot({ path: `docs/screenshots/${id}-render.png`, fullPage: true });
  });

  test(`${id}: handoff exports exist`, async ({ page }) => {
    await page.goto(`/#/${id}/handoff`);
    await expect(page.locator("#shopping-text")).toContainText("HANDLELISTE");
    await expect(page.locator("pre").nth(1)).toContainText("GJENSKAP");
  });
}

test("comparison shows all five variants", async ({ page }) => {
  await page.goto(`/#/v1-bohus/sammenlikn`);
  const table = page.locator("table.compare");
  await expect(table).toBeVisible();
  for (const id of ["V1", "V2", "V3", "V4", "V5"]) {
    await expect(table).toContainText(id);
  }
  await page.screenshot({ path: "docs/screenshots/sammenlikn.png", fullPage: true });
});

test("width explorer lists 7 widths with exact-fit notes", async ({ page }) => {
  await page.goto(`/#/v3-billy/bredder`);
  const table = page.getByTestId("widths-table");
  await expect(table).toBeVisible();
  await expect(table.locator("tbody tr")).toHaveCount(7);
  await expect(table).toContainText("360 cm");
  await expect(table).toContainText("eksakt ✓");
  await page.screenshot({ path: "docs/screenshots/bredder.png", fullPage: true });
});

test("no hard validation errors in any variant", async ({ page }) => {
  for (const id of DESIGNS) {
    await page.goto(`/#/${id}/deler`);
    await expect(page.locator("#violations .viol.error")).toHaveCount(0);
  }
});
