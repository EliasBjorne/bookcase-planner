import { describe, expect, it } from "vitest";
import { buildDesign } from "./build";
import { DEFAULT_SETUP, decodeSetup, encodeSetup, type Setup } from "./setup";
import { partsList } from "./cost";
import { validate } from "./validate";

const setup = (over: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, ...over });

/** The generator must reproduce the hand-audited preset totals exactly —
 * two independent code paths agreeing (see audit.test.ts arithmetic). */
describe("buildDesign ≡ preset audits", () => {
  const cases: [string, Partial<Setup>, number][] = [
    ["v3-340 (billy)", {}, 16751],
    ["v1 (bohus)", { uppers: "bohus" }, 20047],
    ["v2 (besta)", { uppers: "besta" }, 20376],
    ["v4 (metod)", { uppers: "metod" }, 17481],
    ["v5 (string)", { uppers: "string" }, 29541],
    ["v8 (bbb)", { uppers: "bbb" }, 21261],
    ["v6 (low billy)", { bench: "low", front: "veddinge-hvit" }, 14460],
    ["v7 (low bohus)", { bench: "low", front: "veddinge-hvit", uppers: "bohus" }, 17756],
    ["v3-320", { widthMm: 3200 }, 15956],
    ["v3-360", { widthMm: 3600 }, 18050],
  ];
  for (const [name, over, total] of cases) {
    it(`${name} = ${total} kr`, () => {
      expect(partsList(buildDesign(setup(over))).totalNok).toBe(total);
    });
  }
});

describe("option price effects (hand-computed)", () => {
  it("Beslag Design knobs: −360 +8×185 → +1120", () => {
    expect(partsList(buildDesign(setup({ knobs: "beslag-uno" }))).totalNok).toBe(16751 + 1120);
  });

  it("Noremax fronts: −(7×300+460) +(7×1820+2213) → +12393", () => {
    expect(partsList(buildDesign(setup({ front: "noremax-custom" }))).totalNok).toBe(16751 + 12393);
  });

  it("BODBYN offwhite: −2560 +(7×390+595) → +765", () => {
    expect(partsList(buildDesign(setup({ front: "bodbyn-offwhite" }))).totalNok).toBe(16751 + 765);
  });

  it("UPPLÖV (integrert grep) fjerner knottene: −2560 −360 +(7×345+525) → +20", () => {
    expect(partsList(buildDesign(setup({ front: "upplov-beige" }))).totalNok).toBe(16751 - 2560 - 360 + 2940);
  });

  it("CORRECTED: shaker on the low bench works (STENSUND 40×40 = 260)", () => {
    // low base 10160 − veddinge 8×230 (1840) + stensund 8×260 (2080) + billy 4300
    const d = buildDesign(setup({ bench: "low", front: "stensund-hvit" }));
    expect(partsList(d).totalNok).toBe(10160 - 1840 + 2080 + 4300);
    expect(d.modules.some((m) => m.doorStyle === "shaker")).toBe(true);
  });

  it("painted MDF top removes EKBACKEN (−3980)", () => {
    expect(partsList(buildDesign(setup({ top: "mdf-painted" }))).totalNok).toBe(16751 - 3980);
  });

  it("6 MITTLED spots + driver + cord = +1580", () => {
    expect(partsList(buildDesign(setup({ lighting: "spots6" }))).totalNok).toBe(16751 + 1580);
  });
});

describe("constraints and geometry", () => {
  it("rejects stacked-system uppers on the low bench", () => {
    expect(() => buildDesign(setup({ bench: "low", uppers: "besta" }))).toThrow(/høy benk/);
  });

  it("paintable fronts take the paint colour; foil fronts keep factory colour", () => {
    const painted = buildDesign(setup({ front: "bodbyn-svart" })); // paintable bevel
    const cabP = painted.modules.find((m) => m.kind === "cabinet" && m.doors)!;
    expect(cabP.doorStyle).toBe("bevel");
    expect(cabP.doorColorHex).toBe("#b4a894"); // painted in the chosen greige

    const foil = buildDesign(setup({ front: "nickebo-antrasitt" })); // foil, not paintable
    const cabF = foil.modules.find((m) => m.kind === "cabinet" && m.doors)!;
    expect(cabF.doorStyle).toBe("flat");
    expect(cabF.doorColorHex).toBe("#79837a"); // factory matt grågrønn survives colour choice
  });

  it("knob choice changes price and rendered colour (GUBBARP 10 kr/2-pk)", () => {
    const d = buildDesign(setup({ knobs: "gubbarp-hvit" }));
    // 16751 − BAGGANÄS 360 + GUBBARP 4 packs × 10 = 16431
    expect(partsList(d).totalNok).toBe(16431);
    const cab = d.modules.find((m) => m.kind === "cabinet" && m.doors)!;
    expect(cab.knobColorHex).toBe("#f2f1ec");
  });

  it("MITTLED spots appear in the SVG render when configured", async () => {
    const { renderFront } = await import("../views/render");
    expect(renderFront(buildDesign(setup({ lighting: "spots6" })))).toContain("spot-glow");
    expect(renderFront(buildDesign(setup({})))).not.toContain("spot-glow");
  });

  it("every legal width×uppers combo validates without hard errors", () => {
    for (const widthMm of [3000, 3200, 3400, 3600] as const) {
      for (const uppers of ["billy", "bohus", "bbb", "besta", "metod", "string"] as const) {
        const d = buildDesign(setup({ widthMm, uppers }));
        const errors = validate(d).filter((v) => v.level === "error");
        expect(errors, `${widthMm}/${uppers}: ${errors.map((e) => e.message).join("; ")}`).toEqual([]);
      }
    }
  });

  it("colour choice retints modules", () => {
    const d = buildDesign(setup({ color: "dark" }));
    expect(d.modules.some((m) => m.colorHex === "#55534c")).toBe(true);
  });
});

describe("setup encoding", () => {
  it("round-trips every field (incl. high front indices in base36)", () => {
    const s = setup({ widthMm: 3600, bench: "low", uppers: "bohus", front: "forsbacka-eik", color: "dark", knobs: "beslag-uno", top: "mdf-painted", lighting: "spots9" });
    expect(decodeSetup(encodeSetup(s))).toEqual(s);
  });

  it("rejects malformed tokens", () => {
    expect(decodeSetup("9999")).toBeNull();
    expect(decodeSetup("ABCDEFGH")).toBeNull();
    expect(decodeSetup(null)).toBeNull();
  });
});
