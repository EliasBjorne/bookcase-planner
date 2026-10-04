/** The family's interactive configuration: one value per decision the wizard
 * walks through. Encodable to a short URL token for sharing. */

import { FRONTS } from "./fronts";
import { KNOBS } from "./knobs";

export const WIDTHS = [3000, 3200, 3400, 3600] as const;
export type WidthMm = (typeof WIDTHS)[number];

export interface Setup {
  widthMm: WidthMm;
  bench: "high" | "low";
  uppers: "billy" | "bohus" | "bbb" | "besta" | "metod" | "string";
  /** A FrontOption id from src/model/fronts.ts. */
  front: string;
  color: "greige" | "linen" | "dark" | "wall";
  /** A KnobOption id from src/model/knobs.ts. */
  knobs: string;
  top: "ekbacken" | "mdf-painted";
  lighting: "none" | "spots6" | "spots9";
}

export const DEFAULT_SETUP: Setup = {
  widthMm: 3400,
  bench: "high",
  uppers: "billy",
  front: "stensund-hvit",
  color: "greige",
  knobs: "bagganas-messing",
  top: "ekbacken",
  lighting: "none",
};

export const COLOR_HEX: Record<Setup["color"], { unit: string; label: string }> = {
  greige: { unit: "#b4a894", label: "Grå-beige (à la Jotun 10679 Washed Linen)" },
  linen: { unit: "#c9bfae", label: "Lys lin (à la Jotun 1024 Tidløs)" },
  dark: { unit: "#55534c", label: "Mørk (som dagens vitrineskap)" },
  wall: { unit: "#d6d0c4", label: "Som veggen (møbelet smelter inn)" },
};

/** Options that are not allowed together, with the reason shown in the UI. */
export function constraintError(s: Setup): string | null {
  if (s.bench === "low" && (s.uppers === "besta" || s.uppers === "string" || s.uppers === "metod"))
    return "BESTÅ/String/METOD-overdeler er bare regnet ut for høy benk (stable-høydene passer ikke 50.8-benken).";
  if (!FRONTS.some((f) => f.id === s.front)) return `Ukjent front: ${s.front}`;
  if (!KNOBS.some((k) => k.id === s.knobs)) return `Ukjent knott: ${s.knobs}`;
  return null;
}

/** Auto-correct dependent fields after a change so the setup stays legal.
 * The field the user just edited is never auto-corrected — an illegal choice
 * of that field must surface as a constraint error instead. */
export function normalize(s: Setup, edited?: keyof Setup): Setup {
  const out = { ...s };
  if (
    out.bench === "low" &&
    (out.uppers === "besta" || out.uppers === "string" || out.uppers === "metod") &&
    edited !== "uppers"
  )
    out.uppers = "billy";
  return out;
}

/** Keep key order stable — the encoded token depends on it. Each field is one
 * base36 character. */
const FIELDS: (keyof Setup)[] = [
  "widthMm",
  "bench",
  "uppers",
  "front",
  "color",
  "knobs",
  "top",
  "lighting",
];

const CODES: { [K in keyof Setup]: readonly (string | number)[] } = {
  widthMm: WIDTHS,
  bench: ["high", "low"],
  uppers: ["billy", "bohus", "bbb", "besta", "metod", "string"],
  front: FRONTS.map((f) => f.id),
  color: ["greige", "linen", "dark", "wall"],
  // First two keep their old token indices so shared links stay valid.
  knobs: KNOBS.map((k) => k.id),
  top: ["ekbacken", "mdf-painted"],
  lighting: ["none", "spots6", "spots9"],
};

export function encodeSetup(s: Setup): string {
  return FIELDS.map((f) => (CODES[f].indexOf(s[f] as never) as number).toString(36)).join("");
}

export function decodeSetup(token: string | null | undefined): Setup | null {
  if (!token || token.length !== FIELDS.length || !/^[0-9a-z]+$/.test(token)) return null;
  const out = { ...DEFAULT_SETUP };
  for (let i = 0; i < FIELDS.length; i++) {
    const f = FIELDS[i];
    const idx = parseInt(token[i], 36);
    const values = CODES[f];
    if (idx >= values.length) return null;
    (out as Record<string, unknown>)[f] = values[idx];
  }
  return out;
}

const LS_KEY = "bokhylle-setup";

export function loadSetup(): Setup {
  try {
    const fromLs = decodeSetup(localStorage.getItem(LS_KEY));
    if (fromLs) return fromLs;
  } catch {
    /* private mode etc. */
  }
  return { ...DEFAULT_SETUP };
}

export function saveSetup(s: Setup): void {
  try {
    localStorage.setItem(LS_KEY, encodeSetup(s));
  } catch {
    /* ignore */
  }
}
