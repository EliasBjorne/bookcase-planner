import { getItem, priceFor } from "./catalogue";

/** Width-sweep solver: for a target unit width, find the best arrangement of
 * METOD base frames and upper carcasses (V1 Bohus / V3 BILLY), with fillers. */

export interface Combo {
  /** Module widths left to right, mm. */
  widths: number[];
  sumMm: number;
  fillerMm: number; // total, split half per side
}

/** Verified frame widths only (no 20/30 cm wall frame verified at 60 cm height). */
export const BASE_WIDTHS = [800, 600, 400];
export const BILLY_WIDTHS = [800, 400];
export const BOHUS_WIDTHS = [790];

/** Best combo with sum <= target: minimal filler, then fewest modules, then
 * the most wide modules (lexicographically descending). The last rule keeps
 * base gables aligned with the 80 cm-wide uppers (BILLY/Bohus). */
export function bestCombo(targetMm: number, options: number[]): Combo {
  let best: number[] | null = null;
  const sorted = [...options].sort((a, b) => b - a);
  const maxCounts = sorted.map((w) => Math.floor(targetMm / w));

  const fill = (c: number[]): number => targetMm - c.reduce((s, w) => s + w, 0);
  /** true when a beats b under filler -> module count -> widest-first order. */
  const beats = (a: number[], b: number[]): boolean => {
    if (fill(a) !== fill(b)) return fill(a) < fill(b);
    if (a.length !== b.length) return a.length < b.length;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
    return false;
  };

  const rec = (idx: number, remaining: number, acc: number[]): void => {
    if (idx === sorted.length) {
      if (best === null || beats(acc, best)) best = [...acc];
      return;
    }
    for (let n = maxCounts[idx]; n >= 0; n--) {
      if (n * sorted[idx] > remaining) continue;
      rec(idx + 1, remaining - n * sorted[idx], [...acc, ...Array(n).fill(sorted[idx])]);
    }
  };
  rec(0, targetMm, []);

  const widths: number[] = (best ?? []) as number[];
  const sumMm = widths.reduce((s: number, w: number) => s + w, 0);
  return { widths, sumMm, fillerMm: targetMm - sumMm };
}

export interface WidthPlan {
  targetMm: number;
  base: Combo;
  baseFrameCost: number;
  baseDoorCost: number;
  baseDoors: string;
  legsCost: number;
  topCost: number;
  billy: Combo;
  billyCostFull: number;
  bohus: Combo;
  bohusCost: number;
  totalBilly: number;
  totalBohus: number;
  notes: string[];
}

const DOOR_FOR_FRAME: Record<number, { doors: number; itemId: string }> = {
  800: { doors: 2, itemId: "stensund-door-40x60" },
  600: { doors: 1, itemId: "stensund-door-60x60" },
  400: { doors: 1, itemId: "stensund-door-40x60" },
};

const FRAME_ITEM: Record<number, string> = {
  800: "metod-wall-80x37x60",
  600: "metod-wall-60x37x60",
  400: "metod-wall-40x37x60",
};

export function planWidth(targetMm: number): WidthPlan {
  const base = bestCombo(targetMm, BASE_WIDTHS);
  const billy = bestCombo(targetMm, BILLY_WIDTHS);
  const bohus = bestCombo(targetMm, BOHUS_WIDTHS);

  const baseFrameCost = base.widths.reduce(
    (s, w) => s + (getItem(FRAME_ITEM[w]).priceNok ?? 0),
    0,
  );
  const doorQty = new Map<string, number>();
  for (const w of base.widths) {
    const d = DOOR_FOR_FRAME[w];
    doorQty.set(d.itemId, (doorQty.get(d.itemId) ?? 0) + d.doors);
  }
  const baseDoorCost = [...doorQty.entries()].reduce(
    (s, [id, q]) => s + (priceFor(id, q).priceNok ?? 0),
    0,
  );
  const baseDoors = [...doorQty.entries()]
    .map(([id, q]) => `${q}× ${id.includes("60x60") ? "60×60" : "40×60"}`)
    .join(" + ");

  const legsCost = priceFor("metod-leg-8cm-2pk", base.widths.length * 4).priceNok ?? 0;
  // EKBACKEN custom-cut: priced per started length-metre.
  const topCost = Math.ceil(targetMm / 1000) * (getItem("ekbacken-custom-top").priceNok ?? 0);

  // Each 80 cm BILLY gets one extra shelf (as in V3); 40 cm BILLY priced plain.
  const billyCostFull = billy.widths.reduce(
    (s, w) =>
      s +
      (w === 800
        ? (getItem("billy-80x28x202").priceNok ?? 0) +
          (getItem("billy-extra-shelf-76x26").priceNok ?? 0)
        : (getItem("billy-40x28x202").priceNok ?? 0)),
    0,
  );

  const bohusCost = bohus.widths.length * (getItem("bohus-base-bokhylle-80").priceNok ?? 0);

  const baseTotal = baseFrameCost + baseDoorCost + legsCost + topCost;
  const notes: string[] = [];
  if (base.fillerMm > 300) notes.push(`Base: ${base.fillerMm} mm foring totalt — mye, vurder annen bredde`);
  if (billy.fillerMm > 300) notes.push(`BILLY: ${billy.fillerMm} mm foring totalt`);
  if (bohus.fillerMm > 300) notes.push(`Bohus: ${bohus.fillerMm} mm foring totalt — 790-modulen passer dårlig her`);
  if (billy.fillerMm === 0) notes.push("BILLY treffer bredden eksakt ✓");

  return {
    targetMm,
    base,
    baseFrameCost,
    baseDoorCost,
    baseDoors,
    legsCost,
    topCost,
    billy,
    billyCostFull,
    bohus,
    bohusCost,
    totalBilly: baseTotal + billyCostFull,
    totalBohus: baseTotal + bohusCost,
    notes,
  };
}

export function widthSweep(fromMm = 3000, toMm = 3600, stepMm = 100): WidthPlan[] {
  const plans: WidthPlan[] = [];
  for (let t = fromMm; t <= toMm; t += stepMm) plans.push(planWidth(t));
  return plans;
}
