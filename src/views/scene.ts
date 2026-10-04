import * as THREE from "three";
import type { Design } from "../model/types";
import { SPINES, hash, mulberry32 } from "../model/rand";
import { shade } from "../model/color";
import { doorProfileParts } from "./door-geometry";

/** Physically-based scene for the Foto view: the exact design geometry with
 * PBR materials, emissive light sources (window panel + downlights) and
 * procedural, seeded books — ready for path tracing or raster fallback. */

export interface PhotoScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

const mm = (v: number): number => v / 1000;

function mat(color: string, roughness: number, extra?: Partial<THREE.MeshPhysicalMaterialParameters>): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, ...extra });
}

function box(
  group: THREE.Group,
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), material);
  mesh.position.set(mm(x), mm(y), mm(z));
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

/** Books/vases in one shelf cell, mirroring the SVG render's art direction. */
function cellBooks(
  group: THREE.Group,
  rnd: () => number,
  x: number,
  y: number,
  w: number,
  depth: number,
  cellH: number,
): void {
  const margin = 40;
  const mode = rnd();
  const zMid = depth / 2;

  const run = (bx: number, maxW: number): number => {
    let cx = bx;
    while (cx < bx + maxW - 30) {
      const bw = 14 + rnd() * 28;
      const bh = cellH * (0.5 + rnd() * 0.32);
      const bd = depth * (0.55 + rnd() * 0.25);
      const col = SPINES[Math.floor(rnd() * SPINES.length)];
      box(group, bw, bh, bd, mat(col, 0.82), x + cx + bw / 2, y + bh / 2, zMid - (depth - bd) * 0.2);
      cx += bw + 2;
    }
    return cx;
  };

  const vase = (vx: number): void => {
    const vh = cellH * (0.3 + rnd() * 0.2);
    const geo = new THREE.CylinderGeometry(mm(vh) * 0.28, mm(vh) * 0.36, mm(vh), 20);
    const mesh = new THREE.Mesh(geo, mat(rnd() < 0.5 ? "#cdbfa8" : "#9aa39b", 0.35, { clearcoat: 0.4 }));
    mesh.position.set(mm(x + vx), mm(y + vh / 2), mm(zMid));
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
  };

  if (mode < 0.34) run(margin, w - margin * 2);
  else if (mode < 0.58) {
    const end = run(margin, (w - 2 * margin) * (0.45 + rnd() * 0.25));
    if (rnd() < 0.7) vase(end + (w - margin - end) * 0.5);
  } else if (mode < 0.74) {
    vase(margin + (w - 2 * margin) * 0.2);
    run((w - 2 * margin) * 0.4, (w - 2 * margin) * 0.55);
  } else if (mode < 0.9) {
    // Horizontal stack + object.
    let sy = 0;
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const sw = 180 + rnd() * 90;
      const sh = 25 + rnd() * 12;
      box(group, sw, sh, depth * 0.7, mat(SPINES[Math.floor(rnd() * SPINES.length)], 0.82), x + w * 0.35, y + sy + sh / 2, zMid);
      sy += sh;
    }
    if (rnd() < 0.5) vase(w * 0.65);
  } else {
    vase(w * (0.35 + rnd() * 0.3));
  }
}

