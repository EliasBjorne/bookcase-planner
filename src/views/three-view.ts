import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Design } from "../model/types";

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
