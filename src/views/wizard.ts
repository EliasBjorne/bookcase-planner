import { buildDesign } from "../model/build";
import { shade } from "../model/color";
import { partsList } from "../model/cost";
import { FRONTS, getFront } from "../model/fronts";
import { KNOBS, getKnob } from "../model/knobs";
import { getItem } from "../model/catalogue";
import {
  COLOR_HEX,
  constraintError,
  normalize,
  type Setup,
} from "../model/setup";
import { renderFront, type DoorStyle } from "./render";

/** Mini door preview for the front cards. */
function doorThumb(style: DoorStyle, color: string): string {
  const edge = shade(color, 0.76);
  const inner =
    style === "shaker"
      ? `<rect x="9" y="9" width="26" height="44" fill="${shade(color, 0.93)}" stroke="${edge}" stroke-width="1"/>`
      : style === "bevel"
        ? `<rect x="7" y="7" width="30" height="48" fill="none" stroke="${shade(color, 0.86)}" stroke-width="2.6" rx="2"/><rect x="11" y="11" width="22" height="40" fill="${shade(color, 1.03)}" rx="2"/>`
        : style === "country"
          ? `<rect x="9" y="9" width="26" height="40" fill="${shade(color, 0.94)}" stroke="${edge}" stroke-width="1.2"/><rect x="12" y="12" width="20" height="34" fill="none" stroke="${shade(color, 0.85)}" stroke-width="1"/><rect x="3" y="53" width="38" height="4" fill="${shade(color, 0.9)}"/>`
          : style === "gloss"
            ? `<polygon points="10,3 20,3 6,59 3,59" fill="#ffffff66"/>`
            : `<rect x="3" y="3" width="38" height="3" fill="${shade(color, 1.08)}"/>`;
  return `<svg viewBox="0 0 44 62" width="44" height="62" class="door-thumb" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="42" height="60" fill="${color}" stroke="${edge}" stroke-width="1.5" rx="1"/>
    ${inner}
    <circle cx="37" cy="31" r="2.4" fill="#c9a227"/>
  </svg>`;
}

/** Step-by-step configurator. Each step edits one Setup field; option cards
 * show live totals computed by building the full design per option. */

interface Option {
  value: string;
  label: string;
  desc: string;
  caveat?: string;
  recommended?: boolean;
  swatch?: string;
  thumb?: string;
  photo?: string;
}

interface Step {
  field: keyof Setup;
  title: string;
  help: string;
  options: Option[];
}

