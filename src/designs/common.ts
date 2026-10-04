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

/** H600 wall-frame item + shaker-door mapping per frame width (shared with the
 * width solver). */
export const FRAME_ITEM_H600: Record<number, string> = {
  800: "metod-wall-80x37x60",
  600: "metod-wall-60x37x60",
  400: "metod-wall-40x37x60",
};
export const DOOR_FOR_FRAME_H600: Record<number, { doors: number; itemId: string }> = {
  800: { doors: 2, itemId: "stensund-door-40x60" },
  600: { doors: 1, itemId: "stensund-door-60x60" },
  400: { doors: 1, itemId: "stensund-door-40x60" },
};

/** Base run used by every variant: METOD H600 wall frames standing on 8 cm
 * legs, STENSUND-style doors, worktop on top. (No 60 cm high METOD *base*
 * frame exists — wall frames on legs is the trick.) Parametric in frame
 * widths and unit position; defaults to the 340 cm design. */
export function metodBase(
  frameWidths: number[] = [800, 800, 800, 600, 400],
  unitX: number = UNIT_X,
  targetWidth: number = TARGET_WIDTH,
): { modules: Module[]; extraParts: ExtraPart[] } {
  const runW = frameWidths.reduce((s, w) => s + w, 0);
  const sideFill = (targetWidth - runW) / 2;
  const modules: Module[] = [];
  let x = unitX + sideFill;
  frameWidths.forEach((w, i) => {
    modules.push({
      id: `base-${i}`,
      label: `METOD ${w / 10} cm`,
      kind: "cabinet",
      source: { type: "catalogue", itemId: FRAME_ITEM_H600[w], qty: 1 },
      x,
      y: LEG_H,
      z: 0,
      w,
      d: BASE_FRAME_D,
      h: BASE_FRAME_H,
      doors: DOOR_FOR_FRAME_H600[w].doors,
      colorHex: GREIGE,
    });
    x += w;
  });
  if (sideFill > 0) {
    modules.push(
      filler("bfill-l", unitX, LEG_H, BASE_FRAME_H, sideFill, BASE_FRAME_D),
      filler("bfill-r", unitX + sideFill + runW, LEG_H, BASE_FRAME_H, sideFill, BASE_FRAME_D),
    );
  }

  modules.push(
    {
      id: "plinth",
      label: "Sokkel (malt MDF)",
      kind: "plinth",
      source: { type: "custom", material: "19 mm MDF, malt" },
      x: unitX + 30,
      y: 0,
      z: 0,
      w: targetWidth - 60,
      d: BASE_FRAME_D - 50,
      h: LEG_H,
      colorHex: "#9c9183",
    },
    {
      id: "top",
      label: `Benkeplate ${targetWidth / 10}×45`,
      kind: "top",
      source: {
        type: "catalogue",
        itemId: "ekbacken-custom-top",
        qty: Math.ceil(targetWidth / 1000),
      },
      x: unitX,
      y: TOP_Y,
      z: 0,
      w: targetWidth,
      d: TOP_D,
      h: TOP_H,
      cut: { note: `EKBACKEN spesialtilpasset ${targetWidth}×450 mm (pris per påbegynt meter — bekreft i varehus), eller snekkerlevert plate` },
      colorHex: "#c4b9a6",
    },
  );

  const doorQty = new Map<string, number>();
  let totalDoors = 0;
  for (const w of frameWidths) {
    const d = DOOR_FOR_FRAME_H600[w];
    doorQty.set(d.itemId, (doorQty.get(d.itemId) ?? 0) + d.doors);
    totalDoors += d.doors;
  }
  const shelfQty = new Map<string, number>();
  for (const w of frameWidths) {
    const id = SHELF_FOR_FRAME[w];
    shelfQty.set(id, (shelfQty.get(id) ?? 0) + 1);
  }
  const extraParts: ExtraPart[] = [
    { itemId: "metod-leg-8cm-2pk", qty: frameWidths.length * 4, label: "METOD ben (4 per skrog)" },
    ...[...doorQty.entries()].map(([itemId, qty]) => ({ itemId, qty, label: "Dører" })),
    ...doorHardware(totalDoors),
    ...[...shelfQty.entries()].map(([itemId, qty]) => ({ itemId, qty, label: "Hylle i stamme (leveres uten)" })),
  ];

  return { modules, extraParts };
}

export const SHELF_FOR_FRAME: Record<number, string> = {
  800: "utrusta-shelf-80x37",
  600: "utrusta-shelf-60x37",
  400: "utrusta-shelf-40x37",
};

/** Hinges (2 per door, sold separately!) + brass knobs (1 per door). */
export function doorHardware(doorCount: number): ExtraPart[] {
  return [
    { itemId: "utrusta-hinge-2pk", qty: doorCount * 2, label: "Hengsler (2 per dør — følger IKKE med)" },
    { itemId: "bagganas-knob-brass-2pk", qty: doorCount, label: "Messingknotter" },
  ];
}

