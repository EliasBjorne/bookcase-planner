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
    ["v6 (low billy)", { bench: "low", front: "veddinge" }, 14460],
    ["v7 (low bohus)", { bench: "low", front: "veddinge", uppers: "bohus" }, 17756],
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
    expect(partsList(buildDesign(setup({ front: "noremax" }))).totalNok).toBe(16751 + 12393);
  });

  it("painted MDF top removes EKBACKEN (−3980)", () => {
    expect(partsList(buildDesign(setup({ top: "mdf-painted" }))).totalNok).toBe(16751 - 3980);
  });

  it("6 MITTLED spots + driver + cord = +1580", () => {
    expect(partsList(buildDesign(setup({ lighting: "spots6" }))).totalNok).toBe(16751 + 1580);
  });
});

describe("constraints and geometry", () => {
  it("rejects STENSUND on the low bench", () => {
    expect(() => buildDesign(setup({ bench: "low" }))).toThrow(/40-høyde/);
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
  it("round-trips every field", () => {
    const s = setup({ widthMm: 3600, bench: "low", uppers: "bohus", front: "noremax", color: "dark", knobs: "beslag-uno", top: "mdf-painted", lighting: "spots9" });
    expect(decodeSetup(encodeSetup(s))).toEqual(s);
  });

  it("rejects malformed tokens", () => {
    expect(decodeSetup("9999")).toBeNull();
    expect(decodeSetup("abcdefgh")).toBeNull();
    expect(decodeSetup(null)).toBeNull();
  });
});
