import type { Design, ExtraPart, Module } from "./types";
import { COLOR_HEX, constraintError, encodeSetup, type Setup } from "./setup";
import { BASE_WIDTHS, BILLY_WIDTHS, bestCombo } from "./widths";
import {
  ROOM,
  SITE_NOTES,
  UPPER_Y,
  UPPER_Y_LOW,
  filler,
  mdfFraming,
  metodBase,
  metodBaseLow,
  shelfRun,
} from "../designs/common";

/** Build the family's configured design from the wizard's Setup. */

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(c);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const FRONT_SWAP: Record<Setup["front"], Record<string, string>> = {
  stensund: {},
  veddinge: {},
  noremax: {
    "stensund-door-40x60": "noremax-classic-40x60",
    "stensund-door-60x60": "noremax-classic-60x60",
    "veddinge-door-40x40": "noremax-classic-40x40",
  },
};

interface Uppers {
  modules: Module[];
  extraParts: ExtraPart[];
  notes: string[];
  depth: number;
}

function buildUppers(s: Setup, unitX: number, upperY: number): Uppers {
  const w = s.widthMm;
  switch (s.uppers) {
    case "billy": {
      const combo = bestCombo(w, BILLY_WIDTHS);
      const cutH = s.bench === "high" ? 1650 : 1850;
      const fill = combo.fillerMm / 2;
      let x = unitX + fill;
      const modules = combo.widths.map((bw, i) => {
        const m = shelfRun(`up-${i}`, `BILLY ${bw / 10} (kappet til ${cutH / 10})`,
          bw === 800 ? "billy-80x28x202" : "billy-40x28x202", {
            x, y: upperY, w: bw, d: 280, h: cutH, columns: 1,
            shelves: s.bench === "high" ? 4 : 5,
            cutNote: `Kapp ${2020 - cutH} mm av TOPPEN (fabrikkbunn står på platen); kappet som borejigg; re-spikre bakplate.`,
          });
        x += bw;
        return m;
      });
      const n80 = combo.widths.filter((x2) => x2 === 800).length;
      return {
        modules: fill > 0 ? [
          filler("ufill-l", unitX, upperY, cutH, fill, 280),
          ...modules,
          filler("ufill-r", unitX + fill + combo.sumMm, upperY, cutH, fill, 280),
        ] : modules,
        extraParts: n80 ? [{ itemId: "billy-extra-shelf-76x26", qty: n80, label: "Ekstra hylleplater" }] : [],
        notes: ["BILLY kappes fra TOPPEN — se docs/fastening.md.", "Papirfolie: slip + heftgrunning før maling."],
        depth: 280,
      };
    }
    case "bohus": {
      const combo = bestCombo(w, [790]);
      const cutH = s.bench === "high" ? 1650 : 1850;
      const fill = combo.fillerMm / 2;
      let x = unitX + fill;
      const modules = combo.widths.map((bw, i) => {
        const m = shelfRun(`up-${i}`, `Bohus Base (kappet til ${cutH / 10})`, "bohus-base-bokhylle-80", {
          x, y: upperY, w: bw, d: 267, h: cutH, columns: 1,
          shelves: s.bench === "high" ? 4 : 5,
          cutNote: `Kapp ~${2030 - cutH} mm av TOPPEN; erstatt/stiv av hyller med 18 mm MDF (orig. 13 kg).`,
        });
        x += bw;
        return m;
      });
      return {
        modules: [
          filler("ufill-l", unitX, upperY, cutH, fill, 267),
          ...modules,
          filler("ufill-r", unitX + fill + combo.sumMm, upperY, cutH, fill, 267),
        ],
        extraParts: [],
        notes: ["Bohus-hyller tåler 13 kg — stiv av med 18 mm MDF ved boklast."],
        depth: 267,
      };
    }
    case "bbb": {
      const units = Math.floor(w / 800);
      const runW = units * 800;
      const fill = (w - runW) / 2;
      const rows = [upperY, upperY + 830];
      return {
        modules: [
          filler("ufill-l", unitX, upperY, 1660, fill, 200),
          ...rows.map((y, r) =>
            shelfRun(`up-${r}`, `BBB rad ${r + 1}: ${units}× SR2-83`, "bbb-sr2-83", {
              x: unitX + fill, y, w: runW, d: 200, h: 830, units, columns: units, shelves: 2,
            })),
          filler("ufill-r", unitX + fill + runW, upperY, 1660, fill, 200),
        ],
        extraParts: [{ itemId: "bbb-side-2-83", qty: 2, label: "Ekstra endesider" }],
        notes: [
          "BBB-endesider legger ~+2 cm per rad — bekreft modulmål med BBB (post@bbbsystem.no).",
          "Heltre furu: sperregrunning mot kvistgjennomslag før maling.",
        ],
        depth: 200,
      };
    }
    case "besta": {
      const cols = Math.floor(w / 600);
      const runW = cols * 600;
      const fill = (w - runW) / 2;
      const rows: [number, number, string][] = [
        [upperY, 640, "besta-frame-60x20x64"],
        [upperY + 640, 640, "besta-frame-60x20x64"],
        [upperY + 1280, 380, "besta-frame-60x20x38"],
      ];
      return {
        modules: [
          filler("ufill-l", unitX, upperY, 1660, fill, 200),
          ...rows.map(([y, h, item], i) =>
            shelfRun(`up-${i}`, `BESTÅ rad ${i + 1} (${cols}× 60×20×${h / 10})`, item, {
              x: unitX + fill, y, w: runW, d: 200, h, units: cols, columns: cols, shelves: 1,
            })),
          filler("ufill-r", unitX + fill + runW, upperY, 1660, fill, 200),
        ],
        extraParts: [],
        notes: ["Hver stablet BESTÅ-rad skal ha egen veggskinne.", "Kun ~12 mm klaring til nedhakket — kontrollmål!"],
        depth: 200,
      };
    }
    case "metod": {
      const combo = bestCombo(w, [800, 600, 200]);
      const fill = combo.fillerMm / 2;
      const item: Record<number, string> = {
        800: "metod-wall-80x37x80", 600: "metod-wall-60x37x80", 200: "metod-wall-20x37x80",
      };
      const rows = [upperY, upperY + 800];
      const modules: Module[] = [];
      for (const [r, y] of rows.entries()) {
        let x = unitX + fill;
        for (const [i, fw] of combo.widths.entries()) {
          modules.push(shelfRun(`up-${r}-${i}`, `METOD ${fw / 10}×37×80 åpen`, item[fw], {
            x, y, w: fw, d: 366, h: 800, columns: 1, shelves: 1,
          }));
          x += fw;
        }
      }
      return {
        modules: fill > 0 ? [
          filler("ufill-l", unitX, upperY, 1600, fill, 366),
          ...modules,
          filler("ufill-r", unitX + fill + combo.sumMm, upperY, 1600, fill, 366),
        ] : modules,
        extraParts: [],
        notes: ["37 cm dype åpne hyller — sjekk downlight-avstand (~30 cm fra vegg)."],
        depth: 366,
      };
    }
    case "string": {
      const combo = bestCombo(w - 100, [780, 580]);
      const fill = (w - combo.sumMm) / 2;
      const stringY = upperY + 72;
      let x = unitX + fill;
      const bays = combo.widths.map((bw, i) => {
        const m = shelfRun(`up-${i}`, `String-felt ${bw / 10} cm`, null, {
          x, y: stringY, w: bw, d: 200, h: 1500, columns: 1, shelves: 5,
          material: "String gavler + hyller (stål/tre, males ikke)",
        });
        x += bw;
        return m;
      });
      const n78 = combo.widths.filter((x2) => x2 === 780).length;
      const n58 = combo.widths.length - n78;
      return {
        modules: bays,
        extraParts: [
          { itemId: "string-panel-20x75-2pk", qty: (combo.widths.length + 1) * 2, label: "Gavler (2 rader)" },
          { itemId: "string-shelf-78x20-3pk", qty: n78 * 5, label: "Hyller 78" },
          { itemId: "string-shelf-58x20-3pk", qty: n58 * 5, label: "Hyller 58" },
        ],
        notes: ["Stålgavler males ikke — blir synlig String.", "Henges i stendere — betydelig last."],
        depth: 200,
      };
    }
  }
}

