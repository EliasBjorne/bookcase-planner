import type { Design, Module } from "../model/types";
import { BASE_WIDTHS, BILLY_WIDTHS, bestCombo } from "../model/widths";
import {
  ROOM,
  TARGET_WIDTH,
  UNIT_X,
  UPPER_Y,
  UPPER_Y_LOW,
  filler,
  mdfFraming,
  metodBase,
  metodBaseLow,
  SITE_NOTES,
} from "./common";

const GREIGE = "#b4a894";

function shelfRun(
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
    colorHex: GREIGE,
  };
}

/** V1 — METOD base + 4× Bohus Base bookcases cut to height, fully MDF-faced. */
function v1(): Design {
  const base = metodBase();
  const upperH = 1650;
  const bohusW = 790;
  const runW = 4 * bohusW; // 3160
  const sideFill = (TARGET_WIDTH - runW) / 2; // 120
  const modules: Module[] = [
    ...base.modules,
    filler("fill-l", UNIT_X, UPPER_Y, upperH, sideFill, 267),
    ...[0, 1, 2, 3].map((i) =>
      shelfRun(`bohus-${i}`, `Bohus Base ${i + 1} (kappet til 165)`, "bohus-base-bokhylle-80", {
        x: UNIT_X + sideFill + i * bohusW,
        y: UPPER_Y,
        w: bohusW,
        d: 267,
        h: upperH,
        columns: 1,
        shelves: 4,
        cutNote: "Kapp ~380 mm av TOPPEN (fabrikkbunn står på platen), re-monter topplaten med kappet som borejigg, kort inn bakplate. Erstatt/stiv av hyller med 18 mm MDF (orig. tåler kun 13 kg — verifisert).",
      }),
    ),
    filler("fill-r", UNIT_X + sideFill + runW, UPPER_Y, upperH, sideFill, 267),
    ...mdfFraming(267, UPPER_Y + upperH),
  ];
  return {
    id: "v1-bohus",
    name: "V1 · METOD + Bohus Base",
    description:
      "Billigste kjøpte overdel: 4× Bohus Base bokhylle (79 cm) kappes til 165 cm og kles helt inn i MDF. Karmen forsvinner bak malt ramme — nærmest plassbygd-looken av butikkalternativene.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: base.extraParts,
    siteNotes: [
      ...SITE_NOTES,
      "Bohus-hyllene er foliert sponplate: slip + heftgrunning før maling.",
      "Originalhyller tåler bare 13 kg — bytt til 18 mm MDF for bøker.",
    ],
    verdict:
      "Nærmest referansebildet per krone (≈7 600 kr for selve overdelen). 26.7 cm dybde i stedet for skissens 20. Kappingen + innkledning er reelt snekkerarbeid — be montørene prise ren MDF-hylle som sammenlikning.",
  };
}

