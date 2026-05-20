import { useEffect, useMemo, useState } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Input, Select } from "../components/ui/Input";
import { useSimulatedAction } from "../hooks/useSimulatedAction";
import { useAppStore } from "../store/useAppStore";
import { useToastStore } from "../store/useToastStore";
import type { IssueLine } from "../types";

export function IssuePage() {
  const role = useAppStore((s) => s.role);
  const districts = useAppStore((s) => s.districts);
  const officerDistrictId = useAppStore((s) => s.officerDistrictId);
  const centralStock = useAppStore((s) => s.centralStock);
  const issues = useAppStore((s) => s.issues);
  const issueToDistrict = useAppStore((s) => s.issueToDistrict);
  const push = useToastStore((s) => s.push);
  const { loading, run } = useSimulatedAction();

  const [districtId, setDistrictId] = useState(() => (role === "district_officer" ? officerDistrictId ?? "" : ""));
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<{ stockId: string; quantity: number }[]>([{ stockId: centralStock[0]?.id ?? "", quantity: 0 }]);

  useEffect(() => {
    if (role === "district_officer" && officerDistrictId) setDistrictId(officerDistrictId);
  }, [role, officerDistrictId]);

  const visibleDistricts = useMemo(() => {
    if (role === "admin") return districts;
    return districts.filter((d) => d.id === officerDistrictId);
  }, [districts, officerDistrictId, role]);

  const filteredIssues = useMemo(() => {
    if (role === "admin") return issues;
    return issues.filter((i) => i.districtId === officerDistrictId);
  }, [issues, officerDistrictId, role]);

  async function submit() {
    const did = role === "district_officer" ? officerDistrictId : districtId;
    if (!did) {
      push("error", "Select district");
      return;
    }
    const clean: IssueLine[] = lines.filter((l) => l.stockId && l.quantity > 0).map((l) => ({ stockId: l.stockId, quantity: l.quantity }));
    if (!clean.length) {
      push("error", "Add at least one line with quantity");
      return;
    }
    await run(async () => {
      const ok = issueToDistrict(did, clean, note);
      if (!ok) {
        push("error", "Issue failed", "Check quantities against central stock.");
        return;
      }
      push("success", "Issue recorded", "Central stock reduced; district balance updated.");
      setNote("");
      setLines([{ stockId: centralStock[0]?.id ?? "", quantity: 0 }]);
    });
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: "State → District issue" }]} />
      <h1 className="page-title mb-2 text-2xl font-bold text-[var(--color-cg-green-900)]">Issue to district</h1>
      <p className="page-lead mb-6 text-sm text-slate-600">
        Create a state warehouse release. Quantities are deducted from central stock and credited to the selected district depot.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="New issue">
          {role === "district_officer" && (
            <p className="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
              District officer profile: issues are limited to your assigned district.
            </p>
          )}
          <label className="mb-3 block text-xs font-semibold text-slate-600">
            District
            <Select
              className="mt-1"
              value={role === "district_officer" ? officerDistrictId ?? "" : districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              disabled={role === "district_officer"}
            >
              <option value="">Select…</option>
              {visibleDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </label>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Lines</p>
            {lines.map((ln, idx) => (
              <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Select
                  className="w-full min-w-0 sm:min-w-[200px] sm:flex-1"
                  value={ln.stockId}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = { ...next[idx], stockId: e.target.value };
                    setLines(next);
                  }}
                >
                  <option value="">SKU…</option>
                  {centralStock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.liquorName} — {s.quantity} {s.unit} avail.
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={0}
                  className="w-full sm:w-28"
                  placeholder="Qty"
                  value={ln.quantity || ""}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = { ...next[idx], quantity: Number(e.target.value) };
                    setLines(next);
                  }}
                />
                <Button
                  variant="ghost"
                  onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                  disabled={lines.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() => setLines([...lines, { stockId: centralStock[0]?.id ?? "", quantity: 0 }])}
            >
              Add line
            </Button>
          </div>

          <label className="mt-4 block text-xs font-semibold text-slate-600">
            Reference note
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Vehicle / challan ref (optional)" />
          </label>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Processing…" : "Post issue"}
            </Button>
          </div>
        </Card>

        <Card title="Issue history">
          <DataTable
            rows={filteredIssues}
            rowKey={(r) => r.id}
            empty={<span>No issues yet.</span>}
            columns={[
              { key: "dt", header: "When", render: (r) => new Date(r.createdAt).toLocaleString() },
              { key: "dist", header: "District", render: (r) => r.districtName },
              { key: "lines", header: "Lines", render: (r) => r.lines.length },
              {
                key: "qty",
                header: "Qty detail",
                render: (r) => (
                  <span className="text-xs">
                    {r.lines.map((l) => {
                      const s = centralStock.find((x) => x.id === l.stockId);
                      return `${s?.liquorName ?? l.stockId}: ${l.quantity} ${s?.unit ?? ""}`;
                    }).join(" · ")}
                  </span>
                ),
              },
              { key: "note", header: "Note", render: (r) => r.referenceNote ?? "—" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
