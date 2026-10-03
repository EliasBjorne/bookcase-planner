import { widthSweep, type Combo } from "../model/widths";

const nok = (n: number): string => `${n.toLocaleString("no")} kr`;
const cm = (mm: number): string => `${mm / 10}`;

/** Tiny front strip: fillers at the ends, modules with their widths. */
function strip(c: Combo, targetMm: number, color: string): string {
  const S = 0.055;
  const H = 26;
  const W = targetMm * S;
  const fill = c.fillerMm / 2;
  let x = fill * S;
  const cells = c.widths
    .map((w) => {
      const r = `<rect x="${x.toFixed(1)}" y="1" width="${(w * S).toFixed(1)}" height="${H - 2}" fill="${color}" stroke="#4a4238" stroke-width="0.8"/>
      <text x="${(x + (w * S) / 2).toFixed(1)}" y="${H / 2 + 3}" text-anchor="middle" font-size="8" fill="#2c2822">${w / 10}</text>`;
      x += w * S;
      return r;
    })
    .join("");
  const fillers =
    c.fillerMm > 0
      ? `<rect x="0" y="1" width="${(fill * S).toFixed(1)}" height="${H - 2}" fill="#8d8273"/>
         <rect x="${(W - fill * S).toFixed(1)}" y="1" width="${(fill * S).toFixed(1)}" height="${H - 2}" fill="#8d8273"/>`
      : "";
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${H}" width="${W.toFixed(0)}" height="${H}" xmlns="http://www.w3.org/2000/svg">${fillers}${cells}</svg>`;
}

export function widthsHtml(): string {
  const plans = widthSweep(3000, 3600, 100);
  const rows = plans
    .map((p) => {
      const fillNote = (c: Combo) =>
        c.fillerMm > 0 ? ` <span class="fill-note">+ ${c.fillerMm / 2}mm foring per side</span>` : " <strong>eksakt ✓</strong>";
      return `<tr>
      <td><strong>${cm(p.targetMm)} cm</strong></td>
      <td>
        <div>${p.base.widths.map((w) => w / 10).join(" + ")}${fillNote(p.base)}</div>
        ${strip(p.base, p.targetMm, "#b4a894")}
        <div class="small">dører: ${p.baseDoors}</div>
      </td>
      <td>
        <div>${p.billy.widths.map((w) => w / 10).join(" + ")}${fillNote(p.billy)}</div>
        ${strip(p.billy, p.targetMm, "#c0b5a0")}
        <div class="small">${nok(p.totalBilly)} totalt</div>
      </td>
      <td>
        <div>${p.bohus.widths.map((w) => w / 10).join(" + ")}${fillNote(p.bohus)}</div>
        ${strip(p.bohus, p.targetMm, "#c7bba4")}
        <div class="small">${nok(p.totalBohus)} totalt</div>
      </td>
      <td class="small">${p.notes.join("<br/>") || "—"}</td>
    </tr>`;
    })
    .join("");

  return `
  <h2>Breddeutforsker 300–360 cm</h2>
  <p class="design-desc">Beste modulkombinasjon per bredde (kun verifiserte størrelser: METOD 80/60/40,
  BILLY 80/40, Bohus 79). Foring deles likt på begge sider. Totalpris = base (stammer, dører,
  ben, benkeplate) + overdel; MDF/maling/montering kommer i tillegg. Veggen er 360.2 cm —
  en 360-løsning fyller alt, men krever at sjaktmålet stemmer!</p>
  <table class="widths" data-testid="widths-table">
    <thead><tr><th>Bredde</th><th>METOD-base</th><th>V3: BILLY-overdel</th><th>V1: Bohus-overdel</th><th>Merknader</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}
