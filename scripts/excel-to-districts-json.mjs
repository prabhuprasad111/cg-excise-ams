/**
 * One-time / maintenance script: read the workbook and write public JSON.
 * Run: npm run data:build-districts
 */
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const xlsxPath = path.join(__dirname, "../public/data/chhattisgarh-district-block-list.xlsx");
const outPath = path.join(__dirname, "../public/data/chhattisgarh-districts.json");

function norm(h) {
  return String(h).replace(/\s+/g, " ").trim().toLowerCase();
}

function pick(row, candidates) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const hit = keys.find((k) => norm(k) === norm(c));
    if (hit != null && row[hit] != null) {
      const v = String(row[hit]).trim();
      if (v) return v;
    }
  }
  for (const c of candidates) {
    const hit = keys.find((k) => norm(k).includes(norm(c)));
    if (hit != null && row[hit] != null) {
      const v = String(row[hit]).trim();
      if (v) return v;
    }
  }
  return undefined;
}

function toNum(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const n = Number(String(raw ?? "").trim());
  return Number.isFinite(n) ? n : undefined;
}

function demoIssueQty(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 120 + (h % 880);
}

function demoBlockActivity(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 37 + seed.charCodeAt(i)) >>> 0;
  return 25 + (h % 175);
}

if (!fs.existsSync(xlsxPath)) {
  console.error("Missing:", xlsxPath);
  process.exit(1);
}

const wb = XLSX.read(fs.readFileSync(xlsxPath));
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const byDistrict = new Map();

for (const row of rows) {
  const district =
    pick(row, ["district", "district name", "dist"]) ??
    pick(row, Object.keys(row).filter((k) => /district/i.test(k)));
  const block =
    pick(row, ["block", "block name", "tehsil", "taluk"]) ??
    pick(row, Object.keys(row).filter((k) => /block|tehsil/i.test(k)));
  if (!district || !block) continue;

  const dKey = district.trim();
  if (!byDistrict.has(dKey)) {
    byDistrict.set(dKey, {
      name: dKey,
      code: toNum(row["District Code"] ?? row["district code"]),
      blocks: [],
      _blockSet: new Set(),
    });
  }
  const entry = byDistrict.get(dKey);
  if (entry.code == null) {
    const c = toNum(row["District Code"] ?? row["district code"]);
    if (c != null) entry.code = c;
  }
  if (!entry._blockSet.has(block)) {
    entry._blockSet.add(block);
    entry.blocks.push({
      name: block.trim(),
      code: toNum(row["Block Code"] ?? row["block code"]),
    });
  }
}

const districts = [...byDistrict.values()]
  .map(({ _blockSet, ...d }) => {
    const blocks = d.blocks
      .map((b) => ({
        name: b.name,
        ...(b.code != null ? { code: b.code } : {}),
        activity: demoBlockActivity(`${d.name}|${b.name}|${b.code ?? ""}`),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const blockActivity = blocks.reduce((s, b) => s + b.activity, 0);
    return {
      name: d.name,
      ...(d.code != null ? { code: d.code } : {}),
      issueQty: demoIssueQty(`${d.name}|${d.code ?? ""}`),
      blockActivity,
      blocks,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const payload = {
  source: "chhattisgarh-district-block-list.xlsx",
  generatedAt: new Date().toISOString(),
  districtCount: districts.length,
  districts,
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${districts.length} districts to ${outPath}`);