/** V2 — METOD base + BESTÅ 60×20 frames stacked 64+64+38. */
function v2(): Design {
  const base = metodBase();
  const cols = 5;
  const runW = cols * 600; // 3000
  const sideFill = (TARGET_WIDTH - runW) / 2; // 200
  const stackH = 640 + 640 + 380; // 1660
  const rows: [number, number, string][] = [
    [UPPER_Y, 640, "besta-frame-60x20x64"],
    [UPPER_Y + 640, 640, "besta-frame-60x20x64"],
    [UPPER_Y + 1280, 380, "besta-frame-60x20x38"],
  ];
  const modules: Module[] = [
    ...base.modules,
    filler("fill-l", UNIT_X, UPPER_Y, stackH, sideFill, 200),
    ...rows.map(([y, h, item], i) =>
      shelfRun(`besta-row-${i}`, `BESTÅ rad ${i + 1} (${cols}× 60×20×${h / 10})`, item, {
        x: UNIT_X + sideFill,
        y,
        w: runW,
        d: 200,
        h,
        units: cols,
        columns: cols,
        shelves: 1,
      }),
    ),
    filler("fill-r", UNIT_X + sideFill + runW, UPPER_Y, stackH, sideFill, 200),
    ...mdfFraming(200, UPPER_Y + stackH),
  ];
  return {
    id: "v2-besta",
    name: "V2 · METOD + BESTÅ 20 cm",
    description:
      "Eneste IKEA-vei til ekte 20 cm dype åpne hyller: BESTÅ 60×20-rammer stables 64+64+38 oppå benkeplaten. Bredden låses til 60-moduler (300 cm) — 20 cm foring i hver ende viser avviket mot 340-målet.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: base.extraParts,
    siteNotes: [
      ...SITE_NOTES,
      "Hver stablet BESTÅ-rad skal ha egen veggskinne — 15 skinner totalt.",
      "Stabel 70.8 + 166 = 236.8 cm: bare ~12 mm klaring til nedhakket. Kontrollmål før bestilling!",
    ],
    verdict:
      "Riktig dybde (20 cm) og null kapping av skrog, men 5 synlige 60-kolonner gir et annet rytme enn renderets 5 brede felt, og 40 cm total foring. Trangest klaring mot taket av alle variantene.",
  };
}

/** V3 family — METOD base + BILLY cut to height, at selectable total widths.
 * Frame/BILLY combos come from the same solver as the width explorer. */
export const V3_WIDTHS = [3000, 3200, 3400, 3600];

function v3At(targetMm: number): Design {
  const unitX = Math.round((ROOM.wallWidthMm - targetMm) / 2);
  const baseCombo = bestCombo(targetMm, BASE_WIDTHS);
  const billyCombo = bestCombo(targetMm, BILLY_WIDTHS);
  const base = metodBase(baseCombo.widths, unitX, targetMm);
  const upperH = 1650;
  const sideFill = billyCombo.fillerMm / 2;
  const billy80Count = billyCombo.widths.filter((w) => w === 800).length;

  let bx = unitX + sideFill;
  const billyModules: Module[] = billyCombo.widths.map((w, i) => {
    const m = shelfRun(
      `billy-${i}`,
      `BILLY ${w / 10} (kappet til 165)`,
      w === 800 ? "billy-80x28x202" : "billy-40x28x202",
      {
        x: bx,
        y: UPPER_Y,
        w,
        d: 280,
        h: upperH,
        columns: 1,
        shelves: 4,
        cutNote: "Kapp 370 mm av TOPPEN (fabrikkbunn + sokkelkant blir stående på platen). Bruk kappet som borejigg for nye tapp-/kamlåshull til topplaten. Kort inn og re-spikre bakplaten tett etter diagonalmåling.",
      },
    );
    bx += w;
    return m;
  });

  const modules: Module[] = [
    ...base.modules,
    ...(sideFill > 0
      ? [
          filler("fill-l", unitX, UPPER_Y, upperH, sideFill, 280),
          filler("fill-r", unitX + sideFill + billyCombo.sumMm, UPPER_Y, upperH, sideFill, 280),
        ]
      : []),
    ...billyModules,
    ...mdfFraming(280, UPPER_Y + upperH, unitX, targetMm),
  ];

  const isDefault = targetMm === TARGET_WIDTH;
  return {
    id: isDefault ? "v3-billy" : `v3-billy-${targetMm / 10}`,
    name: `V3 · BILLY ${targetMm / 10} cm`,
    description:
      `Klassisk IKEA-hack i ${targetMm / 10} cm bredde: base ${baseCombo.widths.map((w) => w / 10).join("+")}${baseCombo.fillerMm ? ` (+${baseCombo.fillerMm / 2} mm foring/side)` : " (eksakt)"}, ` +
      `BILLY ${billyCombo.widths.map((w) => w / 10).join("+")}${billyCombo.fillerMm ? ` (+${billyCombo.fillerMm / 2} mm foring/side)` : " (eksakt)"} kappet til 165. ` +
      "28 cm dybde, 30 kg hyllelast." +
      (targetMm === 3600 ? " NB: fyller hele friveggen (3602) — krever at sjaktmålet stemmer!" : ""),
    room: ROOM,
    unitOffsetMm: unitX,
    targetWidthMm: targetMm,
    modules,
    extraParts: [
      ...base.extraParts,
      ...(billy80Count > 0
        ? [{ itemId: "billy-extra-shelf-76x26", qty: billy80Count, label: "Ekstra hylleplater (80-brede)" }]
        : []),
    ],
    siteNotes: [
      ...SITE_NOTES,
      "BILLY kappes fra TOPPEN — fabrikkbunnen bærer mot platen (dokumentert i flere bygg, se docs/fastening.md).",
      "Der BILLY-gavler lander mellom METOD-gavler: kloss/tverrlekt under platen (se docs/fastening.md).",
      "Innfesting: lommeskruer/klosser ned i platen + feste i vegg i topp per skrog — full oppskrift i docs/fastening.md.",
      "Papirfolie: slip + heftgrunning før maling.",
    ],
    verdict:
      targetMm === 3400
        ? "Mest robuste IKEA-overdel (30 kg/hylle) og 80-rytmen matcher renderet godt. 8 cm dypere enn skissen — sjekk downlight-avstanden. Kapping av 4 skrog er den store jobben."
        : targetMm === 3200
          ? "320 treffer eksakt for både base og BILLY (4×80) — null foring, reneste bygget. 20 cm mer luft til sjakten enn 340."
          : targetMm === 3600
            ? "Fyller friveggen helt (1 mm klaring på papiret!). Base og BILLY treffer eksakt (4×80+40). Mest hylleplass, men null slingringsmonn — kontrollmål sjakt og vegg først."
            : "Minste varianten: base 3×80+60 eksakt, BILLY 3×80+40 med 10 cm foring/side. Luftigst, men minst oppbevaring.",
  };
}

