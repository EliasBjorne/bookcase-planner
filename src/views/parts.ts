import type { Design } from "../model/types";
import { partsList } from "../model/cost";
import { validate, cutCount } from "../model/validate";

const nok = (n: number | undefined): string =>
  n === undefined ? "—" : `${n.toLocaleString("no")} kr`;

export function partsHtml(d: Design): string {
  const s = partsList(d);
  const rows = s.parts
    .map(
      (p) => `<tr class="${p.verified ? "" : "unverified"}">
        <td>${p.vendor}</td>
        <td>${p.url ? `<a href="${p.url}" target="_blank" rel="noreferrer">${p.name}</a>` : p.name}</td>
        <td>${p.article ?? "—"}</td>
        <td class="num">${p.qty}${p.packs !== p.qty ? ` (${p.packs} pk)` : ""}</td>
        <td class="num">${nok(p.priceNok)}</td>
        <td>${p.verified ? "✓" : "⚠ uverifisert"}</td>
      </tr>`,
    )
    .join("");

  const customRows = s.custom
    .map(
      (c) => `<tr>
        <td>${c.label}</td>
        <td>${c.material}</td>
        <td class="num">${c.wMm}×${c.dMm}×${c.hMm}</td>
        <td>${c.note ?? ""}</td>
      </tr>`,
    )
    .join("");

  return `
  <h2>Handleliste</h2>
  <table>
    <thead><tr><th>Butikk</th><th>Vare</th><th>Art.nr</th><th>Antall</th><th>Pris</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><th colspan="4">Sum kjøpte deler</th><th class="num">${nok(s.totalNok)}</th><th>${s.unverifiedNok ? `hvorav ${nok(s.unverifiedNok)} uverifisert` : ""}</th></tr></tfoot>
  </table>
  <h2>Kappliste / snekkerdeler (${cutCount(d)} skrog må kappes)</h2>
  <table>
    <thead><tr><th>Del</th><th>Materiale</th><th>Mål (b×d×h mm)</th><th>Merknad</th></tr></thead>
    <tbody>${customRows || `<tr><td colspan="4">Ingen</td></tr>`}</tbody>
  </table>
  <h2>Kontrollmål på stedet</h2>
  <ul>${d.siteNotes.map((n) => `<li>${n}</li>`).join("")}</ul>`;
}

export function violationsHtml(d: Design): string {
  const v = validate(d);
  if (v.length === 0) return `<div class="viol ok">✓ Ingen avvik</div>`;
  return v
    .map((x) => `<div class="viol ${x.level}">${x.level === "error" ? "✖" : x.level === "warning" ? "⚠" : "ℹ"} ${x.message}</div>`)
    .join("");
}
