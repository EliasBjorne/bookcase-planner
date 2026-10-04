import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Fresh setup per test: clear the persisted choice.
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("wizard is the landing page with the audited default total", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("wizard")).toBeVisible();
  await expect(page.getByTestId("wizard-total")).toContainText(/16.?751/);
  await page.screenshot({ path: "docs/screenshots/wizard-step0.png" });
});

test("choices update the live total and preview", async ({ page }) => {
  await page.goto("/#/bygg/0");
  await page.getByTestId("opt-3200").click();
  await expect(page.getByTestId("wizard-total")).toContainText(/15.?956/); // audited 320-total
  await page.goto("/#/bygg/2");
  await page.getByTestId("opt-bbb").click();
  await expect(page.getByTestId("wizard-total")).toContainText(/20.?466/); // 15956 - billy(4300) + bbb(8240+570)
});

test("low bench disables STENSUND and auto-switches the front", async ({ page }) => {
  await page.goto("/#/bygg/1");
  await page.getByTestId("opt-low").click();
  await page.goto("/#/bygg/3");
  await expect(page.getByTestId("opt-stensund")).toBeDisabled();
  await expect(page.getByTestId("opt-veddinge")).toHaveClass(/active/);
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
  await expect(page.locator("tfoot")).toContainText(/16.?751/);
  await expect(page.getByTestId("share-link")).toBeVisible();
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
