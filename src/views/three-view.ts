import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Design } from "../model/types";
import { doorProfileParts } from "./door-geometry";

/** 3D preview. Scene units = metres; origin at the left wall corner, floor level. */
export class ThreeView {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private designGroup = new THREE.Group();
  private raf = 0;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xf2efe9);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 100);
    this.camera.position.set(1.8, 1.7, 4.2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(1.8, 1.1, 0.3);

    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.2);
    sun.position.set(2, 3, 4);
    this.scene.add(amb, sun, this.designGroup);

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.animate();
  }

  private resize(): void {
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 500;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private animate = (): void => {
    this.raf = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
    this.container.innerHTML = "";
  }

  private box(
    wMm: number,
    hMm: number,
    dMm: number,
    color: string,
    opacity = 1,
  ): THREE.Group {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(wMm / 1000, hMm / 1000, dMm / 1000);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      transparent: opacity < 1,
      opacity,
    });
    g.add(new THREE.Mesh(geo, mat));
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x4a4238 }),
    );
    g.add(edges);
    return g;
  }

  show(d: Design): void {
    this.designGroup.clear();

    const wallW = d.room.wallWidthMm / 1000;
    const soffitH = d.room.soffitHeightMm / 1000;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(wallW + 1.2, 3.4),
      new THREE.MeshStandardMaterial({ color: 0xd8c9ae, roughness: 0.9 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(wallW / 2, 0, 1.4);
    this.designGroup.add(floor);

    // Back wall (slightly taller than the soffit so the nedhakk reads).
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallW + 1.2, soffitH + 0.5),
      new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 1 }),
    );
    wall.position.set(wallW / 2, (soffitH + 0.5) / 2, -0.005);
    this.designGroup.add(wall);

    // Soffit slab with downlights.
    const soffit = this.box(d.room.wallWidthMm + 1200, 180, 600, "#efe9df");
    soffit.position.set(wallW / 2, soffitH + 0.09, 0.3);
    this.designGroup.add(soffit);
    for (let i = 0; i < 5; i++) {
      const dl = new THREE.Mesh(
        new THREE.CircleGeometry(0.035, 24),
        new THREE.MeshBasicMaterial({ color: 0xffe9b0 }),
      );
      dl.rotation.x = Math.PI / 2;
      dl.position.set(((i + 0.5) * wallW) / 5, soffitH - 0.002, d.room.downlightOffsetMm / 1000);
      this.designGroup.add(dl);
    }

    // Configured MITTLED shelf spots: small glowing discs + warm point lights.
    const spotQty = d.extraParts.find((p) => p.itemId === "mittled-spot")?.qty ?? 0;
    const shelfMods = d.modules.filter((m) => m.kind === "shelf");
    if (spotQty > 0 && shelfMods.length > 0) {
      const sl = Math.min(...shelfMods.map((m) => m.x));
      const sr = Math.max(...shelfMods.map((m) => m.x + m.w));
      const st = Math.max(...shelfMods.map((m) => m.y + m.h));
      const sd = shelfMods[0].d;
      for (let i = 0; i < spotQty; i++) {
        const x = (sl + ((i + 0.5) * (sr - sl)) / spotQty) / 1000;
        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(0.03, 20),
          new THREE.MeshBasicMaterial({ color: 0xffe9b8 }),
        );
        disc.rotation.x = Math.PI / 2;
        disc.position.set(x, st / 1000 - 0.03, sd / 2000);
        this.designGroup.add(disc);
        const p = new THREE.PointLight(0xffe2ae, 0.55, 1.2, 1.8);
        p.position.set(x, st / 1000 - 0.06, sd / 2000);
        this.designGroup.add(p);
      }
    }

    // Shaft at the right end of the free wall.
    const shaft = this.box(d.room.shaftWidthMm, d.room.soffitHeightMm, d.room.shaftDepthMm, "#e8e2d8");
    shaft.position.set(wallW + d.room.shaftWidthMm / 2000, soffitH / 2, d.room.shaftDepthMm / 2000);
    this.designGroup.add(shaft);

    // Modules. Open shelving renders as a translucent carcass with solid
    // shelf boards and dividers inside, so it reads as open, not as a slab.
    for (const m of d.modules) {
      const open = m.kind === "shelf";
      const b = this.box(m.w, m.h, m.d, m.colorHex ?? "#cfc6b8", open ? 0.3 : 1);
      b.position.set(
        (m.x + m.w / 2) / 1000,
        (m.y + m.h / 2) / 1000,
        (m.z + m.d / 2) / 1000,
      );
      this.designGroup.add(b);

      // Door fronts (colour/profile follow the configured front).
      if (m.kind === "cabinet" && m.doors) {
        const dw = m.w / m.doors;
        const style = m.doorStyle ?? "shaker";
        for (let i = 0; i < m.doors; i++) {
          const door = this.box(dw - 6, m.h - 6, 18, m.doorColorHex ?? "#bcb09c");
          door.position.set(
            (m.x + (i + 0.5) * dw) / 1000,
            (m.y + m.h / 2) / 1000,
            (m.z + m.d + 9) / 1000,
          );
          this.designGroup.add(door);
          // Profile parts shared with the Foto scene (shaker/bevel/country).
          const cx = m.x + (i + 0.5) * dw;
          const slabFront = m.z + m.d + 18;
          for (const p of doorProfileParts(dw - 6, m.h - 6, style)) {
            const strip = this.box(p.w, p.h, p.t, m.doorColorHex ?? "#bcb09c");
            strip.position.set((cx + p.dx) / 1000, (m.y + m.h / 2 + p.dy) / 1000, (slabFront + p.dz) / 1000);
            this.designGroup.add(strip);
          }
          if (m.doorKnobs ?? true) {
            const knob = new THREE.Mesh(
              new THREE.SphereGeometry(0.011, 12, 12),
              new THREE.MeshStandardMaterial({ color: m.knobColorHex ?? "#c9a227", metalness: 0.7, roughness: 0.3 }),
            );
            const kx = i % 2 === 0 ? m.x + (i + 1) * dw - 40 : m.x + i * dw + 40;
            knob.position.set(kx / 1000, (m.y + m.h / 2) / 1000, (m.z + m.d + 32) / 1000);
            this.designGroup.add(knob);
          }
        }
      }

      if (open) {
        const cols = m.columns ?? 1;
        const colW = m.w / cols;
        for (let c = 0; c < cols; c++) {
          for (let s = 1; s <= (m.shelves ?? 0); s++) {
            const board = this.box(colW - 36, 18, m.d - 20, "#9c9183");
            board.position.set(
              (m.x + (c + 0.5) * colW) / 1000,
              (m.y + (s * m.h) / ((m.shelves ?? 0) + 1)) / 1000,
              (m.z + m.d / 2) / 1000,
            );
            this.designGroup.add(board);
          }
        }
        for (let c = 0; c <= cols; c++) {
          const divider = this.box(18, m.h, m.d - 10, "#a89c88");
          divider.position.set(
            (m.x + Math.min(Math.max(c * colW, 9), m.w - 9)) / 1000,
            (m.y + m.h / 2) / 1000,
            (m.z + m.d / 2) / 1000,
          );
          this.designGroup.add(divider);
        }
      }
    }
  }
}