/** V4 — all-METOD: open wall frames stacked two high as the shelves. */
function v4(): Design {
  const base = metodBase();
  const rows: [number, number][] = [
    [UPPER_Y, 800],
    [UPPER_Y + 800, 800],
  ];
  const modules: Module[] = [
    ...base.modules,
    ...rows.flatMap(([y], r) => {
      const mods: Module[] = [
        shelfRun(`metod-up-${r}`, `METOD rad ${r + 1}: 4× 80×37×80 åpen`, "metod-wall-80x37x80", {
          x: UNIT_X,
          y,
          w: 3200,
          d: 366,
          h: 800,
          units: 4,
          columns: 4,
          shelves: 1,
        }),
        shelfRun(`metod-up-${r}-20`, `METOD rad ${r + 1}: 20×37×80 åpen`, "metod-wall-20x37x80", {
          x: UNIT_X + 3200,
          y,
          w: 200,
          d: 366,
          h: 800,
          columns: 1,
          shelves: 1,
        }),
      ];
      return mods;
    }),
    ...mdfFraming(366, UPPER_Y + 1600),
  ];
  return {
    id: "v4-metod",
    name: "V4 · Hel-METOD",
    description:
      "Ett system hele veien: åpne METOD veggskap (uten dører) stables to i høyden som bokhylle, 4×80+20 = 340 eksakt. MDF-rammeverk utenpå. 36.6 cm dype hyller — dypest av alle.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: base.extraParts,
    siteNotes: [
      ...SITE_NOTES,
      "Gavlene i overdel (80-delinger) flukter IKKE med basens 80/60/40-deling — skjules av MDF-fasaderamme.",
      "20 cm-stammen (802.521.12) er uverifisert på produktside — sjekk at den finnes i 80 høyde.",
    ],
    verdict:
      "Enklest logistikk (én leverandør, null kapping av skrog) og treffer 340 eksakt. Men 37 cm dype åpne hyller ser tunge ut mot renderets 20, og gavl-mislinjering krever full fasaderamme. Downlights ~30 cm fra vegg kan kollidere med forkant!",
  };
}

