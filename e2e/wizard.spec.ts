import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Fresh setup per test: clear the persisted choice.
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("wizard is the landing page with the family-default total", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("wizard")).toBeVisible();
  await expect(page.getByTestId("wizard-total")).toContainText(/12.?716/); // audited family default
  await page.screenshot({ path: "docs/screenshots/wizard-step0.png" });
});

test("choices update the live total and preview", async ({ page }) => {
  await page.goto("/#/bygg/0");
  await page.getByTestId("opt-3400").click();
  await expect(page.getByTestId("wizard-total")).toContainText(/13.?556/); // 340-base w/ BODBYN+HAMPHULT+snekkerplate
  await page.goto("/#/bygg/2");
  await page.getByTestId("opt-bbb").click();
  await expect(page.getByTestId("wizard-total")).toContainText(/18.?066/); // 13556 - billy(4300) + bbb(8810)
});

test("front step shows the whole METOD range and changes the drawn door", async ({ page }) => {
  await page.goto("/#/bygg/3");
  // At least 15 series + Noremax, each with a door thumbnail.
  expect(await page.locator(".opt-card").count()).toBeGreaterThan(15);
  expect(await page.locator(".door-thumb").count()).toBeGreaterThan(15);
  // Default BODBYN renders bevel doors in the preview...
  await expect(page.getByTestId("wizard-preview").locator('[data-door-style="bevel"]').first()).toBeVisible();
  // ...switching to STENSUND redraws them as shaker...
  await page.getByTestId("opt-stensund-hvit").click();
  await expect(page.getByTestId("wizard-preview").locator('[data-door-style="shaker"]').first()).toBeVisible();
  await expect(page.getByTestId("wizard-total")).toContainText(/11.?996/); // 12716 − 3120 + 2400
  // ...and a foil front keeps its factory colour in the preview markup.
  await page.getByTestId("opt-nickebo-antrasitt").click();
  await expect(page.getByTestId("wizard-preview").locator('[data-door-style="flat"]').first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/wizard-fronts.png", fullPage: true });
});

test("knob step: many real options, photo under the illustration, price reacts", async ({ page }) => {
  await page.goto("/#/bygg/5");
  expect(await page.locator(".opt-card").count()).toBeGreaterThan(8);
  expect(await page.locator(".opt-card img.opt-photo").count()).toBeGreaterThan(7);
  await expect(page.getByTestId("real-photo").locator("img")).toBeVisible();
  await page.getByTestId("opt-gubbarp-hvit").click();
  await expect(page.getByTestId("wizard-total")).toContainText(/12.?376/); // 12716 − 380 + 40
  await page.screenshot({ path: "docs/screenshots/wizard-knobs.png", fullPage: true });
});

test("front step shows the real product photo of the selected door", async ({ page }) => {
  await page.goto("/#/bygg/3");
  await expect(page.getByTestId("real-photo").locator("img")).toBeVisible();
  await expect(page.getByTestId("real-photo")).toContainText("BODBYN offwhite"); // family default
  await page.getByTestId("opt-lerhyttan-lysgra").click();
  await expect(page.getByTestId("real-photo")).toContainText("LERHYTTAN lys grå");
});

test("lighting choice shows glow in the illustration and the MITTLED photo", async ({ page }) => {
  await page.goto("/#/bygg/7");
  await page.getByTestId("opt-spots6").click();
  await expect(page.getByTestId("wizard-preview").locator('[data-testid="spot-glow"]')).toBeVisible();
  await expect(page.getByTestId("real-photo")).toContainText("MITTLED");
  await page.screenshot({ path: "docs/screenshots/wizard-lighting.png", fullPage: true });
});

test("CORRECTED: shaker stays available on the low bench", async ({ page }) => {
  await page.goto("/#/bygg/1");
  await page.getByTestId("opt-low").click();
  await page.goto("/#/bygg/3");
  await expect(page.getByTestId("opt-stensund-hvit")).toBeEnabled();
  await page.getByTestId("opt-stensund-hvit").click();
  // Low base 1820 + STENSUND 40×40 2080 + legs 600 + hinges 1560 + HAMPHULT 380
  // + snekkerplate 0 + BILLY 4300 = 10 740.
  await expect(page.getByTestId("wizard-total")).toContainText(/10.?740/);
});

test("full walkthrough reaches result with tabs, parts and share link", async ({ page }) => {
  await page.goto("/#/bygg/0");
  for (let i = 0; i < 7; i++) {
    await page.getByTestId("next").click();
  }
  await page.getByTestId("finish").click();
  await expect(page).toHaveURL(/#\/din\/render/);
  // share-link exists only on the result page (the wizard preview also
  // contains a render-svg, so that testid alone can't prove navigation).
  await expect(page.getByTestId("share-link")).toBeVisible();
  await expect(page.getByTestId("render-svg")).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/din-result.png", fullPage: true });

  await page.getByTestId("view-deler").click();
  await expect(page.locator("tfoot")).toContainText(/12.?716/);
  await expect(page.getByTestId("share-link")).toBeVisible();
});

test("photo view mounts and accumulates samples (or falls back gracefully)", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/#/v3-billy/foto");
  await expect(page.locator("[data-testid=photo-canvas] canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("photo-status")).toContainText(/lysberegning|Forenklet/, { timeout: 30_000 });
});

test("share token restores the exact setup in a fresh session", async ({ page }) => {
  // Token: width=3600(3), bench=high(0), uppers=bbb(2), front=noremax(2),
  // color=dark(2), knobs=beslag-uno(1), top=mdf-painted(1), lighting=spots6(1).
  await page.goto("/#/din/deler?s=30222111");
  await expect(page.locator("h2").first()).toContainText("Din løsning");
  // Independent arithmetic: 360-base(9855+3100 hw) − top(3980) + Noremax doors
  // (9×1820 = 16380 vs STENSUND 2700 → +13680) + knob swap (−450 + 9×185 → +1215)
  // + BBB (8×1030+570 = 8810) + lighting (1580) = 34 260.
  await expect(page.locator("tfoot")).toContainText("kr");
  const text = await page.locator("tfoot").innerText();
  expect(text.replace(/[\s  ]/g, "")).toContain("34260");
});
