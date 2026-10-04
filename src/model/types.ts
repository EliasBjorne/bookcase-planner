/** All dimensions in mm, prices in NOK. Coordinate system: x along the wall
 * from the left corner, y up from the floor, z out from the wall. */

export interface CatalogueItem {
  id: string;
  vendor: string;
  name: string;
  article?: string;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  priceNok?: number;
  packQty?: number;
  url?: string;
  imageUrl?: string;
  verified: boolean;
  verifiedAt?: string;
  notes?: string;
}

export interface Room {
  /** Free wall width, left corner to the shaft. */
  wallWidthMm: number;
  /** Clear height to the underside of the soffit (nedhakk). */
  soffitHeightMm: number;
  /** Shaft at the right end of the wall. */
  shaftWidthMm: number;
  shaftDepthMm: number;
  /** Downlight centres, distance out from the wall. */
  downlightOffsetMm: number;
}

export type ModuleKind =
  | "cabinet" // closed carcass
  | "shelf" // open shelving carcass or bay
  | "top" // worktop / top board
  | "plinth"
  | "filler" // MDF filler / scribe
  | "panel"; // MDF cladding, crown, face frame

export type ModuleSource =
  | { type: "catalogue"; itemId: string; qty: number }
  | { type: "custom"; material: string };

export interface CutInstruction {
  /** e.g. "cut sides to 1650 mm, re-drill top cam locks, trim back panel" */
  note: string;
}

export interface Module {
  id: string;
  label: string;
  kind: ModuleKind;
  source: ModuleSource;
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** When one module represents a row of N identical catalogue units side by side. */
  unitsAcross?: number;
  /** Number of equal columns to draw (vertical dividers). */
  columns?: number;
  /** Number of shelf lines to draw per column. */
  shelves?: number;
  /** Door columns to draw on the front. */
  doors?: number;
  /** Visual door profile and colour (set by the configurator; defaults shaker/unit colour). */
  doorStyle?: "shaker" | "flat" | "bevel" | "country" | "gloss";
  doorColorHex?: string;
  doorKnobs?: boolean;
  knobColorHex?: string;
  cut?: CutInstruction;
  colorHex?: string;
}

/** Parts that belong to the design but have no drawn geometry of their own
 * (legs, doors, loose shelves, rails). */
export interface ExtraPart {
  itemId: string;
  qty: number;
  label?: string;
}

export interface Design {
  id: string;
  name: string;
  description: string;
  room: Room;
  /** Left edge of the unit, from the left corner. */
  unitOffsetMm: number;
  /** Target overall width (for validation). */
  targetWidthMm: number;
  modules: Module[];
  extraParts: ExtraPart[];
  /** Carpenter notes / things to measure on site. */
  siteNotes: string[];
  /** Candid one-paragraph verdict vs the reference render. */
  verdict: string;
}

export interface Violation {
  level: "error" | "warning" | "info";
  message: string;
  moduleId?: string;
}
