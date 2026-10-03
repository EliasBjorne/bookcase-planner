import { describe, expect, it } from "vitest";
import { DESIGNS } from "../designs/variants";
import { partsList } from "./cost";
import { bestCombo, planWidth, widthSweep, BASE_WIDTHS, BILLY_WIDTHS, BOHUS_WIDTHS } from "./widths";

/** Hand-audited totals (NOK), computed independently of the code:
 *  Base  = frames 3×499+455+429 (2381) + doors 7×300+460 (2560)
 *        + legs 10 packs × 75 (750) + EKBACKEN 4 m × 995 (3980) = 9671
 *  V1 = 9671 + 4×1899                    = 17267
 *  V2 = 9671 + 10×545 + 5×495           = 17596
 *  V3 = 9671 + 4×895 + 4×180            = 13971
 *  V4 = 9671 + 8×545 + 2×335            = 14701
 *  V5 = 9671 + 6×1050 + 4×1260 + 5×1150 = 26761
 *  Unverified share: doors 2560 + top 3980 = 6540 (V4 also 2×335 → 7210) */
/** Low bench (V6/V7): frames 4×455 (1820) + VEDDINGE doors 8×230 (1840)
 *  + legs 8 packs × 75 (600) + EKBACKEN 4 m (3980) = 8240.
 *  V6 = 8240 + 4×(895+180) = 12540; V7 = 8240 + 4×1899 = 15836.
 *  Unverified: doors 1840 + top 3980 = 5820. */
/** V3 widths, same arithmetic per width (frames/doors/legs/top + BILLY units):
 *  300: 1952+2260+600+2985 (base 7797) + 3×1075+795 (4020) = 11817
 *  320: 1996+2400+600+3980 (base 8976) + 4×1075 (4300)     = 13276
 *  360: 2425+2700+750+3980 (base 9855) + 4×1075+795 (5095) = 14950 */
const EXPECTED: Record<string, { total: number; unverified: number }> = {
  "v1-bohus": { total: 17267, unverified: 6540 },
  "v2-besta": { total: 17596, unverified: 6540 },
  "v3-billy-300": { total: 11817, unverified: 5245 },
  "v3-billy-320": { total: 13276, unverified: 6380 },
  "v3-billy": { total: 13971, unverified: 6540 },
  "v3-billy-360": { total: 14950, unverified: 6680 },
  "v4-metod": { total: 14701, unverified: 7210 },
  "v5-string": { total: 26761, unverified: 6540 },
  "v6-lavbenk-billy": { total: 12540, unverified: 5820 },
  "v7-lavbenk-bohus": { total: 15836, unverified: 5820 },
};

describe("cost audit (hand-computed expectations)", () => {
  for (const d of DESIGNS) {
    it(`${d.id} totals match manual arithmetic`, () => {
      const s = partsList(d);
      expect(s.totalNok).toBe(EXPECTED[d.id].total);
      expect(s.unverifiedNok).toBe(EXPECTED[d.id].unverified);
    });
  }
});

describe("width solver", () => {
  it("hits 3600 exactly with 4×80+40 (both METOD and BILLY)", () => {
    expect(bestCombo(3600, BASE_WIDTHS).widths).toEqual([800, 800, 800, 800, 400]);
    expect(bestCombo(3600, BASE_WIDTHS).fillerMm).toBe(0);
    expect(bestCombo(3600, BILLY_WIDTHS).fillerMm).toBe(0);
  });

  it("reproduces the V-design base at 3400: 3×80+60+40, no filler", () => {
    expect(bestCombo(3400, BASE_WIDTHS).widths).toEqual([800, 800, 800, 600, 400]);
  });

  it("hits 3000 exactly with 3×80+60", () => {
    const c = bestCombo(3000, BASE_WIDTHS);
    expect(c.widths).toEqual([800, 800, 800, 600]);
    expect(c.fillerMm).toBe(0);
  });

  it("flags Bohus as awkward at 3000 (630 mm filler)", () => {
    expect(bestCombo(3000, BOHUS_WIDTHS).fillerMm).toBe(630);
    expect(planWidth(3000).notes.join(" ")).toContain("790-modulen passer dårlig");
  });

  it("cross-checks against the V-designs at 3400 (independent code paths)", () => {
    const p = planWidth(3400);
    expect(p.totalBilly).toBe(EXPECTED["v3-billy"].total);
    expect(p.totalBohus).toBe(EXPECTED["v1-bohus"].total);
  });

  it("every V3 width design matches the width solver's total", () => {
    for (const d of DESIGNS.filter((x) => x.id.startsWith("v3-billy"))) {
      const p = planWidth(d.targetWidthMm);
      expect(partsList(d).totalNok, d.id).toBe(p.totalBilly);
    }
  });

  it("sweep covers 3.0–3.6 m in 7 steps, filler always < one module", () => {
    const plans = widthSweep(3000, 3600, 100);
    expect(plans).toHaveLength(7);
    for (const p of plans) {
      expect(p.base.fillerMm).toBeLessThan(400);
      expect(p.base.sumMm + p.base.fillerMm).toBe(p.targetMm);
      expect(p.billy.sumMm + p.billy.fillerMm).toBe(p.targetMm);
      expect(p.bohus.sumMm + p.bohus.fillerMm).toBe(p.targetMm);
    }
  });
});