/** V5 — String 20 cm system wall-hung above the base. */
function v5(): Design {
  const base = metodBase();
  const bays = [780, 780, 580, 580, 580]; // 3300
  const runW = bays.reduce((a, b) => a + b, 0);
  const sideFill = (TARGET_WIDTH - runW) / 2; // 50
  const stringY = UPPER_Y + 72; // hung just above the top (mounting clearance)
  const stringH = 1500; // two 75 cm panel rows
  let x = UNIT_X + sideFill;
  const bayModules: Module[] = bays.map((w, i) => {
    const m = shelfRun(`string-bay-${i}`, `String-felt ${w / 10} cm`, null, {
      x,
      y: stringY,
      w,
      d: 200,
      h: stringH,
      columns: 1,
      shelves: 5,
      material: "String gavler + hyller (stål/tre, males ikke)",
    });
    x += w;
    return m;
  });
  const modules: Module[] = [
    ...base.modules,
    ...bayModules,
    ...mdfFraming(200, stringY + stringH),
  ];
  return {
    id: "v5-string",
    name: "V5 · METOD + String 20 cm",
    description:
      "Designklassikeren: String-system (eneste verifiserte ekte 20 cm-dybde) vegghengt over basen. 2×78 + 3×58-felt ≈ 330 cm. Stålgavler kan ikke males — dette blir synlig String, med MDF-ramme rundt.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: [
      ...base.extraParts,
      { itemId: "string-panel-20x75-2pk", qty: 12, label: "Gavler 20×75 (6 kolonner × 2 rader)" },
      { itemId: "string-shelf-78x20-3pk", qty: 10, label: "Hyller 78 cm (2 felt × 5)" },
      { itemId: "string-shelf-58x20-3pk", qty: 15, label: "Hyller 58 cm (3 felt × 5)" },
    ],
    siteNotes: [
      ...SITE_NOTES,
      "String henges på vegg — finn stendere/bruk riktige plugger; last på 330 cm bokhylle er betydelig.",
      "Gavlene er stål og males ikke — fargevalg (hvit) må aksepteres som synlig.",
    ],
    verdict:
      "Eneste varianten med skissens eksakte 20 cm dybde, og null kapping. Men den LESES som String-hylle, ikke plassbygd bokhylle — ærlig talt lengst fra referansebildet i uttrykk, og dyrest av IKEA/budsjett-alternativene (~17 000 kr bare for String-delene).",
  };
}

const LOW_NOTES = [
  "Lav benk (50.8 cm) er sittehøyde — forsterk platen med tverrlekt hvis den skal sittes på ved fronten (utheng 6–8 cm).",
  "Shaker-dører finnes IKKE i 40-høyde — VEDDINGE er glatt. Shaker-look: lim MDF-lister på dørene, eller aksepter glatt base.",
  "80-gavlene i basen flukter med overdelens gavler — lastbane rett ned, ingen klossing under platen nødvendig.",
];

