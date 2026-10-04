import { DECISIONS, type Decision } from "../designs/decisions";

const STATUS_CLASS: Record<Decision["status"], string> = {
  "åpen": "st-open",
  "avgjort": "st-done",
  "måles på stedet": "st-measure",
};

export function decisionsHtml(): string {
  const phases = [...new Set(DECISIONS.map((d) => d.phase))].sort();
  const sections = phases
    .map((phase) => {
      const rows = DECISIONS.filter((d) => d.phase === phase)
        .map(
          (d) => `
        <div class="decision" data-testid="decision-${d.id}">
          <div class="decision-head">
            <strong>${d.title}</strong>
            <span class="chip ${STATUS_CLASS[d.status]}">${d.status}</span>
            <span class="chip st-owner">${d.owner}</span>
          </div>
          ${d.options ? `<ul>${d.options.map((o) => `<li>${o}</li>`).join("")}</ul>` : ""}
          <p class="rec"><strong>Anbefaling:</strong> ${d.recommendation}</p>
        </div>`,
        )
        .join("");
      return `<h3>${phase}</h3>${rows}`;
    })
    .join("");

  const open = DECISIONS.filter((d) => d.status !== "avgjort").length;
  return `
  <h2>Beslutninger (${open} åpne)</h2>
  <p class="design-desc">Alt som må avgjøres for at dette skal bli vellykket — gruppert etter når
  det må avgjøres, og hvem som eier det. Front-, beslag- og belysningspunktene er
  underbygget av verifisert research (docs/fronts.md).</p>
  <div class="decisions" data-testid="decisions-list">${sections}</div>`;
}
