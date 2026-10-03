import type { Design } from "../model/types";

/** Presentational front render, generated from the exact model dimensions.
 * Deterministic: books/decor are seeded by the design id, so the same design
 * always renders the same image. */

const S = 0.3; // mm -> px

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const SPINES = [
  "#7d6b52", "#5c6b63", "#a1674a", "#6e4a43", "#45535f", "#8c8265",
  "#d6cbb6", "#5a6e52", "#8a4f3d", "#4a4e6a", "#b5a07a", "#3f4a42",
];

const r2 = (n: number): string => n.toFixed(2);

function rect(x: number, y: number, w: number, h: number, attrs: string): string {
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" ${attrs}/>`;
}

/** One shelf cell's contents: books, objects, plants. */
function cellDecor(rnd: () => number, x: number, y: number, w: number, h: number): string {
  const parts: string[] = [];
  const m = 5;
  const baseY = y + h;
  const mode = rnd();

  const books = (bx: number, maxW: number): number => {
    let cx = bx;
    while (cx < bx + maxW - 6) {
      const bw = 3.5 + rnd() * 7.5;
      const bh = h * (0.52 + rnd() * 0.33);
      const col = SPINES[Math.floor(rnd() * SPINES.length)];
      const lean = rnd() < 0.07 && cx > bx + 14;
      parts.push(
        lean
          ? `<g transform="translate(${r2(cx + bw)},${r2(baseY)}) skewX(-9)">${rect(-bw, -bh, bw, bh, `fill="${col}"`)}</g>`
          : rect(cx, baseY - bh, bw, bh, `fill="${col}"`),
      );
      if (rnd() < 0.3) parts.push(rect(cx + bw * 0.3, baseY - (h * 0.52 + rnd() * 6) , bw * 0.18, 4, `fill="#00000022"`));
      cx += bw + 0.6;
    }
    return cx;
  };

  const vase = (vx: number): void => {
    const vh = h * (0.32 + rnd() * 0.22);
    const vw = vh * (0.5 + rnd() * 0.3);
    const col = rnd() < 0.5 ? "#cdbfa8" : "#9aa39b";
    parts.push(
      `<ellipse cx="${r2(vx)}" cy="${r2(baseY - vh / 2)}" rx="${r2(vw / 2)}" ry="${r2(vh / 2)}" fill="${col}"/>`,
      rect(vx - vw * 0.14, baseY - vh - 3, vw * 0.28, 4, `fill="${col}"`),
    );
  };

  const plant = (px: number): void => {
    const ph = h * 0.22;
    parts.push(rect(px - ph * 0.45, baseY - ph, ph * 0.9, ph, `fill="#ad9f87" rx="1.5"`));
    for (let i = 0; i < 4; i++) {
      const a = -60 + i * 38 + rnd() * 14;
      const len = ph * (0.9 + rnd() * 0.7);
      parts.push(
        `<path d="M ${r2(px)} ${r2(baseY - ph)} q ${r2(Math.sin((a * Math.PI) / 180) * len * 0.7)} ${r2(-len * 0.8)} ${r2(Math.sin((a * Math.PI) / 180) * len)} ${r2(-len)}" stroke="#6f7d62" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      );
    }
  };

  const stack = (sx: number): void => {
    let sy = baseY;
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const sw = 16 + rnd() * 10;
      const sh = 3.5 + rnd() * 2;
      sy -= sh;
      parts.push(rect(sx - sw / 2, sy, sw, sh, `fill="${SPINES[Math.floor(rnd() * SPINES.length)]}"`));
    }
    if (rnd() < 0.6) vase(sx);
  };

  if (mode < 0.32) {
    books(x + m, w - 2 * m);
  } else if (mode < 0.56) {
    const end = books(x + m, (w - 2 * m) * (0.45 + rnd() * 0.25));
    if (rnd() < 0.7) vase(end + (x + w - m - end) * 0.5);
  } else if (mode < 0.72) {
    vase(x + m + (w - 2 * m) * 0.22);
    books(x + m + (w - 2 * m) * 0.4, (w - 2 * m) * 0.6);
  } else if (mode < 0.84) {
    stack(x + w * 0.3);
    if (rnd() < 0.5) books(x + w * 0.5, w * 0.42 - m);
  } else if (mode < 0.93) {
    plant(x + w * (0.3 + rnd() * 0.4));
  } else {
    vase(x + w * (0.35 + rnd() * 0.3));
  }
  return parts.join("");
}

function shakerDoor(x: number, y: number, w: number, h: number, knobSide: "l" | "r"): string {
  const inset = Math.min(w, h) * 0.13;
  const knobX = knobSide === "r" ? x + w - inset / 2 - 1 : x + inset / 2 + 1;
  return [
    rect(x + 1, y + 1, w - 2, h - 2, `fill="url(#door)" stroke="#9a8e7a" stroke-width="1"`),
    rect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, `fill="#aea283" stroke="#978b74" stroke-width="0.8"`),
    rect(x + inset + 1, y + inset + 1, w - 2 * inset - 2, h - 2 * inset - 2, `fill="url(#panel)"`),
    `<circle cx="${r2(knobX)}" cy="${r2(y + h / 2)}" r="3.2" fill="url(#brass)"/>`,
  ].join("");
}

export function renderFront(d: Design): string {
  const rnd = mulberry32(hash(d.id));
  const wallW = d.room.wallWidthMm * S;
  const soffitY = 70; // px band above the soffit line
  const floorY = soffitY + d.room.soffitHeightMm * S;
  const H = floorY + 80;
  const W = wallW + d.room.shaftWidthMm * S;
  const X = (mm: number): number => mm * S;
  const Y = (mm: number): number => floorY - mm * S; // mm above floor -> px

  const g: string[] = [];

  // Wall, soffit face, shaft.
  g.push(rect(0, soffitY, W, floorY - soffitY, `fill="url(#wall)"`));
  g.push(rect(0, 0, W, soffitY, `fill="#efeae0"`));
  g.push(rect(0, soffitY - 1.5, W, 3, `fill="#00000018"`));
  g.push(rect(wallW, soffitY, d.room.shaftWidthMm * S, floorY - soffitY, `fill="#e3dcd0" stroke="#c9c0b0" stroke-width="1"`));
  // Floor.
  g.push(rect(0, floorY, W, H - floorY, `fill="url(#floor)"`));

  // Light pools under the soffit (downlights).
  for (let i = 0; i < 5; i++) {
    const cx = ((i + 0.5) * wallW) / 5;
    g.push(`<ellipse cx="${r2(cx)}" cy="${soffitY + 6}" rx="52" ry="30" fill="url(#glow)"/>`);
    g.push(`<circle cx="${r2(cx)}" cy="${soffitY - 25}" r="4" fill="#f5e7c0" stroke="#d8c89a" stroke-width="1"/>`);
  }

  const mods = [...d.modules];
  const runs = mods.filter((m) => ["cabinet", "shelf", "filler"].includes(m.kind));
  const unitL = Math.min(...runs.map((m) => m.x));
  const unitR = Math.max(...runs.map((m) => m.x + m.w));
  const unitTop = Math.max(...mods.map((m) => m.y + m.h));

  // Soft contact shadow behind/below the unit.
  g.push(
    `<rect x="${r2(X(unitL) - 10)}" y="${r2(Y(unitTop) - 6)}" width="${r2(X(unitR - unitL) + 20)}" height="${r2(floorY - Y(unitTop) + 10)}" fill="#00000026" filter="url(#blur)"/>`,
  );

  const order: Record<string, number> = { panel: 1, filler: 1, plinth: 1, shelf: 2, cabinet: 2, top: 3 };
  mods.sort((a, b) => (order[a.kind] ?? 2) - (order[b.kind] ?? 2));

  for (const m of mods) {
    const x = X(m.x);
    const y = Y(m.y + m.h);
    const w = m.w * S;
    const h = m.h * S;
    const col = m.colorHex ?? "#b4a894";

    if (m.kind === "plinth") {
      g.push(rect(x, y, w, h, `fill="#948871"`));
      continue;
    }
    if (m.kind === "top") {
      g.push(rect(x - 2, y, w + 4, h, `fill="url(#worktop)" stroke="#9a8e7a" stroke-width="0.8"`));
      g.push(rect(x - 2, y + h, w + 4, 4, `fill="#00000020"`));
      continue;
    }
    if (m.kind === "panel" || m.kind === "filler") {
      g.push(rect(x, y, w, h, `fill="${col}" stroke="#9a8e7a" stroke-width="0.7"`));
      continue;
    }
    if (m.kind === "cabinet") {
      g.push(rect(x, y, w, h, `fill="${col}" stroke="#9a8e7a" stroke-width="0.9"`));
      const doors = m.doors ?? 1;
      const dw = w / doors;
      for (let i = 0; i < doors; i++) {
        g.push(shakerDoor(x + i * dw, y, dw, h, i % 2 === 0 ? "r" : "l"));
      }
      continue;
    }
    // Open shelving: carcass, columns of cells with shelves and decor.
    g.push(rect(x, y, w, h, `fill="${col}" stroke="#9a8e7a" stroke-width="0.9"`));
    const cols = m.columns ?? 1;
    const shelves = m.shelves ?? 0;
    const t = 5; // visual carcass thickness px
    const colW = (w - t * 2 - (cols - 1) * t) / cols;
    const cellH = (h - t * 2 - shelves * t) / (shelves + 1);
    for (let c = 0; c < cols; c++) {
      const cx = x + t + c * (colW + t);
      for (let s = 0; s <= shelves; s++) {
        const cy = y + t + s * (cellH + t);
        g.push(rect(cx, cy, colW, cellH, `fill="url(#cell)"`));
        g.push(cellDecor(rnd, cx, cy, colW, cellH));
        if (s < shelves)
          g.push(rect(cx - 1, cy + cellH, colW + 2, t, `fill="#bdb19b" stroke="#9a8e7a" stroke-width="0.5"`));
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(W)} ${Math.ceil(H)}" data-testid="render-svg">
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#eae4d8"/><stop offset="1" stop-color="#dcd4c4"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d4bf9f"/><stop offset="1" stop-color="#c3ab87"/>
  </linearGradient>
  <linearGradient id="cell" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8e8370"/><stop offset="0.25" stop-color="#9c9180"/><stop offset="1" stop-color="#a89d8a"/>
  </linearGradient>
  <linearGradient id="door" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#bcb09a"/><stop offset="1" stop-color="#b0a48d"/>
  </linearGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b7ab94"/><stop offset="1" stop-color="#ada289"/>
  </linearGradient>
  <linearGradient id="worktop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d8cdb6"/><stop offset="1" stop-color="#c6bAA2"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#fff3cf" stop-opacity="0.5"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></radialGradient>
  <radialGradient id="brass"><stop offset="0" stop-color="#e3c268"/><stop offset="1" stop-color="#a07f2c"/></radialGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
${g.join("\n")}
</svg>`;
}

export function renderHtml(d: Design): string {
  return `
  <div class="render-actions"><button id="dl-render">Last ned PNG</button></div>
  <div class="render-wrap" data-testid="render-view">${renderFront(d)}</div>
  <p class="note">Generert direkte fra modellens eksakte mål (bøker/pynt er prosedural staffasje,
  deterministisk per variant). Dette er geometrien slik den faktisk blir — i motsetning til AI-renderet.</p>`;
}

export function wireRender(root: HTMLElement, d: Design): void {
  root.querySelector("#dl-render")?.addEventListener("click", () => {
    const svg = root.querySelector('[data-testid="render-svg"]')!;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${d.id}-render.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