/** V6 — low bench (livingetc-style) + BILLY cut to 185. */
function v6(): Design {
  const base = metodBaseLow();
  const upperH = 1850;
  const sideFill = 100; // same 4×80 rhythm as the base
  const modules: Module[] = [
    ...base.modules,
    filler("fill-l", UNIT_X, UPPER_Y_LOW, upperH, sideFill, 280),
    ...[0, 1, 2, 3].map((i) =>
      shelfRun(`billy-${i}`, `BILLY ${i + 1} (kappet til 185)`, "billy-80x28x202", {
        x: UNIT_X + sideFill + i * 800,
        y: UPPER_Y_LOW,
        w: 800,
        d: 280,
        h: upperH,
        columns: 1,
        shelves: 5,
        cutNote: "Kapp kun 170 mm av TOPPEN (fabrikkbunn står på platen). Kappet som borejigg for topplate-hull; re-spikre bakplate.",
      }),
    ),
    filler("fill-r", UNIT_X + sideFill + 3200, UPPER_Y_LOW, upperH, sideFill, 280),
    ...mdfFraming(280, UPPER_Y_LOW + upperH),
  ];
  return {
    id: "v6-lavbenk-billy",
    name: "V6 · Lav benk + BILLY",
    description:
      "Livingetc-varianten: METOD veggskap 80×37×40 som sittebenk (50.8 cm) i stedet for sideboard-høyde. BILLY kappes bare 17 cm (til 185) og får 6 hyllenivåer. 4×80-rytme fra gulv til tak — alle gavler flukter.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: [
      ...base.extraParts,
      { itemId: "billy-extra-shelf-76x26", qty: 4, label: "Ekstra hylleplater" },
    ],
    siteNotes: [...SITE_NOTES, ...LOW_NOTES],
    verdict:
      "Billigst av alle (~12 500 kr), minst kapping (17 cm av toppen), perfekt gavlflukt og vindusbenk-følelse med puter. Men: bare 2/3 så mye lukket oppbevaring som V3, glatte dører (ingen shaker i 40-høyde), og proporsjonene avviker fra referansebildet — mer bibliotek, mindre sideboard.",
  };
}

/** V7 — low bench + Bohus Base cut to 185. */
function v7(): Design {
  const base = metodBaseLow();
  const upperH = 1850;
  const bohusW = 790;
  const runW = 4 * bohusW; // 3160
  const sideFill = (TARGET_WIDTH - runW) / 2; // 120
  const modules: Module[] = [
    ...base.modules,
    filler("fill-l", UNIT_X, UPPER_Y_LOW, upperH, sideFill, 267),
    ...[0, 1, 2, 3].map((i) =>
      shelfRun(`bohus-${i}`, `Bohus Base ${i + 1} (kappet til 185)`, "bohus-base-bokhylle-80", {
        x: UNIT_X + sideFill + i * bohusW,
        y: UPPER_Y_LOW,
        w: bohusW,
        d: 267,
        h: upperH,
        columns: 1,
        shelves: 5,
        cutNote: "Kapp ~180 mm av TOPPEN, re-monter topplaten (kappet som jigg). Erstatt/stiv av hyller med 18 mm MDF (orig. 13 kg).",
      }),
    ),
    filler("fill-r", UNIT_X + sideFill + runW, UPPER_Y_LOW, upperH, sideFill, 267),
    ...mdfFraming(267, UPPER_Y_LOW + upperH),
  ];
  return {
    id: "v7-lavbenk-bohus",
    name: "V7 · Lav benk + Bohus",
    description:
      "Som V6, men med Bohus Base-overdel (26.7 cm dyp) kappet til 185 cm. Base-gavler (80-rytme) og Bohus-gavler (79-rytme) flukter nesten — 1 cm glidning per skrog utover.",
    room: ROOM,
    unitOffsetMm: UNIT_X,
    targetWidthMm: TARGET_WIDTH,
    modules,
    extraParts: base.extraParts,
    siteNotes: [
      ...SITE_NOTES,
      ...LOW_NOTES,
      "Bohus-hyllene tåler 13 kg — bytt/stiv av med 18 mm MDF ved boklast.",
      "79 mot 80-rytme: opptil 3 cm gavl-glidning ytterst — legg kloss under platen ved ytterste Bohus-gavler.",
    ],
    verdict:
      "Lav-benk-versjonen av V1: mer hyllehøyde (6 nivåer), mindre kapping enn V1 (18 cm mot 38). Samme svake Bohus-hyller, og glatte VEDDINGE-dører i basen. God mellomting hvis dere vil ha vindusbenk-looken.",
  };
}

export const DESIGNS: Design[] = [
  v1(),
  v2(),
  ...V3_WIDTHS.map(v3At),
  v4(),
  v5(),
  v6(),
  v7(),
];
