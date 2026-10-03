import type { ExtraPart, Module, Room } from "../model/types";

/** The living-room wall, from the hand sketch (measure on site before cutting). */
export const ROOM: Room = {
  wallWidthMm: 3602, // 360.2 cm, left corner to the shaft
  soffitHeightMm: 2380, // 238 cm to the underside of the nedhakk
  shaftWidthMm: 220,
  shaftDepthMm: 125,
  downlightOffsetMm: 300,
};

export const TARGET_WIDTH = 3400;
/** Unit centred on the free wall. */
export const UNIT_X = Math.round((ROOM.wallWidthMm - TARGET_WIDTH) / 2); // 101

export const LEG_H = 80;
export const BASE_FRAME_H = 600;
export const BASE_FRAME_D = 366;
export const TOP_H = 28;
export const TOP_D = 450;
export const TOP_Y = LEG_H + BASE_FRAME_H; // 680
export const UPPER_Y = TOP_Y + TOP_H; // 708
/** Low-bench stack (livingetc-style 40 cm frames): 80 + 400 + 28. */
export const UPPER_Y_LOW = LEG_H + 400 + TOP_H; // 508

const GREIGE = "#b4a894"; // render-ish painted grey-beige

/** Base run used by every variant: METOD wall frames 3×80 + 60 + 40 = 340 cm
 * standing on 8 cm legs, STENSUND-style doors, worktop on top.
 * (No 60 cm high METOD *base* frame exists — wall frames on legs is the trick.) */
export function metodBase(): { modules: Module[]; extraParts: ExtraPart[] } {
  const widths = [
    { w: 800, item: "metod-wall-80x37x60", doors: 2 },
    { w: 800, item: "metod-wall-80x37x60", doors: 2 },
    { w: 800, item: "metod-wall-80x37x60", doors: 2 },
    { w: 600, item: "metod-wall-60x37x60", doors: 1 },
    { w: 400, item: "metod-wall-40x37x60", doors: 1 },
  ];
  const modules: Module[] = [];
  let x = UNIT_X;
  widths.forEach((f, i) => {
    modules.push({
      id: `base-${i}`,
      label: `METOD ${f.w / 10} cm`,
      kind: "cabinet",
      source: { type: "catalogue", itemId: f.item, qty: 1 },
      x,
      y: LEG_H,
      z: 0,
      w: f.w,
      d: BASE_FRAME_D,
      h: BASE_FRAME_H,
      doors: f.doors,
      colorHex: GREIGE,
    });
    x += f.w;
  });

  modules.push(
    {
      id: "plinth",
      label: "Sokkel (malt MDF)",
      kind: "plinth",
      source: { type: "custom", material: "19 mm MDF, malt" },
      x: UNIT_X + 30,
      y: 0,
      z: 0,
      w: TARGET_WIDTH - 60,
      d: BASE_FRAME_D - 50,
      h: LEG_H,
      colorHex: "#9c9183",
    },
    {
      id: "top",
      label: "Benkeplate 340×45",
      kind: "top",
      source: { type: "catalogue", itemId: "ekbacken-custom-top", qty: 4 },
      x: UNIT_X,
      y: TOP_Y,
      z: 0,
      w: TARGET_WIDTH,
      d: TOP_D,
      h: TOP_H,
      cut: { note: "EKBACKEN spesialtilpasset 3400×450 mm (pris per påbegynt meter — bekreft i varehus), eller snekkerlevert plate" },
      colorHex: "#c4b9a6",
    },
  );

  const extraParts: ExtraPart[] = [
    { itemId: "metod-leg-8cm-2pk", qty: 20, label: "METOD ben (4 per skrog)" },
    { itemId: "stensund-door-40x60", qty: 7, label: "Dører til 80- og 40-skrog" },
    { itemId: "stensund-door-60x60", qty: 1, label: "Dør til 60-skrog" },
  ];

  return { modules, extraParts };
}

/** Low bench (benk i sittehøyde, som livingetc-METOD-hacken): 4× METOD
 * veggskap 80×37×40 på sokkel, 100 mm foring per side. Kun 40×40-dører
 * finnes i denne høyden (glatte, ingen shaker) — VEDDINGE. 80-gavlene
 * flukter perfekt med 80-brede overdeler. */
