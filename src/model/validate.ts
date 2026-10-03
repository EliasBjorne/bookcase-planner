import type { Design, Module, Violation } from "./types";
import { getItem } from "./catalogue";

/** Modules that occupy width in the main run (not cladding/top/plinth). */
function runModules(d: Design): Module[] {
  return d.modules.filter((m) => ["cabinet", "shelf", "filler"].includes(m.kind));
}

const right = (m: Module) => m.x + m.w;
const top = (m: Module) => m.y + m.h;

/** Check the horizontal band of run modules crossing height y. */
function checkBand(d: Design, atY: number, label: string, v: Violation[]): void {
  const mods = runModules(d)
    .filter((m) => m.y <= atY && top(m) > atY)
    .sort((a, b) => a.x - b.x);
  if (mods.length === 0) return;

  const sum = mods.reduce((s, m) => s + m.w, 0);
  if (sum - d.targetWidthMm > 1) {
    v.push({
      level: "error",
      message: `${label}: widths sum to ${sum} mm — ${sum - d.targetWidthMm} mm wider than the ${d.targetWidthMm} mm target`,
    });
  } else if (d.targetWidthMm - sum > 1) {
    v.push({
      level: "warning",
      message: `${label}: widths sum to ${sum} mm — ${d.targetWidthMm - sum} mm short of the ${d.targetWidthMm} mm target (close with filler/frame)`,
    });
  }
  for (let i = 1; i < mods.length; i++) {
    const gap = mods[i].x - right(mods[i - 1]);
    if (gap < 0)
      v.push({
        level: "error",
        message: `${label}: ${mods[i - 1].label} and ${mods[i].label} overlap by ${-gap} mm`,
      });
    else if (gap > 1)
      v.push({
        level: "warning",
        message: `${label}: ${gap} mm gap between ${mods[i - 1].label} and ${mods[i].label}`,
      });
  }
}

export function validate(d: Design): Violation[] {
  const v: Violation[] = [];

  // 1. Nothing may leave the free wall or pass the soffit.
  for (const m of d.modules) {
    if (m.x < 0 || right(m) > d.room.wallWidthMm) {
      v.push({
        level: "error",
        moduleId: m.id,
        message: `${m.label}: outside the free wall (x ${m.x}–${right(m)} mm vs wall ${d.room.wallWidthMm} mm)`,
      });
    }
    if (top(m) > d.room.soffitHeightMm) {
      v.push({
        level: "error",
        moduleId: m.id,
        message: `${m.label}: passes the soffit (top at ${top(m)} mm vs ${d.room.soffitHeightMm} mm)`,
      });
    }
  }

  // 2. Width coverage: one sample through the base, one through the uppers.
  const runs = runModules(d);
  if (runs.length > 0) {
    const baseTop = Math.min(...runs.map(top));
    checkBand(d, Math.max(...runs.map((m) => m.y)) + 1, "Upper band", v);
    checkBand(d, baseTop - 1, "Base band", v);
  }

  // 3. Catalogue-sourced modules must match catalogue dimensions unless cut.
  for (const m of d.modules) {
    if (m.source.type !== "catalogue") continue;
    const item = getItem(m.source.itemId);
    const across = m.unitsAcross ?? 1;
    const checks: [number, number, string][] = [
      [m.w, item.widthMm * across, "width"],
      [m.d, item.depthMm, "depth"],
      [m.h, item.heightMm, "height"],
    ];
    for (const [val, cat, label] of checks) {
      if (cat === 0) continue;
      if (val !== cat && !m.cut) {
        v.push({
          level: "error",
          moduleId: m.id,
          message: `${m.label}: ${label} ${val} mm differs from catalogue ${cat} mm and no cut instruction is given`,
        });
      }
    }
    if (!item.verified)
      v.push({
        level: "info",
        moduleId: m.id,
        message: `${m.label}: ${item.name} is unverified — ${item.notes ?? "check before ordering"}`,
      });
  }
  for (const p of d.extraParts) {
    const item = getItem(p.itemId);
    if (!item.verified)
      v.push({
        level: "info",
        message: `${p.label ?? item.name}: unverified — ${item.notes ?? "check before ordering"}`,
      });
  }

  // 4. Headroom left above the tallest module (crown/scribe space).
  const maxTop = Math.max(...d.modules.map(top));
  const headroom = d.room.soffitHeightMm - maxTop;
  if (headroom > 0)
    v.push({
      level: "info",
      message: `${headroom} mm between unit top (${maxTop} mm) and soffit — close with crown/scribe, measure on site.`,
    });

  return v;
}

/** Count carcasses the installer must cut (the custom-cut worktop is cut by the supplier). */
export function cutCount(d: Design): number {
  return d.modules.filter((m) => m.cut && m.source.type === "catalogue" && m.kind !== "top").length;
}
