import type { Design } from "../model/types";
import { partsList } from "../model/cost";

/** Plain-text shopping list + planner cheat sheet, ready to paste or download. */

export function shoppingText(d: Design): string {
  const s = partsList(d);
  const lines = [
    `HANDLELISTE — ${d.name}`,
    `Generert ${new Date().toISOString().slice(0, 10)} av bookcase-planner. Kontroller priser/lager før bestilling.`,
    "",
    ...s.parts.map(
      (p) =>
        `${p.qty}× ${p.name}${p.article && p.article !== "custom" ? ` [${p.article}]` : ""} — ${
          p.priceNok === undefined ? "pris ukjent" : `${p.priceNok} kr`
        }${p.verified ? "" : " (UVERIFISERT)"}${p.url ? `\n   ${p.url}` : ""}`,
    ),
    "",
    `Sum kjøpte deler: ${s.totalNok} kr${s.unverifiedNok ? ` (hvorav ${s.unverifiedNok} kr uverifisert)` : ""}`,
    "",
    "SNEKKERDELER (males/kappes på stedet):",
    ...s.custom.map((c) => `- ${c.label}: ${c.material}, ${c.wMm}×${c.dMm}×${c.hMm} mm${c.note ? ` — ${c.note}` : ""}`),
  ];
  return lines.join("\n");
}

export function shoppingCsv(d: Design): string {
  const s = partsList(d);
  const esc = (v: string): string => `"${v.replace(/"/g, '""')}"`;
  return [
    "vendor,name,article,qty,packs,price_nok,verified,url",
    ...s.parts.map((p) =>
      [
        esc(p.vendor),
        esc(p.name),
        esc(p.article ?? ""),
        p.qty,
        p.packs,
        p.priceNok ?? "",
        p.verified,
        esc(p.url ?? ""),
      ].join(","),
    ),
  ].join("\n");
}

/** Step list for recreating the design inside IKEA's own planner by hand. */
export function plannerCheatSheet(d: Design): string {
  const s = partsList(d);
  const ikea = s.parts.filter((p) => p.vendor === "IKEA");
  return [
    `GJENSKAP «${d.name}» I IKEAS PLANLEGGER (manuelt, ~10 min)`,
    "",
    "1. Åpne kjøkkenplanleggeren (kitchen.planner.ikea.com) eller METOD-planleggeren,",
    "   sett vegg 3602 mm, takhøyde 2380 mm.",
    "2. Legg inn modulene fra venstre, i denne rekkefølgen:",
    ...d.modules
      .filter((m) => m.source.type === "catalogue")
      .map((m) => {
        const src = m.source as { itemId: string; qty: number };
        return `   - x=${m.x} mm, y=${m.y} mm: ${m.label} (${src.qty}× ${src.itemId})${m.cut ? ` — NB: ${m.cut.note}` : ""}`;
      }),
    "3. Dører/ben/tilbehør:",
    ...ikea
      .filter((p) => !d.modules.some((m) => m.source.type === "catalogue" && m.source.itemId === p.itemId))
      .map((p) => `   - ${p.qty}× ${p.name} [${p.article ?? ""}]`),
    "4. Deler fra andre butikker og snekkerarbeid finnes IKKE i IKEA-planleggeren —",
    "   bruk tegningene herfra som underlag for dem.",
    "",
    "NB: IKEAs planlegger kan ikke ta imot design programmatisk (krever innlogget",
    "HomeByMe-API og proprietære formater), derfor denne manuelle oppskriften.",
  ].join("\n");
}

export function handoffHtml(d: Design): string {
  return `
  <h2>IKEA-overlevering</h2>
  <div class="handoff-actions">
    <button id="copy-shopping">Kopier handleliste</button>
    <button id="dl-csv">Last ned CSV</button>
    <button id="print-page">Skriv ut (PDF)</button>
  </div>
  <h3>Handleliste (tekst)</h3>
  <pre id="shopping-text">${shoppingText(d).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>
  <h3>Gjenskap i IKEAs planlegger</h3>
  <pre>${plannerCheatSheet(d).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
}

export function wireHandoff(root: HTMLElement, d: Design): void {
  root.querySelector("#copy-shopping")?.addEventListener("click", () => {
    void navigator.clipboard.writeText(shoppingText(d));
  });
  root.querySelector("#dl-csv")?.addEventListener("click", () => {
    const blob = new Blob([shoppingCsv(d)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${d.id}-handleliste.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  root.querySelector("#print-page")?.addEventListener("click", () => window.print());
}
