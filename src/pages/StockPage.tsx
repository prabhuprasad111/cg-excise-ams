import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useSimulatedAction } from "../hooks/useSimulatedAction";
import { useAppStore } from "../store/useAppStore";
import { useToastStore } from "../store/useToastStore";
import { downloadCsv } from "../utils/csv";
import { bottlesEquivalent } from "../utils/units";
import type { LiquorCategory, StockRecord } from "../types";

const categories: LiquorCategory[] = ["Whisky", "Rum", "Vodka", "Gin", "Beer", "Wine", "Brandy", "Other"];

const emptyForm: Omit<StockRecord, "id"> = {
  liquorName: "",
  brand: "",
  category: "Whisky",
  quantity: 0,
  unit: "Bottles",
  batchNo: "",
  manufactureDate: "",
  expiryDate: "",
};

export function StockPage() {
  const role = useAppStore((s) => s.role);
  const centralStock = useAppStore((s) => s.centralStock);
  const lowTh = useAppStore((s) => s.lowStockThresholdBottles);
  const addStock = useAppStore((s) => s.addStock);
  const updateStock = useAppStore((s) => s.updateStock);
  const deleteStock = useAppStore((s) => s.deleteStock);
  const push = useToastStore((s) => s.push);
  const { loading, run } = useSimulatedAction();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return centralStock.filter((s) => {
      const matchQ =
        !q ||
        [s.liquorName, s.brand, s.batchNo, s.category].some((f) => f.toLowerCase().includes(q.toLowerCase()));
      const matchC = !cat || s.category === cat;
      return matchQ && matchC;
    });
  }, [centralStock, q, cat]);

  const totalSku = centralStock.length;
  const lowAlerts = centralStock.filter((s) => bottlesEquivalent(s.quantity, s.unit) < lowTh).length;
  const totalBottles = centralStock.reduce((a, s) => a + bottlesEquivalent(s.quantity, s.unit), 0);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: StockRecord) {
    setEditing(row);
    setForm({
      liquorName: row.liquorName,
      brand: row.brand,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      batchNo: row.batchNo,
      manufactureDate: row.manufactureDate,
      expiryDate: row.expiryDate,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.liquorName.trim() || !form.brand.trim() || !form.batchNo.trim()) {
      push("error", "Validation", "Liquor name, brand, and batch are required.");
      return;
    }
    await run(async () => {
      if (editing) {
        updateStock(editing.id, form);
        push("success", "Stock updated");
      } else {
        addStock(form);
        push("success", "Stock added");
      }
      setModalOpen(false);
    });
  }

  async function remove(row: StockRecord) {
    if (!window.confirm(`Delete ${row.liquorName} (${row.batchNo})?`)) return;
    await run(async () => {
      deleteStock(row.id);
      push("success", "Stock removed");
    });
  }

  function exportCsv() {
    downloadCsv(
      `cg-excise-stock-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Liquor", "Brand", "Category", "Qty", "Unit", "Batch", "Mfg", "Expiry"],
      filtered.map((s) => [
        s.liquorName,
        s.brand,
        s.category,
        s.quantity,
        s.unit,
        s.batchNo,
        s.manufactureDate,
        s.expiryDate,
      ]),
    );
    push("info", "Export started", "CSV file download triggered.");
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: "Stock management" }]} />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold text-[var(--color-cg-green-900)]">Central stock pool</h1>
          <p className="page-lead text-sm text-slate-600">
            {role === "admin"
              ? "State-level warehouse — add, edit, and monitor SKU levels."
              : "Read-only view of state central pool for coordination (district officer demo)."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {role === "admin" && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add stock
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Active SKUs</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-cg-green-900)]">{totalSku}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Bottle-equivalent</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-cg-green-900)]">{Math.round(totalBottles).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Low-stock alerts</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{lowAlerts}</p>
        </Card>
      </div>

      <Card title="Filters">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search liquor, brand, batch, category…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select className="md:w-48" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mt-6">
        <DataTable
          loading={loading}
          rows={filtered}
          rowKey={(r) => r.id}
          empty={<span>No stock matches filters.</span>}
          columns={[
            { key: "liq", header: "Liquor", render: (r) => <span className="font-medium text-slate-900">{r.liquorName}</span> },
            { key: "br", header: "Brand", render: (r) => r.brand },
            {
              key: "cat",
              header: "Category",
              render: (r) => <Badge tone="neutral">{r.category}</Badge>,
            },
            {
              key: "qty",
              header: "Quantity",
              render: (r) => (
                <span>
                  {r.quantity.toLocaleString()} {r.unit}
                </span>
              ),
            },
            {
              key: "low",
              header: "Level",
              render: (r) =>
                bottlesEquivalent(r.quantity, r.unit) < lowTh ? <Badge tone="warn">Low</Badge> : <Badge tone="success">OK</Badge>,
            },
            { key: "batch", header: "Batch", render: (r) => <span className="font-mono text-xs">{r.batchNo}</span> },
            { key: "mfg", header: "Mfg / Exp", render: (r) => `${r.manufactureDate} → ${r.expiryDate}` },
            {
              key: "act",
              header: "",
              className: "text-right",
              render: (r) =>
                role === "admin" ? (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" className="!px-2" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="!px-2 text-red-600" onClick={() => remove(r)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
          ]}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit stock" : "Add stock"}
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            Liquor name
            <Input className="mt-1" value={form.liquorName} onChange={(e) => setForm({ ...form, liquorName: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Brand
            <Input className="mt-1" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Category
            <Select className="mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as LiquorCategory })}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Batch no.
            <Input className="mt-1" value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Quantity
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.quantity || ""}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Unit
            <Select className="mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as StockRecord["unit"] })}>
              <option value="Bottles">Bottles</option>
              <option value="Cases">Cases</option>
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Manufacture date
            <Input className="mt-1" type="date" value={form.manufactureDate} onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Expiry date
            <Input className="mt-1" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </label>
        </div>
      </Modal>
    </div>
  );
}