/** Low bench (benk i sittehøyde, som livingetc-METOD-hacken): METOD veggskap
 * 80×37×40 på sokkel. Kun 40×40-dører finnes i denne høyden (glatte, ingen
 * shaker). 80-gavlene flukter perfekt med 80-brede overdeler. Parametric in
 * width: 80-frames only + fillers. */
export function metodBaseLow(
  unitX: number = UNIT_X,
  targetWidth: number = TARGET_WIDTH,
): { modules: Module[]; extraParts: ExtraPart[] } {
  const frameH = 400;
  const frames = Math.floor(targetWidth / 800);
  const runW = frames * 800;
  const sideFill = (targetWidth - runW) / 2;
  const modules: Module[] = [];
  for (let i = 0; i < frames; i++) {
    modules.push({
      id: `base-${i}`,
      label: `METOD 80 lav`,
      kind: "cabinet",
      source: { type: "catalogue", itemId: "metod-wall-80x37x40", qty: 1 },
      x: unitX + sideFill + i * 800,
      y: LEG_H,
      z: 0,
      w: 800,
      d: BASE_FRAME_D,
      h: frameH,
      doors: 2,
      colorHex: GREIGE,
    });
  }
  if (sideFill > 0)
    modules.push(
      filler("bfill-l", unitX, LEG_H, frameH, sideFill, BASE_FRAME_D),
      filler("bfill-r", unitX + sideFill + runW, LEG_H, frameH, sideFill, BASE_FRAME_D),
    );
  modules.push(
    {
      id: "plinth",
      label: "Sokkel (malt MDF)",
      kind: "plinth",
      source: { type: "custom", material: "19 mm MDF, malt" },
      x: unitX + 30,
      y: 0,
      z: 0,
      w: targetWidth - 60,
      d: BASE_FRAME_D - 50,
      h: LEG_H,
      colorHex: "#9c9183",
    },
    {
      id: "top",
      label: `Benkeplate ${targetWidth / 10}×45 (sittebenk)`,
      kind: "top",
      source: {
        type: "catalogue",
        itemId: "ekbacken-custom-top",
        qty: Math.ceil(targetWidth / 1000),
      },
      x: unitX,
      y: LEG_H + frameH,
      z: 0,
      w: targetWidth,
      d: TOP_D,
      h: TOP_H,
      cut: { note: `EKBACKEN spesialtilpasset ${targetWidth}×450 mm, eller snekkerlevert plate` },
      colorHex: "#c4b9a6",
    },
  );
  return {
    modules,
    extraParts: [
      { itemId: "metod-leg-8cm-2pk", qty: frames * 4, label: "METOD ben (4 per skrog)" },
      { itemId: "veddinge-door-40x40", qty: frames * 2, label: "Dører (glatte — shaker finnes ikke i 40-høyde)" },
      ...doorHardware(frames * 2),
      // 40-høye stammer: ett rom, ingen ekstra hylle.
    ],
  };
}

/** Crown/scribe closing the gap between unit top and soffit. Side cladding is
 * covered by the end fillers; the painted face frame is priced via the cut list. */
export function mdfFraming(
  upperDepth: number,
  upperTop: number,
  unitX: number = UNIT_X,
  targetWidth: number = TARGET_WIDTH,
): Module[] {
  const crownH = ROOM.soffitHeightMm - upperTop;
  if (crownH <= 0) return [];
  return [
    {
      id: "crown",
      label: `Toppforing mot nedhakket — tetter ${crownH} mm glippe mellom hylletopp og tak`,
      kind: "panel",
      source: { type: "custom", material: "MDF — scribes mot taket på stedet. Glippa er nødvendig monteringsklaring (skroget må kunne løftes på plass) og toleranse for tak som ikke er i vater; lista skjuler også topplekta/veltesikringen." },
      x: unitX,
      y: upperTop,
      z: 0,
      w: targetWidth,
      d: upperDepth,
      h: crownH,
      colorHex: GREIGE,
    },
  ];
}

export function shelfRun(
  idPrefix: string,
  label: string,
  itemId: string | null,
  opts: {
    x: number;
    y: number;
    w: number;
    d: number;
    h: number;
    units?: number;
    columns: number;
    shelves: number;
    cutNote?: string;
    material?: string;
    colorHex?: string;
  },
): Module {
  return {
    id: idPrefix,
    label,
    kind: "shelf",
    source: itemId
      ? { type: "catalogue", itemId, qty: opts.units ?? 1 }
      : { type: "custom", material: opts.material ?? "19 mm MDF, malt" },
    x: opts.x,
    y: opts.y,
    z: 0,
    w: opts.w,
    d: opts.d,
    h: opts.h,
    unitsAcross: opts.units,
    columns: opts.columns,
    shelves: opts.shelves,
    cut: opts.cutNote ? { note: opts.cutNote } : undefined,
    colorHex: opts.colorHex ?? GREIGE,
  };
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
