/** Every decision the project needs, grouped by phase. Rendered by the
 * Beslutninger view. Research-backed entries cite docs/; the rest is
 * project-management honesty. */

export type DecisionStatus = "åpen" | "avgjort" | "måles på stedet";

export interface Decision {
  id: string;
  title: string;
  phase: "1 · Før bestilling" | "2 · Før montering" | "3 · På stedet" | "4 · Før maling";
  status: DecisionStatus;
  owner: string;
  options?: string[];
  recommendation: string;
}

export const DECISIONS: Decision[] = [
  {
    id: "variant",
    title: "Hvilken variant? (V3 BILLY vs V8 BBB, høy vs lav benk)",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "V3: billigst (14 0xx), 28 cm dyp, 4 skrog kappes",
      "V8: skissens 20 cm, null kapping, +4 500 kr, furu må males",
      "V6/V7: lav sittebenk 50.8 cm — glatte dører (shaker finnes ikke i 40-høyde)",
    ],
    recommendation:
      "V3 hvis 28 cm går klar av downlights (sjekk på stedet); V8 hvis 20 cm-dybden veier tyngst. Se Render-fanen side om side.",
  },
  {
    id: "bredde",
    title: "Bredde: 320, 340 eller 360 cm",
    phase: "1 · Før bestilling",
    status: "måles på stedet",
    owner: "Familien + montør",
    options: [
      "320: eksakt modulmål, null foring, mest luft",
      "340: som skissen, 10 cm foring/side over BILLY",
      "360: fyller friveggen (1 mm nominell klaring!) — krever at sjakt/veggmål stemmer",
    ],
    recommendation:
      "Kontrollmål fri vegg og sjakt først. 360 gir mest hylle, men velg den bare hvis målet bekreftes med god margin. Ellers er 340 (som skissen) trygg.",
  },
  {
    id: "front-strategi",
    title: "Frontstrategi for METOD-basen",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "A: IKEA-fabrikkfarge (f.eks. STENSUND/BODBYN) — MDF-rammen males i samme farge",
      "B: Mal ALT i én farge — krever fronter som tåler maling (folie er risikabelt)",
      "C: Spesialfronter til METOD i eksakt NCS-farge (Noremax/&shufl/Superfront) — dyrest, null maling av fronter",
    ],
    recommendation: "Under research — oppdateres med verifiserte priser/materialer. Se docs/fronts.md.",
  },
  {
    id: "farge",
    title: "Farge (NCS/Jotun-kode) på hele møbelet",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "Grå-beige som referansebildet (à la Jotun 1024 Tidløs / 10679 Washed Linen)",
      "Match veggfargen (møbelet smelter inn)",
      "Mørk kontrast som dagens vitrineskap",
    ],
    recommendation:
      "Velg koden FØR frontstrategi avgjøres: fabrikkfargene låser valget, spesialfronter og maling er frie. Test A4-oppstrøk på veggen i både dag- og kveldslys.",
  },
  {
    id: "benkeplate",
    title: "Benkeplate: laminat, malt MDF eller finér",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "EKBACKEN spesialtilpasset laminat (~4 000 kr, bekreft pris i varehus)",
      "Snekkerlevert MDF malt som resten (mest plassbygd, tåler minst)",
      "Eikefinér/heltre (varmest uttrykk, dyrere; IKEA stock maks 246 cm → skjøt)",
    ],
    recommendation:
      "Platen er den mest synlige flaten i møbelet. Malt MDF gir referansebildets look; laminat tåler mest. Avgjør sammen med fargevalget.",
  },
  {
    id: "hengsler",
    title: "Hengsler (følger IKKE med METOD-dørene)",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    recommendation: "Under research — UTRUSTA med/uten demping, antall per dør, priser. Legges i delelisten når verifisert.",
  },
  {
    id: "knotter",
    title: "Knotter/grep i messing",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    recommendation: "Under research — BAGGANÄS/ENERYDA + ett kvalitetsalternativ. Referansebildet har små runde messingknotter.",
  },
  {
    id: "belysning",
    title: "Hyllebelysning og downlight-avstand",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien + elektriker",
    options: [
      "Ingen — downlights i nedhakket er nok",
      "Plug-in LED-lister i hyllene (uten elektriker hvis stikk finnes)",
      "Fast installasjon (krever elektriker — bestill tidlig)",
    ],
    recommendation:
      "Under research. Uansett: mål downlight-avstand mot overdelens forkant (28 cm BILLY ligger ~2 cm bak downlights på 30 cm).",
  },
  {
    id: "stikkontakt",
    title: "Strømuttak bak/i møbelet",
    phase: "2 · Før montering",
    status: "åpen",
    owner: "Elektriker",
    recommendation:
      "Referansebildet har en lampe PÅ hyllen — det krever stikk i/bak møbelet (skjult i et baseskap med kabelgjennomføring, eller uttak i hyllefelt). Må gjøres FØR møbelet står. Sjekk også om eksisterende stikk havner bak basen.",
  },
  {
    id: "vegg-sjekk",
    title: "Veggtype, stendere, skjulte rør/kabler",
    phase: "2 · Før montering",
    status: "måles på stedet",
    owner: "Montør",
    recommendation:
      "Finn stenderplassering for topplekt/skinne (se docs/fastening.md), sjekk for radiator/ventil/rør bak møbelflaten, og veggens flukt (slette vegger = mindre scribing).",
  },
  {
    id: "innmat",
    title: "Ekstra hyller inni METOD-baseskapene",
    phase: "2 · Før montering",
    status: "åpen",
    owner: "Familien",
    recommendation: "Under research (hva følger med stammen?). Kan ettermonteres — ikke kritisk for bestillingen.",
  },
  {
    id: "gulvlist",
    title: "Gulvlist og nedhakk-tilpasning",
    phase: "3 · På stedet",
    status: "måles på stedet",
    owner: "Montør",
    recommendation:
      "Eksisterende gulvlist kappes der sokkelen møter vegg; gesims scribes mot nedhakket (sjekk at det er i vater — avvik synes på en 340 cm linje).",
  },
  {
    id: "maling-logistikk",
    title: "Hvem maler, og når?",
    phase: "4 · Før maling",
    status: "åpen",
    owner: "Familien",
    options: [
      "Maler sprøyter deler FØR montering (jevnest finish), montør monterer ferdigmalte deler + flikk",
      "Alt males på stedet etter montering (enklest logistikk, penselspor)",
    ],
    recommendation:
      "Sprøytemalt før montering gir fabrikk-look på MDF og (for V8/BILLY) trengs sperregrunning uansett. Avtal med montørene hvem som eier flikk-ansvaret etter innfesting.",
  },
  {
    id: "bestilling",
    title: "Bestillingsrekkefølge og ledetider",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    recommendation:
      "Lengste ledetid styrer: spesialfronter (ukevis) og EKBACKEN spesialtilpasning bestilles først, IKEA-stammer er lagervare, BBB oppgir inntil 30 dager. Sjekk IKEA-lager rett før henting — delelisten har artikkelnumre.",
  },
];
