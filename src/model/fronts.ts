/** Every METOD-compatible door option for the wizard. Sizes reference
 * catalogue item ids (d4060/d6060 for the high bench, d4040 for the low).
 * `paintable` fronts take the chosen unit colour (sprayed with the framing);
 * the rest keep their factory colour in the render, with the MDF framing
 * painted to match or contrast. */

export type DoorStyle = "shaker" | "flat" | "bevel" | "country" | "gloss";

export interface FrontOption {
  id: string;
  label: string;
  style: DoorStyle;
  surface: string;
  paintable: boolean;
  /** Door colour as rendered when not painted (factory finish). */
  factoryHex: string;
  /** Noremax: factory-lacquered in the chosen colour code. */
  customColor?: boolean;
  integratedHandle?: boolean;
  sizes: { d4060: string; d6060: string; d4040: string };
  caveat?: string;
  recommended?: boolean;
}

export const FRONTS: FrontOption[] = [
  {
    id: "stensund-hvit",
    label: "STENSUND hvit",
    style: "shaker",
    surface: "PU-malt MDF",
    paintable: true,
    factoryHex: "#f2f1ec",
    sizes: { d4060: "stensund-door-40x60", d6060: "stensund-door-60x60", d4040: "front-stensund-hvit-40x40" },
    recommended: true,
    caveat: "Males i valgt farge sammen med rammen — beste shaker per krone.",
  },
  {
    id: "stensund-gronn",
    label: "STENSUND lys grågrønn",
    style: "shaker",
    surface: "PU-malt MDF",
    paintable: true,
    factoryHex: "#c8d2c4",
    sizes: { d4060: "front-stensund-gronn-40x60", d6060: "front-stensund-gronn-60x60", d4040: "front-stensund-gronn-40x40" },
  },
  {
    id: "noremax-custom",
    label: "Noremax Classic Style · valgfri farge",
    style: "shaker",
    surface: "PU-industrilakk MDF",
    paintable: false,
    customColor: true,
    factoryHex: "#b4a894",
    sizes: { d4060: "noremax-classic-40x60", d6060: "noremax-classic-60x60", d4040: "noremax-classic-40x40" },
    caveat: "Fabrikklakkert i valgt Jotun/NCS-kode. 5–8 ukers ledetid.",
  },
  {
    id: "bodbyn-offwhite",
    label: "BODBYN offwhite",
    style: "bevel",
    surface: "Polyestermalt MDF",
    paintable: true,
    factoryHex: "#ece5d6",
    sizes: { d4060: "front-bodbyn-offwhite-40x60", d6060: "front-bodbyn-offwhite-60x60", d4040: "front-bodbyn-offwhite-40x40" },
    caveat: "Buet fylling — mykere profil enn shaker. Hard lakk: grundig matting før maling.",
  },
  {
    id: "bodbyn-svart",
    label: "BODBYN svart",
    style: "bevel",
    surface: "Polyestermalt MDF",
    paintable: true,
    factoryHex: "#2e2d2b",
    sizes: { d4060: "front-bodbyn-svart-40x60", d6060: "front-bodbyn-svart-60x60", d4040: "front-bodbyn-svart-40x40" },
  },
  {
    id: "lerhyttan-lysgra",
    label: "LERHYTTAN lys grå",
    style: "country",
    surface: "Bjørkeramme, tonet lakk",
    paintable: true,
    factoryHex: "#c9c9c4",
    sizes: { d4060: "front-lerhyttan-lysgra-40x60", d6060: "front-lerhyttan-lysgra-60x60", d4040: "front-lerhyttan-lysgra-40x40" },
    caveat: "Synlig trestruktur gjennom tonet lakk — males med sliping + grunning.",
  },
  {
    id: "lerhyttan-svart",
    label: "LERHYTTAN svartbeiset",
    style: "country",
    surface: "Bjørkeramme, beiset",
    paintable: true,
    factoryHex: "#3a3330",
    sizes: { d4060: "front-lerhyttan-svart-40x60", d6060: "front-lerhyttan-svart-60x60", d4040: "front-lerhyttan-svart-40x40" },
  },
  {
    id: "axstad-gragronn",
    label: "AXSTAD matt grågrønn",
    style: "shaker",
    surface: "Plastfolie",
    paintable: false,
    factoryHex: "#8e9a8c",
    sizes: { d4060: "front-axstad-gragronn-40x60", d6060: "front-axstad-gragronn-60x60", d4040: "front-axstad-gragronn-40x40" },
    caveat: "Folie — skal IKKE males (slipper i kanter). Fin fabrikkfarge i seg selv.",
  },
  {
    id: "havstorp-beige",
    label: "HAVSTORP beige",
    style: "flat",
    surface: "Akrylmalt MDF",
    paintable: true,
    factoryHex: "#d9cdb8",
    sizes: { d4060: "front-havstorp-beige-40x60", d6060: "front-havstorp-beige-60x60", d4040: "front-havstorp-beige-40x40" },
    caveat: "Nærmeste fabrikk-grå-beige — men glatt, ikke shaker.",
  },
  {
    id: "havstorp-brunbeige",
    label: "HAVSTORP brunbeige",
    style: "flat",
    surface: "Akrylmalt MDF",
    paintable: true,
    factoryHex: "#b5a387",
    sizes: { d4060: "front-havstorp-brunbeige-40x60", d6060: "front-havstorp-brunbeige-60x60", d4040: "front-havstorp-brunbeige-40x40" },
  },
  {
    id: "havstorp-lysgra",
    label: "HAVSTORP lys grå",
    style: "flat",
    surface: "Akrylmalt MDF",
    paintable: true,
    factoryHex: "#cfd0cd",
    sizes: { d4060: "front-havstorp-lysgra-40x60", d6060: "front-havstorp-lysgra-60x60", d4040: "front-havstorp-lysgra-40x40" },
  },
  {
    id: "veddinge-hvit",
    label: "VEDDINGE hvit",
    style: "flat",
    surface: "PU-malt MDF",
    paintable: true,
    factoryHex: "#f4f3ef",
    sizes: { d4060: "front-veddinge-hvit-40x60", d6060: "front-veddinge-hvit-60x60", d4040: "veddinge-door-40x40" },
  },
  {
    id: "vallstena-hvit",
    label: "VALLSTENA hvit",
    style: "flat",
    surface: "Folie",
    paintable: false,
    factoryHex: "#f5f4f0",
    sizes: { d4060: "front-vallstena-hvit-40x60", d6060: "front-vallstena-hvit-60x60", d4040: "front-vallstena-hvit-40x40" },
    caveat: "Billigst av alt — folie, males ikke.",
  },
  {
    id: "enkoping-hvit",
    label: "ENKÖPING hvit trestruktur",
    style: "flat",
    surface: "Folie med tremønster",
    paintable: false,
    factoryHex: "#ece7dc",
    sizes: { d4060: "front-enkoping-hvit-40x60", d6060: "front-enkoping-hvit-60x60", d4040: "front-enkoping-hvit-40x40" },
  },
  {
    id: "askersund-ask",
    label: "ASKERSUND lys ask",
    style: "flat",
    surface: "Folie med askemønster",
    paintable: false,
    factoryHex: "#e3d5bd",
    sizes: { d4060: "front-askersund-ask-40x60", d6060: "front-askersund-ask-60x60", d4040: "front-askersund-ask-40x40" },
  },
  {
    id: "nickebo-antrasitt",
    label: "NICKEBO matt antrasitt",
    style: "flat",
    surface: "Folie",
    paintable: false,
    factoryHex: "#3b3d3e",
    sizes: { d4060: "front-nickebo-antrasitt-40x60", d6060: "front-nickebo-antrasitt-60x60", d4040: "front-nickebo-antrasitt-40x40" },
  },
  {
    id: "aspudden-hvit",
    label: "ASPUDDEN hvit",
    style: "flat",
    surface: "Profilert — sjekk produktside",
    paintable: false,
    factoryHex: "#f1efe8",
    sizes: { d4060: "front-aspudden-hvit-40x60", d6060: "front-aspudden-hvit-60x60", d4040: "front-aspudden-hvit-40x40" },
    caveat: "Ny serie — overflate/malbarhet usjekket.",
  },
  {
    id: "terrsjo-brun",
    label: "TERRSJÖ brun",
    style: "flat",
    surface: "Ny serie — usjekket",
    paintable: false,
    factoryHex: "#7b5c42",
    sizes: { d4060: "front-terrsjo-brun-40x60", d6060: "front-terrsjo-brun-60x60", d4040: "front-terrsjo-brun-40x40" },
    caveat: "Ny serie — overflate/malbarhet usjekket.",
  },
  {
    id: "voxtorp-beige",
    label: "VOXTORP matt beige",
    style: "flat",
    surface: "Matt folie, avrundede kanter",
    paintable: false,
    factoryHex: "#d6c9b2",
    sizes: { d4060: "front-voxtorp-beige-40x60", d6060: "front-voxtorp-beige-60x60", d4040: "front-voxtorp-beige-40x40" },
    caveat: "40x40-varianten kan være hvit — sjekk.",
  },
  {
    id: "ringhult-hvit",
    label: "RINGHULT høyglans hvit",
    style: "gloss",
    surface: "Høyglans folie",
    paintable: false,
    factoryHex: "#f6f6f4",
    sizes: { d4060: "front-ringhult-hvit-40x60", d6060: "front-ringhult-hvit-60x60", d4040: "front-ringhult-hvit-40x40" },
  },
  {
    id: "upplov-beige",
    label: "UPPLÖV matt mørk beige",
    style: "flat",
    surface: "Matt folie",
    paintable: false,
    integratedHandle: true,
    factoryHex: "#cbb9a0",
    sizes: { d4060: "front-upplov-beige-40x60", d6060: "front-upplov-beige-60x60", d4040: "front-upplov-beige-40x40" },
    caveat: "Integrert grep — knotter unødvendige (fjernes fra listen).",
  },
  {
    id: "sinarp-brun",
    label: "SINARP brun eikefinér",
    style: "shaker",
    surface: "Eikefinér",
    paintable: false,
    factoryHex: "#8a5f3f",
    sizes: { d4060: "front-sinarp-brun-40x60", d6060: "front-sinarp-brun-60x60", d4040: "front-sinarp-brun-40x40" },
    caveat: "Finér — males ikke.",
  },
  {
    id: "forsbacka-eik",
    label: "FORSBACKA eik",
    style: "shaker",
    surface: "Eikefinér, rammelook",
    paintable: false,
    factoryHex: "#c9a06a",
    sizes: { d4060: "front-forsbacka-eik-40x60", d6060: "front-forsbacka-eik-60x60", d4040: "front-forsbacka-eik-40x40" },
  },
];

const byId = new Map(FRONTS.map((f) => [f.id, f]));

export function getFront(id: string): FrontOption {
  const f = byId.get(id);
  if (!f) throw new Error(`Ukjent front: ${id}`);
  return f;
}
