import type { Design, Module } from "../model/types";

/** Front + side elevation as a standalone SVG string, dimensioned in mm. */

const S = 0.22; // mm -> px
const PAD = 150;

function px(mm: number): number {
  return mm * S;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function rect(x: number, y: number, w: number, h: number, fill: string, cls = ""): string {
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" class="mod ${cls}"/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, cls = "thin"): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${cls}"/>`;
}

function text(x: number, y: number, s: string, cls = "dim-t", anchor = "middle"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="${cls}">${esc(s)}</text>`;
}

/** Horizontal dimension line with end ticks and centred label. */
function hDim(x1: number, x2: number, y: number, label: string): string {
  return [
    line(x1, y - 4, x1, y + 4, "dim"),
    line(x2, y - 4, x2, y + 4, "dim"),
    line(x1, y, x2, y, "dim"),
    text((x1 + x2) / 2, y - 3, label),
  ].join("");
}

/** Vertical dimension line; label on the right by default, left with side="left". */
function vDim(x: number, y1: number, y2: number, label: string, side: "left" | "right" = "right"): string {
  const tx = side === "right" ? x + 6 : x - 6;
  return [
    line(x - 4, y1, x + 4, y1, "dim"),
    line(x - 4, y2, x + 4, y2, "dim"),
    line(x, y1, x, y2, "dim"),
    `<text x="${tx.toFixed(1)}" y="${((y1 + y2) / 2).toFixed(1)}" class="dim-t" text-anchor="${side === "right" ? "start" : "end"}" dominant-baseline="middle">${esc(label)}</text>`,
  ].join("");
}

function drawModuleFront(m: Module, oy: number): string {
  const x = PAD + px(m.x);
  const y = oy - px(m.y + m.h);
  const w = px(m.w);
  const h = px(m.h);
  const parts: string[] = [rect(x, y, w, h, m.colorHex ?? "#cfc6b8")];

  if (m.doors) {
    const dw = w / m.doors;
    for (let i = 0; i < m.doors; i++) {
      const dx = x + i * dw;
      parts.push(rect(dx + 3, y + 3, dw - 6, h - 6, "none", "door"));
      const knobX = i % 2 === 0 ? dx + dw - 8 : dx + 8;
      parts.push(`<circle cx="${knobX.toFixed(1)}" cy="${(y + h / 2).toFixed(1)}" r="1.6" class="knob"/>`);
    }
  }
  const cols = m.columns ?? 0;
  if (cols > 1) {
    const cw = w / cols;
    for (let i = 1; i < cols; i++) parts.push(line(x + i * cw, y, x + i * cw, y + h, "div"));
  }
  const shelves = m.shelves ?? 0;
  if (shelves > 0 && m.kind === "shelf") {
    const sh = h / (shelves + 1);
    for (let i = 1; i <= shelves; i++) parts.push(line(x, y + i * sh, x + w, y + i * sh, "div"));
  }
  return parts.join("");
}

export function frontElevation(d: Design): string {
  const W = PAD * 2 + px(d.room.wallWidthMm + d.room.shaftWidthMm) + 80;
  const oy = PAD / 2 + px(d.room.soffitHeightMm); // floor line in px
  const H = oy + 110;

  const runs = d.modules.filter((m) => ["cabinet", "shelf", "filler"].includes(m.kind));
  const base = runs.filter((m) => m.kind === "cabinet");
  const baseTop = base.length ? Math.max(...base.map((m) => m.y + m.h)) : 0;
  const unitTop = Math.max(...d.modules.map((m) => m.y + m.h));
  const unitL = Math.min(...runs.map((m) => m.x));
  const unitR = Math.max(...runs.map((m) => m.x + m.w));
  const top = d.modules.find((m) => m.kind === "top");
  const plinth = d.modules.find((m) => m.kind === "plinth");

  const g: string[] = [];
  // Room: floor, soffit underside, shaft at the right end.
  g.push(line(PAD - 30, oy, W - 20, oy, "wall"));
  g.push(line(PAD - 30, oy - px(d.room.soffitHeightMm), W - 20, oy - px(d.room.soffitHeightMm), "wall"));
  g.push(
    `<rect x="${(PAD + px(d.room.wallWidthMm)).toFixed(1)}" y="${(oy - px(d.room.soffitHeightMm)).toFixed(1)}" width="${px(d.room.shaftWidthMm).toFixed(1)}" height="${px(d.room.soffitHeightMm).toFixed(1)}" class="shaft"/>`,
  );
  g.push(text(PAD + px(d.room.wallWidthMm + d.room.shaftWidthMm / 2), oy - px(d.room.soffitHeightMm) + 14, "sjakt", "note-t"));

  // Modules, back-to-front by kind so fronts draw over carcasses.
  const order: Record<string, number> = { panel: 0, shelf: 1, cabinet: 1, filler: 2, plinth: 2, top: 3 };
  for (const m of [...d.modules].sort((a, b) => (order[a.kind] ?? 1) - (order[b.kind] ?? 1))) {
    g.push(drawModuleFront(m, oy));
  }

  // Dimensions: module-width chain, overall width, wall width.
  let chainY = oy + 26;
  const bandMods = runs.filter((m) => m.y < baseTop).sort((a, b) => a.x - b.x);
  for (const m of bandMods) g.push(hDim(PAD + px(m.x), PAD + px(m.x + m.w), chainY, `${m.w}`));
  chainY += 26;
  g.push(hDim(PAD + px(unitL), PAD + px(unitR), chainY, `${unitR - unitL} mm møbel`));
  chainY += 26;
  g.push(hDim(PAD, PAD + px(d.room.wallWidthMm), chainY, `${d.room.wallWidthMm} mm fri vegg (kontrollmål!)`));

  // Heights on the left: plinth, base, top board, uppers, soffit.
  const hx = PAD - 36;
  if (plinth) g.push(vDim(hx, oy, oy - px(plinth.h), `${plinth.h}`));
  if (base.length)
    g.push(vDim(hx, oy - px(plinth?.h ?? 0), oy - px(baseTop), `${baseTop - (plinth?.h ?? 0)}`));
  if (top) g.push(vDim(hx - 26, oy, oy - px(top.y + top.h), `${top.y + top.h} o.k. benk`, "left"));
  g.push(vDim(hx, oy - px(top ? top.y + top.h : baseTop), oy - px(unitTop), `${unitTop - (top ? top.y + top.h : baseTop)}`));
  const sx = PAD + px(d.room.wallWidthMm + d.room.shaftWidthMm) + 30;
  g.push(vDim(sx, oy, oy - px(d.room.soffitHeightMm), `${d.room.soffitHeightMm} til nedhakk`));

  return svgDoc(W, H, g.join("\n"), `${d.name} — front`);
}

const KIND_NO: Record<string, string> = {
  cabinet: "skrog",
  shelf: "hylle",
  top: "benkeplate",
  plinth: "sokkel",
  panel: "gesims",
};

export function sideElevation(d: Design): string {
  const maxD = Math.max(...d.modules.map((m) => m.z + m.d));
  const W = Math.max(560, PAD * 2 + px(maxD) + 220);
  const oy = PAD / 2 + px(d.room.soffitHeightMm);
  const H = oy + 80;

  const g: string[] = [];
  // Wall at left, floor, soffit.
  g.push(line(PAD, oy - px(d.room.soffitHeightMm) - 10, PAD, oy, "wall"));
  g.push(line(PAD - 10, oy, PAD + px(maxD) + 60, oy, "wall"));
  g.push(line(PAD, oy - px(d.room.soffitHeightMm), PAD + px(maxD) + 60, oy - px(d.room.soffitHeightMm), "wall"));
  // Downlight marker in the soffit.
  const dlX = PAD + px(d.room.downlightOffsetMm);
  const dlY = oy - px(d.room.soffitHeightMm);
  g.push(`<circle cx="${dlX.toFixed(1)}" cy="${dlY.toFixed(1)}" r="3" class="dl"/>`);
  g.push(text(dlX + 10, dlY + 16, `downlight ~${d.room.downlightOffsetMm} mm fra vegg`, "note-t", "start"));

  // Unique depth profiles (one rect per module silhouette).
  for (const m of d.modules) {
    if (m.kind === "filler") continue;
    g.push(rect(PAD + px(m.z), oy - px(m.y + m.h), px(m.d), px(m.h), (m.colorHex ?? "#cfc6b8") + "cc"));
  }

  // Depth dims.
  let dy = oy + 24;
  const depths = new Map<string, [number, number]>();
  for (const m of d.modules) {
    if (m.kind === "cabinet" || m.kind === "shelf" || m.kind === "top") {
      const key = `${m.kind}:${m.z}-${m.d}`;
      if (!depths.has(key)) depths.set(key, [m.z, m.d]);
    }
  }
  for (const [key, [z, depth]] of depths) {
    g.push(hDim(PAD + px(z), PAD + px(z + depth), dy, `${depth} ${KIND_NO[key.split(":")[0]] ?? ""}`));
    dy += 22;
  }
  g.push(vDim(PAD + px(maxD) + 40, oy, oy - px(d.room.soffitHeightMm), `${d.room.soffitHeightMm}`));

  return svgDoc(W, H, g.join("\n"), `${d.name} — side`);
}

function svgDoc(w: number, h: number, body: string, title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" font-family="system-ui, sans-serif">
<style>
  .mod { stroke: #4a4238; stroke-width: 1; }
  .door { stroke: #6b6050; stroke-width: 0.8; fill: none; }
  .knob { fill: #a08030; }
  .div { stroke: #6b6050; stroke-width: 0.6; }
  .thin { stroke: #888; stroke-width: 0.5; }
  .wall { stroke: #222; stroke-width: 1.6; }
  .shaft { fill: #e8e2d8; stroke: #222; stroke-width: 1; }
  .dim { stroke: #0a66a8; stroke-width: 0.7; }
  .dim-t { fill: #0a66a8; font-size: 10px; }
  .note-t { fill: #777; font-size: 9px; }
  .title-t { fill: #222; font-size: 13px; font-weight: 600; }
  .dl { fill: #e8b33a; stroke: #946f0f; }
</style>
<rect width="100%" height="100%" fill="white"/>
<text x="16" y="22" class="title-t">${esc(title)} — mål i mm</text>
<text x="16" y="38" class="note-t">Alle kappmål kontrollmåles på stedet</text>
${body}
</svg>`;
}
