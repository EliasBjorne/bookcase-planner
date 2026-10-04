import "./style.css";
import type { Design } from "./model/types";
import { DESIGNS } from "./designs/variants";
import { buildDesign } from "./model/build";
import { partsList } from "./model/cost";
import {
  decodeSetup,
  encodeSetup,
  loadSetup,
  saveSetup,
  type Setup,
} from "./model/setup";
import { frontElevation, sideElevation } from "./views/elevation";
import { ThreeView } from "./views/three-view";
import { partsHtml, violationsHtml } from "./views/parts";
import { compareHtml } from "./views/compare";
import { handoffHtml, wireHandoff } from "./views/handoff";
import { renderHtml, wireRender } from "./views/render";
import { widthsHtml } from "./views/widths";
import { decisionsHtml } from "./views/decisions";
import { STEPS, wizardHtml, wireWizard } from "./views/wizard";

type ViewId = "render" | "3d" | "tegning" | "deler" | "handoff";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "render", label: "Render" },
  { id: "3d", label: "3D" },
  { id: "tegning", label: "Tegninger" },
  { id: "deler", label: "Deleliste" },
  { id: "handoff", label: "IKEA-overlevering" },
];

const GLOBALS: { id: string; label: string }[] = [
  { id: "sammenlikn", label: "Sammenlikn forslagene" },
  { id: "bredder", label: "Bredder 300–360" },
  { id: "beslutninger", label: "Beslutninger" },
];

const content = document.getElementById("content")!;
const sidebar = document.getElementById("sidebar")!;
let threeView: ThreeView | null = null;
let setup: Setup = loadSetup();

const nok = (n: number): string => `${n.toLocaleString("no")} kr`;

interface Route {
  page: "wizard" | "din" | "preset" | "global";
  step: number;
  view: ViewId;
  designId: string;
  globalId: string;
}

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, query] = hash.split("?");
  // Shared setup token: #/din/render?s=01020100
  const token = new URLSearchParams(query ?? "").get("s");
  const shared = decodeSetup(token);
  if (shared) {
    setup = shared;
    saveSetup(setup);
  }
  const parts = path.split("/").filter(Boolean);
  const [a, b] = parts;

  if (!a || a === "bygg") {
    const step = Math.min(Math.max(Number(b) || 0, 0), STEPS.length - 1);
    return { page: "wizard", step, view: "render", designId: "", globalId: "" };
  }
  if (a === "din") {
    const view = (VIEWS.some((v) => v.id === b) ? b : "render") as ViewId;
    return { page: "din", step: 0, view, designId: "", globalId: "" };
  }
  if (GLOBALS.some((g) => g.id === a)) {
    return { page: "global", step: 0, view: "render", designId: "", globalId: a };
  }
  const designId = DESIGNS.some((d) => d.id === a) ? a : DESIGNS[0].id;
  const view = (VIEWS.some((v) => v.id === b) ? b : "render") as ViewId;
  return { page: "preset", step: 0, view, designId, globalId: "" };
}

function renderSidebar(route: Route): void {
  const total = (() => {
    try {
      return nok(partsList(buildDesign(setup)).totalNok);
    } catch {
      return "—";
    }
  })();

  sidebar.innerHTML = `
    <h1>Bokhylle<br/>planner</h1>
    <p class="sub">Stue — vegg 360.2 × 238 cm</p>
    <a class="btn cta ${route.page === "wizard" ? "active" : ""}" href="#/bygg/0" data-testid="nav-bygg">Bygg din løsning</a>
    <a class="din-link ${route.page === "din" ? "active" : ""}" href="#/din/render" data-testid="nav-din">
      Din løsning <span class="din-total">${total}</span>
    </a>
    <nav>
      ${GLOBALS.map(
        (g) =>
          `<a href="#/${g.id}" class="${route.globalId === g.id ? "active" : ""}" data-testid="nav-${g.id}">${g.label}</a>`,
      ).join("")}
    </nav>
    <details class="presets" ${route.page === "preset" ? "open" : ""}>
      <summary>Ferdige forslag (${DESIGNS.length})</summary>
      <nav>
        ${DESIGNS.map(
          (d) =>
            `<a href="#/${d.id}/${route.view}" class="${route.designId === d.id ? "active" : ""}" data-testid="nav-${d.id}">${d.name}</a>`,
        ).join("")}
      </nav>
    </details>
    <div id="violations"></div>`;
}

function designPage(design: Design, route: Route, isDin: boolean): void {
  const base = isDin ? "#/din" : `#/${design.id}`;
  const tabs = VIEWS.map(
    (v) =>
      `<a href="${base}/${v.id}" class="tab ${v.id === route.view ? "active" : ""}" data-testid="view-${v.id}">${v.label}</a>`,
  ).join("");

  const shareBtn = isDin
    ? `<button id="share-link" data-testid="share-link">Del lenke</button>
       <a class="btn ghost" href="#/bygg/0">Endre valg</a>
       <a class="btn ghost" href="#/beslutninger">Sjekkliste før bestilling</a>`
    : "";

  const header = `
    <div class="page-head">
      <h2>${design.name}</h2>
      <div class="tabbar">${tabs}</div>
    </div>
    <p class="design-desc">${design.description}</p>
    ${isDin ? `<div class="share-row">${shareBtn}</div>` : `<div class="verdict-box"><strong>Verdict:</strong> ${design.verdict}</div>`}`;

  document.getElementById("violations")!.innerHTML = violationsHtml(design);

  switch (route.view) {
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
    default: {
      content.innerHTML = `${header}${renderHtml(design)}`;
      wireRender(content, design);
    }
  }

  if (isDin) {
    document.getElementById("share-link")?.addEventListener("click", () => {
      const url = `${location.origin}${location.pathname}#/din/render?s=${encodeSetup(setup)}`;
      void navigator.clipboard.writeText(url);
      const btn = document.getElementById("share-link")!;
      btn.textContent = "Kopiert ✓";
      setTimeout(() => (btn.textContent = "Del lenke"), 1500);
    });
  }
}

function render(): void {
  const route = parseHash();
  renderSidebar(route);
  threeView?.dispose();
  threeView = null;

  switch (route.page) {
    case "wizard": {
      content.innerHTML = wizardHtml(setup, route.step);
      wireWizard(content, setup, (next) => {
        setup = next;
        saveSetup(setup);
        render();
      });
      document.getElementById("violations")!.innerHTML = "";
      break;
    }
    case "din": {
      let design: Design;
      try {
        design = buildDesign(setup);
      } catch {
        window.location.hash = "#/bygg/0";
        return;
      }
      designPage(design, route, true);
      break;
    }
    case "preset": {
      designPage(DESIGNS.find((d) => d.id === route.designId)!, route, false);
      break;
    }
    case "global": {
      document.getElementById("violations")!.innerHTML = "";
      content.innerHTML =
        route.globalId === "sammenlikn"
          ? compareHtml(DESIGNS)
          : route.globalId === "bredder"
            ? widthsHtml()
            : decisionsHtml();
      break;
    }
  }
}

window.addEventListener("hashchange", render);
render();
