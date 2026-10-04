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
    title: "Frontstrategi for METOD-basen (research ferdig — se docs/fronts.md)",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "A: IKEA-fabrikkfarge — FALLER BORT for grå-beige shaker: STENSUND finnes kun i hvit/lys grønn i Norge, BODBYN kun offwhite/svart, VEDHAMN selges ikke her. Nærmeste fabrikk-grå-beige er HAVSTORP — men den er glatt, ikke shaker.",
      "B (verdi, ~4 500 kr + lakkering): STENSUND hvit (PU-malt MDF, ekte shaker-profil, trygg å overmale) sprøytelakkeres i valgt Jotun-farge sammen med MDF-rammen. Unngå folieserier (AXSTAD m.fl.) — folie slipper i kanter.",
      "C (premium, ~15 000 kr dører): Noremax Classic Style (norskprodusert METOD-shaker, valgfri NCS/Jotun-farge, fabrikklakk, forhåndsboret, 5–8 ukers ledetid). Null malerisiko på dørene.",
    ],
    recommendation:
      "B hvis en maler uansett sprøyter MDF-innramming — da males dørene i samme operasjon (~3–6k ekstra for lakkering). C hvis budsjettet tåler ~10k mer: fabrikkhard finish og garantert fargematch. VEDDINGE+list-hacket frarådes (STENSUND har allerede profilen for 30 kr mer per dør).",
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
    status: "avgjort",
    owner: "Familien",
    recommendation:
      "UTRUSTA 110° med innebygd demper (805.248.82, 195 kr/2-pk), 2 per dør — nå lagt inn i alle delelistene (8 dører = 1 560 kr). Udempet 110° finnes ikke i NO-sortimentet, så valget tar seg selv.",
  },
  {
    id: "knotter",
    title: "Knotter/grep i messing",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien",
    options: [
      "BAGGANÄS 20 mm messingfarget (90 kr/2-pk, messingbelagt stål) — i delelisten nå, 360 kr for 8",
      "Beslag Design Uno 30 mm UBEHANDLET messing (~185 kr/stk, patinerer vakkert) — ekte messing, ~1 500 kr for 8",
      "ENERYDA 35 mm (135 kr/2-pk) — OBS: nikkelbelagt aluminium, ikke messing",
    ],
    recommendation:
      "Referansebildets små runde knotter = BAGGANÄS 20 mm (budsjett) eller Beslag Design Uno (ekte messing som patinerer). Knottene er det folk tar på hver dag — 1 100 kr ekstra for ekte messing er god verdi. NB ved Noremax Classic Frame: 21 mm dørtykkelse er på grensen for IKEA-knotteskruer.",
  },
  {
    id: "belysning",
    title: "Hyllebelysning og downlight-avstand",
    phase: "1 · Før bestilling",
    status: "åpen",
    owner: "Familien + elektriker",
    options: [
      "Ingen — downlights i nedhakket er nok",
      "MITTLED-spotter i hyllene: 6 spotter + TRÅDFRI-driver + FÖRNIMMA ≈ 1 580 kr, plugges i stikk = LOVLIG uten elektriker",
      "Fast 230V-tilkobling eller nytt/flyttet stikk = krever registrert elektriker (DSB-regler)",
    ],
    recommendation:
      "Referansebildets glød kommer fra belyste hyller. MITTLED plug-in er billig og elektrikerfritt HVIS det finnes stikk å nå (henger sammen med stikkontakt-beslutningen under). Kabler skjules bak gesims/foring — planlegg føringsvei FØR montering. Og mål downlight-avstand mot overdelens forkant (28 cm BILLY ligger ~2 cm bak downlights på 30 cm).",
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
    title: "Hyller inni METOD-baseskapene",
    phase: "2 · Før montering",
    status: "avgjort",
    owner: "Familien",
    recommendation:
      "Verifisert: stammene leveres HELT uten hyller. 1 UTRUSTA-hylleplate per 60-høy stamme (190/155/135 kr etter bredde) er nå lagt i delelistene (860 kr for 340-basen). Flere kan ettermonteres.",
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
