import type { CatalogueItem } from "./types";
import ikea from "../../catalogue/ikea-no.json";
import vendors from "../../catalogue/vendors-no.json";
import fronts from "../../catalogue/fronts-no.json";

const all: CatalogueItem[] = [
  ...(ikea.items as CatalogueItem[]),
  ...(vendors.items as CatalogueItem[]),
  ...(fronts.items as unknown as CatalogueItem[]),
];

const byId = new Map(all.map((i) => [i.id, i]));

export function getItem(id: string): CatalogueItem {
  const item = byId.get(id);
  if (!item) throw new Error(`Unknown catalogue item: ${id}`);
  return item;
}

export function allItems(): CatalogueItem[] {
  return all;
}

/** Price for buying `qty` units, respecting pack sizes (rounds packs up). */
export function priceFor(id: string, qty: number): { packs: number; priceNok: number | undefined } {
  const item = getItem(id);
  const pack = item.packQty ?? 1;
  const packs = Math.ceil(qty / pack);
  return { packs, priceNok: item.priceNok === undefined ? undefined : packs * item.priceNok };
}
