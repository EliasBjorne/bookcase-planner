import * as THREE from "three";
import { WebGLPathTracer } from "three-gpu-pathtracer";
import type { Design } from "../model/types";
import { buildPhotoScene } from "./scene";

/** "Foto": progressive path-traced image of the exact model — physically
 * simulated light, no AI guesswork. Falls back to a shadowed raster render
 * where WebGL2/GPU is not up to it. */

const TARGET_SAMPLES = 220;

export function photoHtml(): string {
  return `
  <div class="photo-wrap">
    <div class="photo-canvas" id="photo-canvas" data-testid="photo-canvas"></div>
    <div class="photo-bar">
      <span id="photo-status" data-testid="photo-status">Starter lysberegning …</span>
      <button id="photo-save">Last ned PNG</button>
    </div>
    <p class="note">Fysisk lysberegning (path tracing) av modellens eksakte geometri — bøker/pynt er
    prosedural staffasje. Bildet forfines gradvis; la det stå noen sekunder.</p>
  </div>`;
}

export class PhotoView {
  private renderer: THREE.WebGLRenderer;
  private raf = 0;
  private pt: WebGLPathTracer | null = null;

  constructor(container: HTMLElement, status: HTMLElement, design: Design) {
    const w = Math.min(container.clientWidth || 960, 1280);
    const h = Math.round(w * 0.625);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    container.appendChild(this.renderer.domElement);

    const gl2 = this.renderer.getContext() instanceof WebGL2RenderingContext;
    if (gl2) {
      try {
        const { scene, camera } = buildPhotoScene(design, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        this.pt = new WebGLPathTracer(this.renderer);
        this.pt.bounces = 5;
        this.pt.renderScale = Math.min(1, 900 / w);
        this.pt.tiles.set(2, 2);
        this.pt.setScene(scene, camera);
        const loop = (): void => {
          if (this.pt!.samples < TARGET_SAMPLES) {
            this.pt!.renderSample();
            status.textContent = `Fysisk lysberegning · ${Math.floor(this.pt!.samples)} / ${TARGET_SAMPLES} samples`;
            this.raf = requestAnimationFrame(loop);
          } else {
            status.textContent = `Ferdig · ${TARGET_SAMPLES} samples`;
          }
        };
        loop();
        return;
      } catch (e) {
        console.warn("Path tracer failed, falling back to raster:", e);
        this.pt = null;
      }
    }
    // Raster fallback.
    const { scene, camera } = buildPhotoScene(design, true);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.render(scene, camera);
    status.textContent = "Forenklet lys (maskinen støtter ikke path tracing)";
  }

  savePng(name: string): void {
    const a = document.createElement("a");
    a.href = this.renderer.domElement.toDataURL("image/png");
    a.download = name;
    a.click();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.pt?.dispose();
    this.renderer.dispose();
  }
}

export function mountPhoto(content: HTMLElement, design: Design): PhotoView {
  const container = content.querySelector<HTMLElement>("#photo-canvas")!;
  const status = content.querySelector<HTMLElement>("#photo-status")!;
  const view = new PhotoView(container, status, design);
  content.querySelector("#photo-save")?.addEventListener("click", () => view.savePng(`${design.id}-foto.png`));
  return view;
}
