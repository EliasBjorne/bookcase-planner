import type { Design } from "./types";
import { getItem, priceFor } from "./catalogue";

export interface PartsLine {
  itemId: string;
  vendor: string;
  name: string;
  article?: string;
  qty: number;
  packs: number;
  priceNok?: number;
  url?: string;
  verified: boolean;
}

export interface CustomLine {
  label: string;
  material: string;
  wMm: number;
  dMm: number;
  hMm: number;
  note?: string;
}

export interface CostSummary {
  parts: PartsLine[];
  custom: CustomLine[];
  totalNok: number;
  unverifiedNok: number;
  vendors: string[];
}

export function partsList(d: Design): CostSummary {
  const qtyByItem = new Map<string, number>();
  const custom: CustomLine[] = [];

  for (const p of d.extraParts) {
    qtyByItem.set(p.itemId, (qtyByItem.get(p.itemId) ?? 0) + p.qty);
  }

  for (const m of d.modules) {
    if (m.source.type === "catalogue") {
      qtyByItem.set(m.source.itemId, (qtyByItem.get(m.source.itemId) ?? 0) + m.source.qty);
    } else {
      custom.push({
        label: m.label,
        material: m.source.material,
        wMm: m.w,
        dMm: m.d,
        hMm: m.h,
        note: m.cut?.note,
      });
    }
  }

  const parts: PartsLine[] = [...qtyByItem.entries()].map(([itemId, qty]) => {
    const item = getItem(itemId);
    const { packs, priceNok } = priceFor(itemId, qty);
    return {
      itemId,
      vendor: item.vendor,
      name: item.name,
      article: item.article,
      qty,
      packs,
      priceNok,
      url: item.url,
      verified: item.verified,
    };
  });
  parts.sort((a, b) => a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name));

  const totalNok = parts.reduce((s, p) => s + (p.priceNok ?? 0), 0);
  const unverifiedNok = parts
    .filter((p) => !p.verified)
    .reduce((s, p) => s + (p.priceNok ?? 0), 0);

  return {
    parts,
    custom,
    totalNok,
    unverifiedNok,
    vendors: [...new Set(parts.map((p) => p.vendor))],
  };
}
