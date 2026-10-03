/**
 * One-off importer: reads a saved IKEA kitchen-planner design (HomeByMe .BMPROJ,
 * public JSON on S3) and writes designs/kitchen-seed.json with the cabinets as
 * plain modules. Read-only against IKEA/HomeByMe; never used at app runtime.
 *
 * Usage: npm run import-bmproj -- <project-id>
 */
import { writeFileSync } from "node:fs";

const projectId = process.argv[2] ?? "2EF18B9F-0781-4D01-9C0D-37C5827854B2";
const API = `https://platform.ikea-prod.by.me/api/3/projects/${projectId}`;

interface Furniture {
  uuid?: string;
  transfo?: number[]; // column-major 4x4, translation at [12..14], floor-plan mm, z up
  parametersConfig?: { paramID: string; value: unknown }[];
  resourceInfo?: { dbId?: string };
  [k: string]: unknown;
}

function findArrays(obj: unknown, key: string, out: unknown[][] = []): unknown[][] {
  if (obj === null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (k === key && Array.isArray(v)) out.push(v);
    findArrays(v, key, out);
  }
  return out;
}

async function main(): Promise<void> {
  // No login token needed; the API wants a current UTC timestamp in 16-char
  // basic-ISO format, e.g. 20261003T104406Z (stale timestamps are rejected).
  const ts = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const meta = await fetch(API, { headers: { timestamp: ts } });
  if (!meta.ok) {
    throw new Error(
      `Project metadata fetch failed: ${meta.status} ${await meta.text()} — ` +
        `the endpoint shape may have changed; this importer is best-effort.`,
    );
  }
  const metaJson = (await meta.json()) as { projectName?: string; bmProjURL?: string };
  console.log(`Project: ${metaJson.projectName}`);
  if (!metaJson.bmProjURL) throw new Error("No bmProjURL in metadata");

  const proj = await fetch(metaJson.bmProjURL);
  if (!proj.ok) throw new Error(`BMPROJ fetch failed: ${proj.status}`);
  const projJson = (await proj.json()) as Record<string, unknown>;

  const furnitures = findArrays(projJson, "furnitures").flat() as Furniture[];
  const walls = findArrays(projJson, "walls").flat();

  const modules = furnitures
    .map((f, i) => {
      const params = new Map(
        (f.parametersConfig ?? []).map((p) => [p.paramID, p.value] as const),
      );
      const num = (k: string): number | undefined =>
        typeof params.get(k) === "number" ? (params.get(k) as number) : undefined;
      const ref = (k: string): string | undefined =>
        (params.get(k) as { dbId?: string } | null | undefined)?.dbId;
      const t = f.transfo ?? [];
      const [tx, ty] = t.length === 16 ? [t[12], t[13]] : [0, 0];
      const w = num("width");
      const h = num("height");
      if (!w || !h) return null;
      return {
        id: `kitchen-${i}`,
        uuid: f.uuid,
        label: `METOD ${w}×${num("depth")}×${h}, front ${ref("front") ?? "?"}`,
        kind: "cabinet",
        legHeight: num("legHeight"),
        leg: ref("leg"),
        handle: ref("handle"),
        // Floor-plan position (z up in HomeByMe); keep raw for reference.
        planXMm: Math.round(tx),
        planYMm: Math.round(ty),
        w,
        d: num("depth") ?? 0,
        h,
      };
    })
    .filter((m) => m !== null);

  const out = {
    comment:
      "Seed imported from the IKEA kitchen planner (HomeByMe BMPROJ). Positions are raw matrix translations — verify before use. This file is reference data, not one of the five bookcase variants.",
    importedAt: new Date().toISOString(),
    projectId,
    projectName: metaJson.projectName,
    wallCount: walls.length,
    modules,
  };
  writeFileSync("designs/kitchen-seed.json", JSON.stringify(out, null, 2));
  console.log(`Wrote designs/kitchen-seed.json with ${modules.length} modules, ${walls.length} walls.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