export const STEPS: Step[] = [
  {
    field: "widthMm",
    title: "Hvor bred skal den være?",
    help: "Fri vegg er 360.2 cm (kontrollmål!). 320 og 360 treffer modulmålene eksakt.",
    options: [
      { value: "3000", label: "300 cm", desc: "Luftigst, minst oppbevaring." },
      { value: "3200", label: "320 cm", desc: "Eksakt modulmål — null foring, reneste bygget.", recommended: true },
      { value: "3400", label: "340 cm", desc: "Som skissen. ~10 cm foring per side over hyllene." },
      { value: "3600", label: "360 cm", desc: "Fyller friveggen.", caveat: "1 mm nominell klaring — krever at sjaktmålet stemmer." },
    ],
  },
  {
    field: "bench",
    title: "Høy eller lav benk?",
    help: "Høy (70.8 cm) = sideboard som referansebildet. Lav (50.8 cm) = sittebenk.",
    options: [
      { value: "high", label: "Høy · 70.8 cm", desc: "Referansebildets proporsjoner, mest lukket oppbevaring, shaker-dører mulig.", recommended: true },
      { value: "low", label: "Lav · 50.8 cm", desc: "Vindusbenk-følelse, mer hyllehøyde, mindre kapping.", caveat: "Shaker-dører finnes ikke i 40-høyde (glatt VEDDINGE eller Noremax)." },
    ],
  },
  {
    field: "uppers",
    title: "Hva slags åpne hyller?",
    help: "Dybden er den store forskjellen — skissen sier 20 cm, downlights sitter ~30 cm fra veggen.",
    options: [
      { value: "billy", label: "BILLY (kappet)", desc: "28 cm dyp, 30 kg/hylle — robust og billigst.", recommended: true },
      { value: "bbb", label: "BBB System", desc: "Ekte 20 cm, heltre furu, NULL kapping (bokhyller.no).", caveat: "Hyllelast/frakt upublisert — spør BBB." },
      { value: "bohus", label: "Bohus Base (kappet)", desc: "26.7 cm dyp, folieskrog som kles inn.", caveat: "Svake hyller (13 kg) — stiv av med MDF." },
      { value: "besta", label: "BESTÅ stablet", desc: "Ekte 20 cm fra IKEA, null kapping.", caveat: "60-kolonner + kun ~12 mm taklaring." },
      { value: "metod", label: "Åpen METOD", desc: "Ett system, null kapping.", caveat: "37 cm dype hyller — tungt uttrykk, nær downlights." },
      { value: "string", label: "String-system", desc: "Designklassiker, ekte 20 cm.", caveat: "Leses som String, ikke plassbygd. Males ikke." },
    ],
  },
  {
    field: "front",
    title: "Hvilke dører på benken?",
    help: "Hele METOD-sortimentet i våre størrelser (IKEA-søk 2026-10-04) + Noremax. «Males»-dører tar fargen du velger i neste steg; resten beholder fabrikkfargen i forhåndsvisningen.",
    options: FRONTS.map((f) => ({
      value: f.id,
      label: f.label,
      desc: `${f.surface} · ${f.paintable ? "males i valgt farge" : f.customColor ? "fabrikklakkert i valgt farge" : "fabrikkfarge (males ikke)"}`,
      caveat: f.caveat,
      recommended: f.recommended,
      thumb: doorThumb(f.style, f.customColor ? "#b4a894" : f.factoryHex),
    })),
  },
  {
    field: "color",
    title: "Hvilken farge på rammen og malbare dører?",
    help: "Velg koden før bestilling — den styrer både maler og ev. Noremax-ordre. Test A4-oppstrøk i dag- og kveldslys. NB: valgte du en fabrikkfarge-dør (folie/finér), beholder døren sin farge — dette styrer resten.",
    options: (Object.keys(COLOR_HEX) as (keyof typeof COLOR_HEX)[]).map((c) => ({
      value: c,
      label: COLOR_HEX[c].label.split(" (")[0],
      desc: COLOR_HEX[c].label.includes("(") ? `(${COLOR_HEX[c].label.split(" (")[1]}` : "",
      swatch: COLOR_HEX[c].unit,
      recommended: c === "greige",
    })),
  },
  {
    field: "knobs",
    title: "Knotter",
    help: "Det eneste man tar på hver dag. Ekte produktbilder på kortene og under illustrasjonen; fargen følger med i tegning, 3D og Foto.",
    options: KNOBS.map((k) => ({
      value: k.id,
      label: k.label,
      desc: k.desc,
      caveat: k.caveat,
      recommended: k.recommended,
      photo: k.imageUrl,
      swatch: k.imageUrl ? undefined : k.colorHex,
    })),
  },
  {
    field: "top",
    title: "Benkeplate",
    help: "Den mest synlige flaten i møbelet.",
    options: [
      { value: "ekbacken", label: "EKBACKEN laminat, spesialtilpasset", desc: "Én plate i full lengde, tåler mest.", caveat: "Pris ~995 kr/påbegynt meter — bekreft i varehus.", recommended: true },
      { value: "mdf-painted", label: "Malt MDF/finér fra snekker", desc: "Mest plassbygd uttrykk — males som resten.", caveat: "Pris inngår i snekkertilbudet (vises ikke i delelisten)." },
    ],
  },
  {
    field: "lighting",
    title: "Hyllebelysning?",
    help: "Referansebildets glød. Plugg-i-stikk er lovlig uten elektriker — men planlegg føringsvei og stikk først.",
    options: [
      { value: "none", label: "Ingen", desc: "Downlights i nedhakket er nok." },
      { value: "spots6", label: "6 MITTLED-spotter", desc: "+ TRÅDFRI-driver og FÖRNIMMA-kabel.", recommended: true },
      { value: "spots9", label: "9 MITTLED-spotter", desc: "Maks glød, én driver holder." },
    ],
  },
];

const nok = (n: number): string => `${n.toLocaleString("no")} kr`;

function totalFor(s: Setup): number | null {
  try {
    return partsList(buildDesign(s)).totalNok;
  } catch {
    return null;
  }
}

