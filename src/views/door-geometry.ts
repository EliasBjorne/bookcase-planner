/** Shared 3D door-profile geometry for the 3D view and the Foto scene, so the
 * chosen front looks the same everywhere. All numbers in mm; the door slab
 * itself (18 mm) is drawn by the caller — these are the parts on top of it. */

export type DoorStyle = "shaker" | "flat" | "bevel" | "country" | "gloss";

export interface DoorPart {
  w: number;
  h: number;
  /** Part thickness (depth). */
  t: number;
  /** Offset of the part's centre from the door centre. */
  dx: number;
  dy: number;
  /** Distance of the part's centre out from the slab front face. */
  dz: number;
}

function frame(dw: number, dh: number, fw: number, t: number, dz: number): DoorPart[] {
  return [
    { w: dw, h: fw, t, dx: 0, dy: (dh - fw) / 2, dz },
    { w: dw, h: fw, t, dx: 0, dy: -(dh - fw) / 2, dz },
    { w: fw, h: dh - 2 * fw, t, dx: -(dw - fw) / 2, dy: 0, dz },
    { w: fw, h: dh - 2 * fw, t, dx: (dw - fw) / 2, dy: 0, dz },
  ];
}

export function doorProfileParts(dw: number, dh: number, style: DoorStyle): DoorPart[] {
  switch (style) {
    case "shaker": {
      // Raised rails/stiles around a recessed flat panel (the slab).
      const fw = Math.min(dw * 0.23, 95);
      return frame(dw, dh, fw, 8, 4);
    }
    case "bevel": {
      // BODBYN-style: flat border with a RAISED, stepped centre panel.
      const m1 = Math.min(dw * 0.2, 85);
      const m2 = m1 + 42;
      return [
        { w: dw - 2 * m1, h: dh - 2 * m1, t: 5, dx: 0, dy: 0, dz: 2.5 },
        { w: dw - 2 * m2, h: dh - 2 * m2, t: 6, dx: 0, dy: 0, dz: 7.5 },
      ];
    }
    case "country": {
      // LERHYTTAN-style: wide frame plus an inner moulding ring.
      const fw = Math.min(dw * 0.21, 90);
      const ring = 20;
      const inset = fw + 12;
      return [
        ...frame(dw, dh, fw, 8, 4),
        { w: dw - 2 * inset, h: ring, t: 4, dx: 0, dy: (dh - 2 * inset - ring) / 2 - 0, dz: 9 },
        { w: dw - 2 * inset, h: ring, t: 4, dx: 0, dy: -((dh - 2 * inset - ring) / 2), dz: 9 },
        { w: ring, h: dh - 2 * inset - 2 * ring, t: 4, dx: -(dw - 2 * inset - ring) / 2, dy: 0, dz: 9 },
        { w: ring, h: dh - 2 * inset - 2 * ring, t: 4, dx: (dw - 2 * inset - ring) / 2, dy: 0, dz: 9 },
      ];
    }
    default:
      return [];
  }
}
