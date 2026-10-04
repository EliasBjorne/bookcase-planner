import { describe, expect, it } from "vitest";
import { DESIGNS } from "../designs/variants";
import { partsList } from "./cost";
import { bestCombo, planWidth, widthSweep, BASE_WIDTHS, BILLY_WIDTHS, BOHUS_WIDTHS } from "./widths";

/** Hand-audited totals (NOK), computed independently of the code:
 *  Base  = frames 3×499+455+429 (2381) + doors 7×300+460 (2560)
 *        + legs 10 packs × 75 (750) + EKBACKEN 4 m × 995 (3980)
 *        + hinges 8 pk × 195 (1560) + knobs 4 pk × 90 (360)
 *        + UTRUSTA-hyller 3×190+155+135 (860)                  = 12451
 *  V1 = 12451 + 4×1899                    = 20047
 *  V2 = 12451 + 10×545 + 5×495            = 20376
 *  V3 = 12451 + 4×895 + 4×180             = 16751
 *  V4 = 12451 + 8×545 + 2×335             = 17481
 *  V5 = 12451 + 6×1050 + 4×1260 + 5×1150  = 29541
 *  V8 = 12451 + 8×1030 + 2×285            = 21261
 *  Low bench: 1820 frames + 1840 doors + 600 legs + 3980 top
 *  + 1560 hinges + 360 knobs = 10160 → V6 +4300 = 14460, V7 +7596 = 17756. */
/** V3 widths, same arithmetic (frames/doors/legs/top/hardware + BILLY units).
 *  Hardware per base = hinge packs (doors×195) + knob packs (ceil(doors/2)×90)
 *  + one UTRUSTA shelf per frame:
 *  300 (7 doors, 3×80+60): 7797 + 1365+360+725 (2450) + 4020 = 14267
 *  320 (8 doors, 4×80):    8976 + 1560+360+760 (2680) + 4300 = 15956
 *  340 (8 doors):         12451                       + 4300 = 16751
 *  360 (9 doors, 4×80+40): 9855 + 1755+450+895 (3100) + 5095 = 18050
 *  Unverified share is now only the worktop (3980; 2985 at 300 cm) after
 *  STENSUND/VEDDINGE page-verification; V4 adds 2×335 unverified 20-frames. */
const EXPECTED: Record<string, { total: number; unverified: number }> = {
  "v1-bohus": { total: 20047, unverified: 3980 },
  "v2-besta": { total: 20376, unverified: 3980 },
  "v3-billy-300": { total: 14267, unverified: 2985 },
  "v3-billy-320": { total: 15956, unverified: 3980 },
  "v3-billy": { total: 16751, unverified: 3980 },
  "v3-billy-360": { total: 18050, unverified: 3980 },
  "v4-metod": { total: 17481, unverified: 4650 },
  "v5-string": { total: 29541, unverified: 3980 },
  "v6-lavbenk-billy": { total: 14460, unverified: 3980 },
  "v7-lavbenk-bohus": { total: 17756, unverified: 3980 },
  // V8 = base 12451 + 8× BBB SR2-83 (8240) + 2 endesider (570) = 21261
  "v8-bbb": { total: 21261, unverified: 3980 },
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