export function buildPhotoScene(d: Design, forRaster: boolean): PhotoScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0d0b);
  const g = new THREE.Group();
  scene.add(g);
  const rnd = mulberry32(hash(d.id));

  const wallW = mm(d.room.wallWidthMm);
  const soffitH = mm(d.room.soffitHeightMm);

  // Room shell.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(wallW + 3, 5),
    mat("#c2a37b", 0.45, { clearcoat: 0.25, clearcoatRoughness: 0.3 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(wallW / 2, 0, 1.6);
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(wallW + 3, soffitH + 0.8), mat("#e6e0d3", 0.95));
  wall.position.set(wallW / 2, (soffitH + 0.8) / 2, -0.001);
  wall.receiveShadow = true;
  scene.add(wall);

  // Side walls to contain the light.
  const sideL = new THREE.Mesh(new THREE.PlaneGeometry(5, soffitH + 0.8), mat("#e6e0d3", 0.95));
  sideL.rotation.y = Math.PI / 2;
  sideL.position.set(-1.4, (soffitH + 0.8) / 2, 2);
  scene.add(sideL);

  // Soffit with downlights.
  const soffit = box(g, d.room.wallWidthMm + 3000, 220, 650, mat("#ece6da", 0.9), d.room.wallWidthMm / 2, d.room.soffitHeightMm + 110, 325);
  soffit.castShadow = false;
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(wallW + 3, 5), mat("#efe9dd", 0.95));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(wallW / 2, soffitH + 0.22, 1.6);
  scene.add(ceiling);

  for (let i = 0; i < 5; i++) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.035, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xfff1cf, emissive: 0xffe2ae, emissiveIntensity: 30 }),
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.set(((i + 0.5) * wallW) / 5, soffitH - 0.003, mm(d.room.downlightOffsetMm));
    scene.add(disc);
  }

  // Soft "window" key light from the left, like the reference photos.
  const windowPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 2.1),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xfdf3e2, emissiveIntensity: 7 }),
  );
  windowPanel.rotation.y = Math.PI / 2;
  windowPanel.position.set(-1.38, 1.5, 1.6);
  scene.add(windowPanel);

  if (forRaster) {
    // Raster fallback can't integrate emissive area light — add equivalents.
    const sun = new THREE.DirectionalLight(0xfdf3e2, 2.6);
    sun.position.set(-1.2, 1.9, 2.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun, new THREE.AmbientLight(0xfff6e8, 0.55));
    for (let i = 0; i < 5; i++) {
      const p = new THREE.PointLight(0xffe2ae, 1.1, 2.2, 1.6);
      p.position.set(((i + 0.5) * wallW) / 5, soffitH - 0.05, mm(d.room.downlightOffsetMm));
      scene.add(p);
    }
  }

  // The unit itself.
  for (const m of d.modules) {
    const col = m.colorHex ?? "#b4a894";
    const painted = mat(col, 0.5, { clearcoat: 0.12, clearcoatRoughness: 0.4 });
    if (m.kind === "top") {
      box(g, m.w, m.h, m.d, mat(col, 0.3, { clearcoat: 0.5, clearcoatRoughness: 0.2 }), m.x + m.w / 2, m.y + m.h / 2, m.z + m.d / 2);
      continue;
    }
    if (m.kind === "shelf") {
      // Open carcass: back + sides + shelf boards, then books.
      const t = 18;
      box(g, m.w, m.h, 16, painted, m.x + m.w / 2, m.y + m.h / 2, m.z + 8);
      const cols = m.columns ?? 1;
      const colW = (m.w - t) / cols;
      for (let c = 0; c <= cols; c++)
        box(g, t, m.h, m.d, painted, m.x + Math.min(c * colW + t / 2, m.w - t / 2), m.y + m.h / 2, m.z + m.d / 2);
      box(g, m.w, t, m.d, painted, m.x + m.w / 2, m.y + m.h - t / 2, m.z + m.d / 2);
      box(g, m.w, t, m.d, painted, m.x + m.w / 2, m.y + t / 2, m.z + m.d / 2);
      const shelves = m.shelves ?? 0;
      const cellH = (m.h - 2 * t - shelves * t) / (shelves + 1);
      for (let c = 0; c < cols; c++) {
        const cx = m.x + t + c * colW;
        for (let s2 = 0; s2 <= shelves; s2++) {
          const cy = m.y + t + s2 * (cellH + t);
          if (s2 < shelves) box(g, colW - t, t, m.d - 10, painted, cx + (colW - t) / 2, cy + cellH + t / 2, m.z + (m.d - 10) / 2);
          cellBooks(g, rnd, cx, cy, colW - t, m.d - 30, cellH);
        }
      }
      continue;
    }
    // Cabinets, fillers, plinth, panels: solid painted boxes.
    box(g, m.w, m.h, m.d, painted, m.x + m.w / 2, m.y + m.h / 2, m.z + m.d / 2);
    if (m.kind === "cabinet" && m.doors) {
      const doorMat = mat(m.doorColorHex ?? shade(col, 1.04), m.doorStyle === "gloss" ? 0.12 : 0.42, {
        clearcoat: m.doorStyle === "gloss" ? 0.9 : 0.15,
        clearcoatRoughness: m.doorStyle === "gloss" ? 0.08 : 0.35,
      });
      const dw = m.w / m.doors;
      for (let i = 0; i < m.doors; i++) {
        box(g, dw - 5, m.h - 5, 18, doorMat, m.x + (i + 0.5) * dw, m.y + m.h / 2, m.z + m.d + 9);
        // Profile parts shared with the 3D view (shaker/bevel/country).
        const cx = m.x + (i + 0.5) * dw;
        const slabFront = m.z + m.d + 18;
        for (const p of doorProfileParts(dw - 5, m.h - 5, m.doorStyle ?? "shaker")) {
          box(g, p.w, p.h, p.t, doorMat, cx + p.dx, m.y + m.h / 2 + p.dy, slabFront + p.dz);
        }
        if (m.doorKnobs ?? true) {
          const knob = new THREE.Mesh(
            new THREE.SphereGeometry(0.011, 16, 16),
            new THREE.MeshPhysicalMaterial({ color: m.knobColorHex ?? "#caa13a", metalness: m.knobColorHex === "#f2f1ec" || m.knobColorHex === "#d9d9d6" ? 0.1 : 1, roughness: 0.22 }),
          );
          const kx = i % 2 === 0 ? m.x + (i + 1) * dw - 45 : m.x + i * dw + 45;
          knob.position.set(mm(kx), mm(m.y + m.h / 2), mm(m.z + m.d + 34));
          knob.castShadow = true;
          scene.add(knob);
        }
      }
    }
  }

  // Configured MITTLED shelf spots: emissive discs light the books for real.
  const spotQty = d.extraParts.find((p) => p.itemId === "mittled-spot")?.qty ?? 0;
  const shelfMods = d.modules.filter((m) => m.kind === "shelf");
  if (spotQty > 0 && shelfMods.length > 0) {
    const sl = Math.min(...shelfMods.map((m) => m.x));
    const sr = Math.max(...shelfMods.map((m) => m.x + m.w));
    const st = Math.max(...shelfMods.map((m) => m.y + m.h));
    const sd = shelfMods[0].d;
    for (let i = 0; i < spotQty; i++) {
      const x = mm(sl + ((i + 0.5) * (sr - sl)) / spotQty);
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.024, 20),
        new THREE.MeshPhysicalMaterial({ color: 0xfff1cf, emissive: 0xffe2ae, emissiveIntensity: 22 }),
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.set(x, mm(st) - 0.028, mm(sd / 2));
      scene.add(disc);
      if (forRaster) {
        const p = new THREE.PointLight(0xffe2ae, 0.6, 1.2, 1.8);
        p.position.set(x, mm(st) - 0.06, mm(sd / 2));
        scene.add(p);
      }
    }
  }

  const camera = new THREE.PerspectiveCamera(42, 16 / 10, 0.05, 50);
  camera.position.set(wallW * 0.58, 1.35, 3.9);
  camera.lookAt(wallW * 0.47, 1.25, 0.3);
  return { scene, camera };
}
