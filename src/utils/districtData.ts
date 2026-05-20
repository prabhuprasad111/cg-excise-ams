import { titleDistrictLabel, toGeoDistrictName } from "../features/dashboard/chhattisgarh/districtGeoAliases";
import { districtIssueTotals } from "./stats";
import type { StateIssue } from "../types";

export type DistrictMapRow = {
  district: string;
  mapName: string;
  label: string;
  code?: number;
  /** Number of blocks in the district */
  blocks: number;
  /** Sum of block-level demo activity (bottle-equiv. index) */
  blockActivity: number;
  value: number;
};
export interface DistrictBlockJson {
  name: string;
  code?: number;
  /** Demo distribution activity for charts */
  activity?: number;
}

export interface DistrictJsonEntry {
  name: string;
  code?: number;
  /** Demo issue volume when no live issues exist for this district */
  issueQty?: number;
  blockActivity?: number;
  blocks: DistrictBlockJson[];
}

export interface ChhattisgarhDistrictsFile {
  source?: string;
  generatedAt?: string;
  districtCount?: number;
  districts: DistrictJsonEntry[];
}

/** Resolve a file under `public/` (honours Vite `base`, e.g. `/cg-excise-ams/`). */
export function publicDataUrl(relativePath: string): string {
  const path = relativePath.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${path}`;
}

export const DISTRICTS_JSON_URL = publicDataUrl("data/chhattisgarh-districts.json");
export const CG_DISTRICTS_GEOJSON_URL = publicDataUrl("data/cg-districts.geojson");

function normKey(s: string): string {
  return s.trim().toLowerCase();
}

/** Stable dummy value when a district has no recorded issues. */
export function hashDummyDistrictValue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return 12 + (h % 188);
}

export function districtMapRowsFromJson(file: ChhattisgarhDistrictsFile, issues: StateIssue[]): DistrictMapRow[] {
  const totals = new Map(districtIssueTotals(issues).map((t) => [normKey(t.name), t.value]));

  return file.districts
    .map((d) => {
      const fromStore = totals.get(normKey(d.name));
      const v =
        fromStore ??
        d.issueQty ??
        hashDummyDistrictValue(d.name);
      const blockActivity =
        d.blockActivity ??
        (d.blocks.reduce((s, b) => s + (b.activity ?? 0), 0) || d.blocks.length * 40);
      return {
        district: d.name,
        mapName: toGeoDistrictName(d.name),
        label: titleDistrictLabel(d.name),
        code: d.code,
        blocks: d.blocks.length,
        blockActivity,
        value: v,
      };
    })
    .sort((a, b) => a.district.localeCompare(b.district));
}

export function rowsFromIssuesOnly(issues: StateIssue[]): DistrictMapRow[] {
  const totals = districtIssueTotals(issues);
  return totals.map((t) => ({
    district: t.name,
    mapName: toGeoDistrictName(t.name),
    label: titleDistrictLabel(t.name),
    blocks: 0,
    blockActivity: 0,
    value: t.value,
  }));
}
