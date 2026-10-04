/** Knob options for the wizard — real products with photos. `colorHex` drives
 * the knob colour in the SVG render, 3D and Foto so the choice is visible. */

export interface KnobOption {
  id: string;
  label: string;
  desc: string;
  /** Catalogue item id (priced per pack where applicable). */
  itemId: string;
  colorHex: string;
  imageUrl?: string;
  productUrl?: string;
  caveat?: string;
  recommended?: boolean;
}

export const KNOBS: KnobOption[] = [
  {
    id: "bagganas-messing",
    label: "BAGGANÄS 20 mm messing",
    desc: "Messingfarget belagt stål — referansebildets look. 90 kr/2-pk.",
    itemId: "bagganas-knob-brass-2pk",
    colorHex: "#c9a227",
    imageUrl: "https://www.ikea.com/no/no/images/products/bagganaes-knotter-messingfarget__0754180_pe747813_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/bagganaes-knotter-messingfarget-80338408/",
    recommended: true,
  },
  {
    id: "beslag-uno",
    label: "Beslag Design Uno 30 mm",
    desc: "EKTE ubehandlet messing som patinerer, ~185 kr/stk.",
    itemId: "beslag-design-uno-knob",
    colorHex: "#caa13a",
    productUrl: "https://beslagdesign.no/no/produkter/knotter/messing",
    caveat: "Pris fra søk — sjekk forhandler. Bilde hos forhandleren.",
  },
  {
    id: "eneryda-messing-27",
    label: "ENERYDA 27 mm messing",
    desc: "Klassisk rund profil, 90 kr/2-pk.",
    itemId: "eneryda-knob-messing-27-2pk",
    colorHex: "#c9a227",
    imageUrl: "https://www.ikea.com/no/no/images/products/eneryda-knotter-messingfarget__1427450_pe980247_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/eneryda-knotter-messingfarget-50610862/",
  },
  {
    id: "eneryda-messing-35",
    label: "ENERYDA 35 mm messing",
    desc: "Større grep, 135 kr/2-pk.",
    itemId: "eneryda-knob-messing-35-2pk",
    colorHex: "#c9a227",
    imageUrl: "https://www.ikea.com/no/no/images/products/eneryda-knotter-messingfarget__1427452_pe980249_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/eneryda-knotter-messingfarget-80610865/",
  },
  {
    id: "kalerum-messing",
    label: "KALERUM 30 mm messing",
    desc: "Flat sylinder, 90 kr/2-pk.",
    itemId: "kalerum-knob-messing-2pk",
    colorHex: "#c9a227",
    imageUrl: "https://www.ikea.com/no/no/images/products/kalerum-knotter-messingfarget__1370954_pe958919_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/kalerum-knotter-messingfarget-60596554/",
  },
  {
    id: "bagganas-svart",
    label: "BAGGANÄS 21 mm svart",
    desc: "Svart stål — kontrast mot lyse dører. 90 kr/2-pk.",
    itemId: "bagganas-knob-svart-2pk",
    colorHex: "#2a2a2a",
    imageUrl: "https://www.ikea.com/no/no/images/products/bagganaes-knotter-svart__0753944_pe747748_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/bagganaes-knotter-svart-90338417/",
  },
  {
    id: "eneryda-svart-27",
    label: "ENERYDA 27 mm svart",
    desc: "90 kr/2-pk.",
    itemId: "eneryda-knob-svart-27-2pk",
    colorHex: "#2a2a2a",
    imageUrl: "https://www.ikea.com/no/no/images/products/eneryda-knotter-svart__0754157_pe747799_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/eneryda-knotter-svart-80347506/",
  },
  {
    id: "tarnestad-eik",
    label: "TÄRNESTAD 17 mm eik",
    desc: "Treknott — varm mot malte dører. 75 kr/2-pk.",
    itemId: "tarnestad-knob-eik-2pk",
    colorHex: "#b98e5a",
    imageUrl: "https://www.ikea.com/no/no/images/products/taernestad-knotter-eik__1138794_pe880066_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/taernestad-knotter-eik-20542860/",
  },
  {
    id: "hamphult-eik",
    label: "HAMPHULT 22 mm eik",
    desc: "95 kr/2-pk.",
    itemId: "hamphult-knob-eik-2pk",
    colorHex: "#b98e5a",
    imageUrl: "https://www.ikea.com/no/no/images/products/hamphult-knotter-eik__1458417_pe993032_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/hamphult-knotter-eik-00614240/",
  },
  {
    id: "klingstorp-krom",
    label: "KLINGSTORP 30 mm offwhite/krom",
    desc: "Porselenslook med kromring, 70 kr/2-pk.",
    itemId: "klingstorp-knob-2pk",
    colorHex: "#d9d9d6",
    imageUrl: "https://www.ikea.com/no/no/images/products/klingstorp-knotter-offwhite-forkrommet__1207662_pe908124_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/klingstorp-knotter-offwhite-forkrommet-60553682/",
  },
  {
    id: "gubbarp-hvit",
    label: "GUBBARP 21 mm hvit",
    desc: "Budsjettvinneren: 10 kr/2-pk.",
    itemId: "gubbarp-knob-hvit-2pk",
    colorHex: "#f2f1ec",
    imageUrl: "https://www.ikea.com/no/no/images/products/gubbarp-knotter-hvit__0754163_pe747805_s5.jpg",
    productUrl: "https://www.ikea.com/no/no/p/gubbarp-knotter-hvit-80336433/",
    caveat: "Plast — ser billig ut på nært hold.",
  },
];

const byId = new Map(KNOBS.map((k) => [k.id, k]));

export function getKnob(id: string): KnobOption {
  const k = byId.get(id);
  if (!k) throw new Error(`Ukjent knott: ${id}`);
  return k;
}
