import "./style.css";
import { DESIGNS } from "./designs/variants";
import { frontElevation, sideElevation } from "./views/elevation";
import { ThreeView } from "./views/three-view";
import { partsHtml, violationsHtml } from "./views/parts";
import { compareHtml } from "./views/compare";
import { handoffHtml, wireHandoff } from "./views/handoff";
import { renderHtml, wireRender } from "./views/render";
import { widthsHtml } from "./views/widths";

type ViewId = "3d" | "render" | "tegning" | "deler" | "handoff" | "sammenlikn" | "bredder";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "3d", label: "3D" },
  { id: "render", label: "Render" },
  { id: "tegning", label: "Tegninger" },
  { id: "deler", label: "Deleliste" },
  { id: "handoff", label: "IKEA-overlevering" },
  { id: "sammenlikn", label: "Sammenlikn alle" },
  { id: "bredder", label: "Bredder 300–360" },
];

const content = document.getElementById("content")!;
const designNav = document.getElementById("design-nav")!;
const viewNav = document.getElementById("view-nav")!;
const violations = document.getElementById("violations")!;

let threeView: ThreeView | null = null;

function parseHash(): { designId: string; view: ViewId } {
  const [, designId = DESIGNS[0].id, view = "3d"] = window.location.hash.split("/");
  return {
    designId: DESIGNS.some((d) => d.id === designId) ? designId : DESIGNS[0].id,
    view: (VIEWS.some((v) => v.id === view) ? view : "3d") as ViewId,
  };
}

function render(): void {
  const { designId, view } = parseHash();
  const design = DESIGNS.find((d) => d.id === designId)!;

  const globalView = view === "sammenlikn" || view === "bredder";
  designNav.innerHTML = DESIGNS.map(
    (d) =>
      `<a href="#/${d.id}/${globalView ? "3d" : view}" class="${d.id === designId && !globalView ? "active" : ""}" data-testid="nav-${d.id}">${d.name}</a>`,
  ).join("");

  viewNav.innerHTML = VIEWS.map(
    (v) => `<a href="#/${designId}/${v.id}" class="${v.id === view ? "active" : ""}" data-testid="view-${v.id}">${v.label}</a>`,
  ).join("");

  violations.innerHTML = globalView ? "" : violationsHtml(design);

  threeView?.dispose();
  threeView = null;

  const header = `
    <h2>${design.name}</h2>
    <p class="design-desc">${design.description}</p>
    <div class="verdict-box"><strong>Verdict:</strong> ${design.verdict}</div>`;

  switch (view) {
    case "3d": {
      content.innerHTML = `${header}<div id="three-container" data-testid="three-container"></div>`;
      threeView = new ThreeView(document.getElementById("three-container")!);
      threeView.show(design);
      break;
    }
    case "tegning": {
      content.innerHTML = `${header}
        <div class="elevation-wrap" data-testid="front-elevation">${frontElevation(design)}</div>
        <div class="elevation-wrap" data-testid="side-elevation">${sideElevation(design)}</div>
        <button id="print-page">Skriv ut (PDF)</button>`;
      document.getElementById("print-page")?.addEventListener("click", () => window.print());
      break;
    }
    case "deler": {
      content.innerHTML = `${header}${partsHtml(design)}`;
      break;
    }
    case "handoff": {
      content.innerHTML = `${header}${handoffHtml(design)}`;
      wireHandoff(content, design);
      break;
    }
    case "render": {
      content.innerHTML = `${header}${renderHtml(design)}`;
      wireRender(content, design);
      break;
    }
    case "sammenlikn": {
      content.innerHTML = compareHtml(DESIGNS);
      break;
    }
    case "bredder": {
      content.innerHTML = widthsHtml();
      break;
    }
  }
}

window.addEventListener("hashchange", render);
render();