export function buildDesign(s: Setup): Design {
  const err = constraintError(s);
  if (err) throw new Error(err);

  const unitX = Math.round((ROOM.wallWidthMm - s.widthMm) / 2);
  const upperY = s.bench === "high" ? UPPER_Y : UPPER_Y_LOW;
  const base =
    s.bench === "high"
      ? metodBase(bestCombo(s.widthMm, BASE_WIDTHS).widths, unitX, s.widthMm)
      : metodBaseLow(unitX, s.widthMm);

  // Front + knob swaps on the base's extraParts.
  const swap = FRONT_SWAP[s.front];
  let extraParts = base.extraParts.map((p) =>
    swap[p.itemId] ? { ...p, itemId: swap[p.itemId] } : p,
  );
  if (s.knobs === "beslag-uno") {
    extraParts = extraParts.map((p) =>
      p.itemId === "bagganas-knob-brass-2pk"
        ? { ...p, itemId: "beslag-design-uno-knob", label: "Uno-knotter, ekte messing" }
        : p,
    );
  }

  let modules = [...base.modules];
  // Top swap: painted MDF instead of EKBACKEN.
  if (s.top === "mdf-painted") {
    modules = modules.map((m) =>
      m.kind === "top"
        ? {
            ...m,
            source: { type: "custom", material: "MDF/finér, snekkerlevert — be om pris" },
            label: `Benkeplate ${s.widthMm / 10}×45 (malt, snekker)`,
            cut: { note: "Snekkerlevert plate malt som resten — pris inngår i snekkertilbudet, ikke i delelisten." },
          }
        : m,
    );
  }

  const uppers = buildUppers(s, unitX, upperY);
  const upperTop = Math.max(...uppers.modules.map((m) => m.y + m.h));
  modules = [...modules, ...uppers.modules, ...mdfFraming(uppers.depth, upperTop, unitX, s.widthMm)];

  // Colour: retint the standard palette.
  const unit = COLOR_HEX[s.color].unit;
  const tint: Record<string, string> = {
    "#b4a894": unit,
    "#9c9183": shade(unit, 0.86),
    "#c4b9a6": shade(unit, 1.08),
  };
  modules = modules.map((m) => (m.colorHex && tint[m.colorHex] ? { ...m, colorHex: tint[m.colorHex] } : m));

  if (s.lighting !== "none") {
    const n = s.lighting === "spots6" ? 6 : 9;
    extraParts.push(
      { itemId: "mittled-spot", qty: n, label: "Hyllebelysning" },
      { itemId: "tradfri-driver-30w", qty: 1 },
      { itemId: "fornimma-cord", qty: 1 },
    );
  }

  const frontNote =
    s.front === "noremax"
      ? "Noremax-fronter: bestill i valgt Jotun/NCS-kode, 5–8 ukers ledetid — lengste ledetid i prosjektet."
      : s.front === "stensund"
        ? "STENSUND sprøytelakkeres i valgt farge sammen med MDF-rammen (avfett, matting, heftgrunning)."
        : "VEDDINGE (glatt) males med rammen — shaker finnes ikke i 40-høyde fra IKEA.";

  return {
    id: `din-${encodeSetup(s)}`,
    name: "Din løsning",
    description: `${s.widthMm / 10} cm, ${s.bench === "high" ? "høy" : "lav"} benk, ${s.uppers.toUpperCase()}-overdel, ${COLOR_HEX[s.color].label.split(" (")[0].toLowerCase()}.`,
    room: ROOM,
    unitOffsetMm: unitX,
    targetWidthMm: s.widthMm,
    modules,
    extraParts: [...extraParts, ...uppers.extraParts],
    siteNotes: [...SITE_NOTES, ...uppers.notes, frontNote],
    verdict: "Konfigurert i veiviseren — sammenlign gjerne med forslagene under «Ferdige forslag».",
  };
}
