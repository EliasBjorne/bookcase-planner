import type { Design } from "../model/types";
import { partsList } from "../model/cost";
import { validate, cutCount } from "../model/validate";

const nok = (n: number): string => `${n.toLocaleString("no")} kr`;

export function compareHtml(designs: Design[]): string {
  const cols = designs.map((d) => {
    const s = partsList(d);
    const v = validate(d);
    const errors = v.filter((x) => x.level === "error").length;
    const warnings = v.filter((x) => x.level === "warning").length;
    const shelfDepth = Math.max(
      0,
      ...d.modules.filter((m) => m.kind === "shelf").map((m) => m.d),
    );
    return { d, s, errors, warnings, shelfDepth };
  });

  const row = (label: string, f: (c: (typeof cols)[0]) => string): string =>
    `<tr><th>${label}</th>${cols.map((c) => `<td>${f(c)}</td>`).join("")}</tr>`;

  return `
  <h2>Variantsammenlikning</h2>
  <table class="compare">
    <thead><tr><th></th>${cols.map((c) => `<th>${c.d.name}</th>`).join("")}</tr></thead>
    <tbody>
      ${row("Kjøpte deler", (c) => nok(c.s.totalNok))}
      ${row("— hvorav uverifisert pris", (c) => (c.s.unverifiedNok ? nok(c.s.unverifiedNok) : "0"))}
      ${row("Butikker", (c) => c.s.vendors.join(", "))}
      ${row("Hylledybde oppe", (c) => `${c.shelfDepth} mm ${c.shelfDepth === 200 ? "(= skisse ✓)" : "(skisse: 200)"}`)}
      ${row("Skrog som må kappes", (c) => `${cutCount(c.d)}`)}
      ${row("Snekkerdeler", (c) => `${c.s.custom.length}`)}
      ${row("Avvik", (c) => `${c.errors} feil, ${c.warnings} advarsler`)}
      ${row("Verdict", (c) => `<div class="verdict">${c.d.verdict}</div>`)}
    </tbody>
  </table>
  <p class="note">Priser er kun kjøpte deler — MDF, maling og montering kommer i tillegg og er felles for alle variantene (unntatt omfanget av kapping/innkledning, se raden over).</p>`;
}
