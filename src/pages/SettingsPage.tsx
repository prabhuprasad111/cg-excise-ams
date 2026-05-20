import { FileSpreadsheet, Printer, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { useAppStore } from "../store/useAppStore";
import { useToastStore } from "../store/useToastStore";
import { parseDistrictBlockWorkbook } from "../utils/excel";
import { downloadCsv } from "../utils/csv";
import { defaultDistricts } from "../data/seed";

export function SettingsPage() {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const officerDistrictId = useAppStore((s) => s.officerDistrictId);
  const setOfficerDistrict = useAppStore((s) => s.setOfficerDistrict);
  const districts = useAppStore((s) => s.districts);
  const importDistrictsFromExcel = useAppStore((s) => s.importDistrictsFromExcel);
  const resetHierarchyToDefault = useAppStore((s) => s.resetHierarchyToDefault);
  const hierarchyFromExcel = useAppStore((s) => s.hierarchyFromExcel);
  const lowStockThresholdBottles = useAppStore((s) => s.lowStockThresholdBottles);
  const setLowStockThreshold = useAppStore((s) => s.setLowStockThreshold);
  const centralStock = useAppStore((s) => s.centralStock);
  const issues = useAppStore((s) => s.issues);
  const distributions = useAppStore((s) => s.distributions);
  const auditLogs = useAppStore((s) => s.auditLogs);
  const push = useToastStore((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const buf = await f.arrayBuffer();
      const parsed = parseDistrictBlockWorkbook(buf);
      if (!parsed.length) {
        push("error", "No rows parsed", "Expected columns like District + Block (see template).");
        return;
      }
      importDistrictsFromExcel(parsed);
      push("success", "Hierarchy imported", `${parsed.length} districts loaded from ${f.name}.`);
    } catch {
      push("error", "Parse failed", "Could not read the workbook.");
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    downloadCsv(
      "cg-excise-district-block-template.csv",
      ["District", "Block"],
      defaultDistricts.flatMap((d) => d.blocks.map((b) => [d.name, b.name])),
    );
    push("info", "Template downloaded", "Use the same headers in Excel, or upload this CSV saved as .xlsx.");
  }

  function printReport() {
    const w = window.open("", "_blank");
    if (!w) {
      push("error", "Popup blocked", "Allow popups to print.");
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><title>CG Excise AMS Report</title>
      <style>body{font-family:system-ui;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;font-size:12px;text-align:left}h1{color:#0f3d2e}</style></head><body>
      <h1>Alcohol Management — Summary</h1>
      <p>Generated ${new Date().toLocaleString()}</p>
      <h2>Stock</h2>
      <table><tr><th>Liquor</th><th>Brand</th><th>Qty</th><th>Unit</th></tr>
      ${centralStock.map((s) => `<tr><td>${s.liquorName}</td><td>${s.brand}</td><td>${s.quantity}</td><td>${s.unit}</td></tr>`).join("")}
      </table>
      <h2>Issues (${issues.length})</h2>
      <table><tr><th>When</th><th>District</th><th>Lines</th></tr>
      ${issues.map((i) => `<tr><td>${i.createdAt}</td><td>${i.districtName}</td><td>${i.lines.length}</td></tr>`).join("")}
      </table>
      <h2>Distributions (${distributions.length})</h2>
      <table><tr><th>When</th><th>Shop</th><th>District</th></tr>
      ${distributions.map((d) => `<tr><td>${d.createdAt}</td><td>${d.shopName}</td><td>${d.districtName}</td></tr>`).join("")}
      </table>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
    push("info", "Print dialog opened");
  }

  function exportMaster() {
    downloadCsv(
      `cg-excise-master-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Section", "Detail"],
      [
        ["Districts", String(districts.length)],
        ["Issues", String(issues.length)],
        ["Distributions", String(distributions.length)],
        ["Audit rows", String(auditLogs.length)],
        ...centralStock.map((s) => ["Stock", `${s.liquorName} / ${s.quantity} ${s.unit}`]),
      ],
    );
    push("info", "Master summary CSV exported");
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: "Data & configuration" }]} />
      <h1 className="page-title mb-2 text-2xl font-bold text-[var(--color-cg-green-900)]">Data import & roles</h1>
      <p className="page-lead mb-6 text-sm text-slate-600">
        Upload an Excel workbook with district and block columns (simulating CG master data). Falls back to built-in mock hierarchy when
        cleared. Reference:{" "}
        <a className="text-[var(--color-cg-blue-700)] underline hover:text-[var(--color-cg-orange-600)]" href="https://excise.cg.nic.in/Home" target="_blank" rel="noreferrer">
          Excise Department Chhattisgarh
        </a>
        .
      </p>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Excel upload (district / block)">
          <p className="mb-3 text-xs text-slate-600">
            Recognises headers such as <strong>District</strong> and <strong>Block</strong> (also Tehsil). Your file &quot;Chhatisgarh DIst
            list.xlsx&quot; can be uploaded here once it contains those columns.
          </p>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFile} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4" />
              {busy ? "Reading…" : "Upload Excel"}
            </Button>
            <Button variant="ghost" onClick={downloadTemplate}>
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV template
            </Button>
            <Button variant="ghost" onClick={resetHierarchyToDefault} disabled={!hierarchyFromExcel}>
              <RotateCcw className="h-4 w-4" />
              Reset to mock data
            </Button>
          </div>
          {hierarchyFromExcel && <p className="mt-3 text-xs font-medium text-[var(--color-cg-blue-700)]">Using imported hierarchy.</p>}
        </Card>

        <Card title="Role simulation">
          <label className="mb-3 block text-xs font-semibold text-slate-600">
            Active role
            <Select className="mt-1" value={role} onChange={(e) => setRole(e.target.value as "admin" | "district_officer")}>
              <option value="admin">Administrator (full)</option>
              <option value="district_officer">District officer (scoped)</option>
            </Select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Officer home district
            <Select
              className="mt-1"
              value={officerDistrictId ?? ""}
              onChange={(e) => setOfficerDistrict(e.target.value || null)}
              disabled={districts.length === 0}
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </label>
        </Card>

        <Card title="Low-stock threshold (bottle-equivalent)">
          <Input
            type="number"
            min={0}
            value={lowStockThresholdBottles}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
          />
          <p className="mt-2 text-xs text-slate-500">Cases are counted as 12 bottles for this alert.</p>
        </Card>

        <Card title="Reports">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={printReport}>
              <Printer className="h-4 w-4" />
              Print summary
            </Button>
            <Button variant="secondary" onClick={exportMaster}>
              Export master CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