export function wizardHtml(setup: Setup, stepIdx: number): string {
  const step = STEPS[stepIdx];
  const current = totalFor(setup) ?? 0;

  const cards = step.options
    .map((o) => {
      const candidate = normalize(
        { ...setup, [step.field]: step.field === "widthMm" ? Number(o.value) : o.value } as Setup,
        step.field,
      );
      const err = constraintError(candidate);
      const total = err ? null : totalFor(candidate);
      const active = String(setup[step.field]) === o.value;
      const delta = total === null ? null : total - current;
      return `
      <button class="opt-card ${active ? "active" : ""}" data-field="${step.field}" data-value="${o.value}" ${err ? `disabled title="${err}"` : ""} data-testid="opt-${o.value}">
        ${o.thumb ?? ""}
        ${o.photo ? `<img class="opt-photo" src="${o.photo}" alt="" loading="lazy" referrerpolicy="no-referrer"/>` : ""}
        ${o.swatch ? `<span class="swatch" style="background:${o.swatch}"></span>` : ""}
        <span class="opt-label">${o.label} ${o.recommended ? `<span class="chip st-done">anbefalt</span>` : ""}</span>
        <span class="opt-desc">${o.desc}</span>
        ${o.caveat ? `<span class="opt-caveat">⚠ ${o.caveat}</span>` : ""}
        <span class="opt-price">${
          total === null
            ? "—"
            : active
              ? nok(total)
              : `${nok(total)} <em>(${delta === 0 ? "±0" : (delta! > 0 ? "+" : "−") + nok(Math.abs(delta!)).replace(" kr", "")} kr)</em>`
        }</span>
      </button>`;
    })
    .join("");

  const dots = STEPS.map(
    (s2, i) =>
      `<a href="#/bygg/${i}" class="dot ${i === stepIdx ? "active" : ""}" title="${s2.title}">${i + 1}</a>`,
  ).join("");

  return `
  <div class="wizard" data-testid="wizard">
    <div class="wizard-main">
      <div class="dots">${dots}</div>
      <h2>${step.title}</h2>
      <p class="design-desc">${step.help}</p>
      <div class="opt-grid">${cards}</div>
      <div class="wizard-nav">
        ${stepIdx > 0 ? `<a class="btn ghost" href="#/bygg/${stepIdx - 1}">← Tilbake</a>` : "<span></span>"}
        ${
          stepIdx < STEPS.length - 1
            ? `<a class="btn" href="#/bygg/${stepIdx + 1}" data-testid="next">Neste →</a>`
            : `<a class="btn" href="#/din/render" data-testid="finish">Se din løsning →</a>`
        }
      </div>
    </div>
    <aside class="wizard-preview">
      <div class="preview-render" data-testid="wizard-preview">${previewSvg(setup)}</div>
      ${realPhotoStrip(setup, step.field)}
      <div class="preview-total">Kjøpte deler: <strong data-testid="wizard-total">${nok(current)}</strong></div>
      <p class="note">MDF, maling og montering kommer i tillegg. Alle valg kan endres når som helst.</p>
    </aside>
  </div>`;
}

/** Real product photo of the current selection, shown under the illustration
 * on the steps where a photo exists (doors, knobs, lighting). Hotlinked from
 * the vendor with a source link — not redistributed. */
function realPhotoStrip(setup: Setup, field: keyof Setup): string {
  let img: string | undefined;
  let label = "";
  let link: string | undefined;
  if (field === "front") {
    const f = getFront(setup.front);
    img = f.imageUrl;
    label = f.label;
    link = f.productUrl;
  } else if (field === "knobs") {
    const k = getKnob(setup.knobs);
    img = k.imageUrl;
    label = k.label;
    link = k.productUrl;
  } else if (field === "lighting" && setup.lighting !== "none") {
    const item = getItem("mittled-spot");
    img = item.imageUrl;
    label = item.name;
    link = item.url;
  }
  if (!img && !link) return "";
  return `
  <div class="real-photo" data-testid="real-photo">
    ${img ? `<img src="${img}" alt="${label}" loading="eager" referrerpolicy="no-referrer"/>` : ""}
    <div class="real-photo-caption">
      <span>${label}</span>
      ${link ? `<a href="${link}" target="_blank" rel="noreferrer">Se hos leverandør →</a>` : ""}
    </div>
  </div>`;
}

function previewSvg(setup: Setup): string {
  try {
    return renderFront(buildDesign(setup));
  } catch (e) {
    return `<p class="note">${(e as Error).message}</p>`;
  }
}

/** Wire card clicks; returns the (possibly normalized) new setup. */
export function wireWizard(
  root: HTMLElement,
  setup: Setup,
  onChange: (s: Setup) => void,
): void {
  root.querySelectorAll<HTMLButtonElement>(".opt-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.field as keyof Setup;
      const raw = btn.dataset.value!;
      const next = normalize(
        { ...setup, [field]: field === "widthMm" ? Number(raw) : raw } as Setup,
        field,
      );
      if (constraintError(next)) return; // disabled card defence
      onChange(next);
    });
  });
}