export function metodBaseLow(): { modules: Module[]; extraParts: ExtraPart[] } {
  const frameH = 400;
  const modules: Module[] = [];
  const sideFill = 100;
  for (let i = 0; i < 4; i++) {
    modules.push({
      id: `base-${i}`,
      label: `METOD 80 lav`,
      kind: "cabinet",
      source: { type: "catalogue", itemId: "metod-wall-80x37x40", qty: 1 },
      x: UNIT_X + sideFill + i * 800,
      y: LEG_H,
      z: 0,
      w: 800,
      d: BASE_FRAME_D,
      h: frameH,
      doors: 2,
      colorHex: GREIGE,
    });
  }
  modules.push(
    filler("bfill-l", UNIT_X, LEG_H, frameH, sideFill, BASE_FRAME_D),
    filler("bfill-r", UNIT_X + sideFill + 3200, LEG_H, frameH, sideFill, BASE_FRAME_D),
    {
      id: "plinth",
      label: "Sokkel (malt MDF)",
      kind: "plinth",
      source: { type: "custom", material: "19 mm MDF, malt" },
      x: UNIT_X + 30,
      y: 0,
      z: 0,
      w: TARGET_WIDTH - 60,
      d: BASE_FRAME_D - 50,
      h: LEG_H,
      colorHex: "#9c9183",
    },
    {
      id: "top",
      label: "Benkeplate 340×45 (sittebenk)",
      kind: "top",
      source: { type: "catalogue", itemId: "ekbacken-custom-top", qty: 4 },
      x: UNIT_X,
      y: LEG_H + frameH,
      z: 0,
      w: TARGET_WIDTH,
      d: TOP_D,
      h: TOP_H,
      cut: { note: "EKBACKEN spesialtilpasset 3400×450 mm, eller snekkerlevert plate" },
      colorHex: "#c4b9a6",
    },
  );
  return {
    modules,
    extraParts: [
      { itemId: "metod-leg-8cm-2pk", qty: 16, label: "METOD ben (4 per skrog)" },
      { itemId: "veddinge-door-40x40", qty: 8, label: "Dører (glatte — shaker finnes ikke i 40-høyde)" },
    ],
  };
}

/** Crown/scribe closing the gap between unit top and soffit. Side cladding is
 * covered by the end fillers; the painted face frame is priced via the cut list. */
export function mdfFraming(upperDepth: number, upperTop: number): Module[] {
  const crownH = ROOM.soffitHeightMm - upperTop;
  if (crownH <= 0) return [];
  return [
    {
      id: "crown",
      label: `Gesims/losholt mot himling (${crownH} mm)`,
      kind: "panel",
      source: { type: "custom", material: "MDF, skjæres på stedet" },
      x: UNIT_X,
      y: upperTop,
      z: 0,
      w: TARGET_WIDTH,
      d: upperDepth,
      h: crownH,
      colorHex: GREIGE,
    },
  ];
}

export function filler(id: string, x: number, y: number, h: number, w: number, d: number): Module {
  return {
    id,
    label: `Foring ${w} mm (MDF)`,
    kind: "filler",
    source: { type: "custom", material: "MDF, malt, skjæres på stedet" },
    x,
    y,
    z: 0,
    w,
    d,
    h,
    colorHex: GREIGE,
  };
}

export const SITE_NOTES = [
  "ALLE kappmål kontrollmåles på stedet — 3602/2380/220 er fra håndskisse.",
  "238 cm er til underkant nedhakk; sjekk at nedhakket er i vater før gesims kappes.",
  "METOD veggskap er laget for å HENGE på skinne, ikke stå på ben. Anbefalt (fra dokumenterte bygg): heng på opphengsskinne OG bær på sokkelboks av kryssfiner/trelekt med bæring under gavlene — ikke IKEA-ben alene. Se docs/fastening.md.",
  "Downlights sitter ca. 30 cm fra vegg — sjekk avstand til overhyllenes forkant.",
  "Målet 70.8 cm underskap-høyde (8 sokkel + 60 skrog + 2.8 plate) avviker 8 mm fra skissens 70 cm.",
  "Hele overdelen SKAL forankres i vegg i topp (veltefare, ~190 kg per lastet seksjon) — se docs/fastening.md.",
];
