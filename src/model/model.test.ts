import { describe, expect, it } from "vitest";
import { DESIGNS } from "../designs/variants";
import { ROOM, TARGET_WIDTH, UPPER_Y, metodBase } from "../designs/common";
import { validate } from "./validate";
import { partsList } from "./cost";
import { getItem, priceFor } from "./catalogue";

describe("catalogue", () => {
  it("knows the METOD wall frame trick parts", () => {
    expect(getItem("metod-wall-80x37x60").priceNok).toBe(499);
    expect(getItem("metod-wall-80x37x60").heightMm).toBe(600);
  });

  it("rounds pack quantities up", () => {
    // 20 legs in 2-packs -> 10 packs
    expect(priceFor("metod-leg-8cm-2pk", 20)).toEqual({ packs: 10, priceNok: 750 });
    expect(priceFor("metod-leg-8cm-2pk", 19).packs).toBe(10);
  });
});

describe("METOD base", () => {
  it("sums exactly to the 3400 mm target", () => {
    const run = metodBase().modules.filter((m) => m.kind === "cabinet");
    expect(run.reduce((s, m) => s + m.w, 0)).toBe(TARGET_WIDTH);
  });

  it("puts the worktop at 708 mm (8 legs + 60 frame + 2.8 top)", () => {
    expect(UPPER_Y).toBe(708);
  });
});

describe("designs", () => {
  it("has seven variants", () => {
    expect(DESIGNS).toHaveLength(7);
  });

  for (const d of DESIGNS) {
    describe(d.id, () => {
      const v = validate(d);

      it("has no hard errors", () => {
        expect(v.filter((x) => x.level === "error")).toEqual([]);
      });

      it("stays under the soffit", () => {
        const maxTop = Math.max(...d.modules.map((m) => m.y + m.h));
        expect(maxTop).toBeLessThanOrEqual(ROOM.soffitHeightMm);
      });

      it("stays on the free wall", () => {
        for (const m of d.modules) {
          expect(m.x).toBeGreaterThanOrEqual(0);
          expect(m.x + m.w).toBeLessThanOrEqual(ROOM.wallWidthMm);
        }
      });

      it("prices a non-trivial IKEA base", () => {
        const s = partsList(d);
        expect(s.totalNok).toBeGreaterThan(3000);
        expect(s.vendors).toContain("IKEA");
      });
    });
  }

  it("V2 (BESTÅ) needs 400 mm of filler to reach 340 (60-module mismatch)", () => {
    const v2 = DESIGNS.find((d) => d.id === "v2-besta")!;
    const fillerSum = v2.modules
      .filter((m) => m.kind === "filler")
      .reduce((s, m) => s + m.w, 0);
    expect(fillerSum).toBe(400);
  });

  it("V2 stack leaves ~12 mm to the soffit (tightest variant)", () => {
    const v2 = DESIGNS.find((d) => d.id === "v2-besta")!;
    const shelfTop = Math.max(
      ...v2.modules.filter((m) => m.kind === "shelf").map((m) => m.y + m.h),
    );
    expect(ROOM.soffitHeightMm - shelfTop).toBe(12);
  });

  it("cut carcasses carry cut instructions", () => {
    for (const d of DESIGNS) {
      for (const m of d.modules) {
        if (m.source.type !== "catalogue") continue;
        const item = getItem(m.source.itemId);
        if (item.heightMm !== 0 && m.h !== item.heightMm) {
          expect(m.cut, `${d.id}/${m.id} resized without cut note`).toBeDefined();
        }
      }
    }
  });
});
