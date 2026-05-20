import * as XLSX from "xlsx";
import { newId } from "./id";
import type { BlockRecord, DistrictRecord } from "../types";

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, " ").trim().toLowerCase();
}

function pickColumn(row: Record<string, unknown>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const hit = keys.find((k) => normalizeHeader(k) === normalizeHeader(c));
    if (hit && row[hit] != null) {
      const v = String(row[hit]).trim();
      if (v) return v;
    }
  }
  for (const c of candidates) {
    const hit = keys.find((k) => normalizeHeader(k).includes(normalizeHeader(c)));
    if (hit && row[hit] != null) {
      const v = String(row[hit]).trim();
      if (v) return v;
    }
  }
  return undefined;
}

export function parseDistrictBlockWorkbook(buffer: ArrayBuffer): DistrictRecord[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const map = new Map<string, Set<string>>();

  const codeByDistrict = new Map<string, number>();

  for (const row of rows) {
    const district =
      pickColumn(row, ["district", "district name", "dist", "जिला"]) ??
      pickColumn(row, Object.keys(row).filter((k) => /district|जिला/i.test(k)));
    const block =
      pickColumn(row, ["block", "block name", "tehsil", "taluk", "ब्लॉक"]) ??
      pickColumn(row, Object.keys(row).filter((k) => /block|tehsil/i.test(k)));
    if (!district || !block) continue;
    if (!map.has(district)) map.set(district, new Set());
    map.get(district)!.add(block);
    if (!codeByDistrict.has(district)) {
      const raw =
        row["District Code"] ??
        row["district code"] ??
        pickColumn(row, ["district code", "dist code", "lgd code"]);
      const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
      if (Number.isFinite(n)) codeByDistrict.set(district, n);
    }
  }

  const districts: DistrictRecord[] = [];
  for (const [name, blocks] of map.entries()) {
    const blockList: BlockRecord[] = [...blocks].map((bn) => ({
      id: newId("blk"),
      name: bn,
    }));
    districts.push({
      id: newId("dist"),
      name,
      code: codeByDistrict.get(name),
      blocks: blockList,
    });
  }
  return districts;
}
