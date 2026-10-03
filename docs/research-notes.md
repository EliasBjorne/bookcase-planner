# Research-notater (2026-10-03)

Kortversjon av undersøkelsene som ligger bak katalogen og arkitekturvalget.
Alle «verifisert» = lest direkte fra kildens side den datoen.

## IKEAs planleggere

- **Kjøkkenplanleggeren** (kitchen.planner.ikea.com) er Dassault **HomeByMe**
  i en iframe (`kitchen.ikea-prod.by.me`). 3D-formatene er proprietære
  (`.bm3`/`.bma`), deleliste-API krever innlogging, og vilkårene forbyr
  avledede verk. **Ikke gjenbrukbar som fundament.**
- Lagrede design kan derimot *leses* uten innlogging:
  `GET https://platform.ikea-prod.by.me/api/3/projects/{uuid}` med en
  `timestamp`-header på basic-ISO-format (16 tegn, UTC, f.eks.
  `20261003T104406Z`; gamle timestamps avvises). Svaret peker på en offentlig
  `.BMPROJ` (ren JSON) på S3. Det er dette `scripts/import-bmproj.ts` bruker.
  NB: alle med design-ID-en kan lese filen — den inneholder HomeByMe-bruker-ID.
- **BESTÅ/storage-planleggeren** er React + **Babylon.js** mot
  `api.dexf.ikea.com` (API-nøkler ligger i åpen JS). Grei for engangsoppslag;
  samme app dekker ~19 sortimenter (metod, pax, billy, besta, …).
- Nyttige offentlige endepunkter for katalogvedlikehold (aldri i runtime):
  - `https://www.ikea.com/no/no/products/{sisteTreSiffer}/{artnr}.json` — navn/pris
  - `https://web-api.ikea.com/no/no/rotera/data/model/{artnr}/` — mål i mm + GLB (krever `X-Client-Id` fra ikea.com)
  - `https://sik.search.blue.cdtapps.com/no/no/search-result-page?q=` — søk

## Katalog-fakta som formet designene

- Det finnes **ingen 60 cm høy METOD benkeskapstamme** (benkeskap = kun 80 cm
  høye) og **ingen ~50 cm dyp METOD** (37/60). Lavt skap = veggskap på ben.
- Veggskap mangler benfester — montør fester ben/bunnramme selv.
- **BILLY**: 28 cm dyp, høyder 106/202 (+35 påbygg kun for 202). Ingen størrelse
  passer oppå en 70 cm base uten kapping.
- **BESTÅ**: eneste ekte 20 cm-dybde hos IKEA, men kun 60 cm bredde i 20-dybden.
- Benkeplater: alle standard maks 246 cm; kun spesialtilpasset EKBACKEN
  (20–400 cm) gir én plate på 340.
- Butikkjøpte alternativer utenfor IKEA (Norge): Bohus Base (26.7 dyp, 1 899 kr,
  svak hylle 13 kg), String (ekte 20 cm, stål, ~17–20 000 kr, males ikke),
  Lundia (furu, 30 cm, frakt fra Finland ubekreftet), Tylko (eksakt bredde
  konfigurerbar, pris/frakt ubekreftet), JYSK Gislinge (billigst, 6 kg/hylle).

## Åpen kildekode-alternativer (forkastet)

Sweet Home 3D (GUI-drevet, svake oppriss), blueprint-js/react-planner
(planløsning, ikke møbel, lite vedlikeholdt), FreeCAD/build123d (kraftig, men
andre stack og bratt kost for ~10 bokser), OpenSCAD/JSCAD (svak målsetting).
Egen parametrisk modell + SVG-tegninger vant på innsats og etterrettelighet.
