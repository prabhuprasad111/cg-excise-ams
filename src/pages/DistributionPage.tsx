import { useEffect, useMemo, useState } from "react";
import { BreadcrumbNav, type Crumb } from "../components/BreadcrumbNav";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/EmptyState";
import { Input, Select } from "../components/ui/Input";
import { useSimulatedAction } from "../hooks/useSimulatedAction";
import { useAppStore } from "../store/useAppStore";
import { useToastStore } from "../store/useToastStore";
import type { DistributionLine } from "../types";

export function DistributionPage() {
  const role = useAppStore((s) => s.role);
  const officerDistrictId = useAppStore((s) => s.officerDistrictId);
  const districts = useAppStore((s) => s.districts);
  const villages = useAppStore((s) => s.villages);
  const shops = useAppStore((s) => s.shops);
  const centralStock = useAppStore((s) => s.centralStock);
  const districtInventory = useAppStore((s) => s.districtInventory);
  const shopInventory = useAppStore((s) => s.shopInventory);
  const distributions = useAppStore((s) => s.distributions);
  const distributeToShop = useAppStore((s) => s.distributeToShop);
  const push = useToastStore((s) => s.push);
  const { loading, run } = useSimulatedAction();

  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [shopId, setShopId] = useState("");
  const [lines, setLines] = useState<DistributionLine[]>([{ stockId: "", quantity: 0 }]);

  useEffect(() => {
    if (role === "district_officer" && officerDistrictId) {
      setDistrictId(officerDistrictId);
    }
  }, [role, officerDistrictId]);

  const districtList = useMemo(() => {
    if (role === "admin") return districts;
    return districts.filter((d) => d.id === officerDistrictId);
  }, [districts, officerDistrictId, role]);

  const selectedDistrict = districts.find((d) => d.id === districtId);
  const blocks = selectedDistrict?.blocks ?? [];

  const villagesInBlock = useMemo(() => {
    if (!districtId || !blockId) return [];
    return villages.filter((v) => v.districtId === districtId && v.blockId === blockId);
  }, [villages, districtId, blockId]);

  const shopsInVillage = useMemo(() => {
    if (!villageId) return [];
    return shops.filter((s) => s.villageId === villageId);
  }, [shops, villageId]);

  const selectedShop = shops.find((s) => s.id === shopId);
  const distInv = districtId ? districtInventory[districtId] ?? {} : {};

  const shopStock = useMemo(() => {
    if (!shopId) return {};
    return shopInventory[shopId] ?? {};
  }, [shopInventory, shopId]);

  const crumbs: Crumb[] = [];
  if (selectedDistrict) crumbs.push({ label: selectedDistrict.name, to: undefined });
  if (selectedDistrict && blockId) {
    const b = selectedDistrict.blocks.find((x) => x.id === blockId);
    if (b) crumbs.push({ label: b.name });
  }
  if (villageId) {
    const v = villages.find((x) => x.id === villageId);
    if (v) crumbs.push({ label: v.name });
  }
  if (shopId && selectedShop) crumbs.push({ label: selectedShop.name });

  const filteredDistributions = useMemo(() => {
    if (role === "admin") return distributions;
    return distributions.filter((d) => d.districtId === officerDistrictId);
  }, [distributions, officerDistrictId, role]);

  async function submit() {
    if (!shopId) {
      push("error", "Select a shop");
      return;
    }
    const clean = lines.filter((l) => l.stockId && l.quantity > 0);
    if (!clean.length) {
      push("error", "Add distribution lines");
      return;
    }
    await run(async () => {
      const res = distributeToShop(shopId, clean);
      if (!res.ok) {
        push("error", "Distribution blocked", res.message);
        return;
      }
      push("success", "Distribution posted", "District stock reduced; shop balance increased.");
      setLines([{ stockId: "", quantity: 0 }]);
    });
  }

  return (
    <div>
      <BreadcrumbNav items={crumbs.length ? crumbs : [{ label: "Distribution" }]} />
      <h1 className="page-title mb-2 text-2xl font-bold text-[var(--color-cg-green-900)]">Retail distribution</h1>
      <p className="page-lead mb-6 text-sm text-slate-600">
        District depot → block → village/city → licensed shop. Only SKUs available at the district pool can be pushed down.
      </p>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Card title="Location hierarchy" className="xl:col-span-1">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              District
              <Select
                className="mt-1"
                value={districtId}
                onChange={(e) => {
                  setDistrictId(e.target.value);
                  setBlockId("");
                  setVillageId("");
                  setShopId("");
                }}
                disabled={role === "district_officer"}
              >
                <option value="">Select district…</option>
                {districtList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Block
              <Select
                className="mt-1"
                value={blockId}
                onChange={(e) => {
                  setBlockId(e.target.value);
                  setVillageId("");
                  setShopId("");
                }}
                disabled={!districtId}
              >
                <option value="">Select block…</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Village / City
              <Select
                className="mt-1"
                value={villageId}
                onChange={(e) => {
                  setVillageId(e.target.value);
                  setShopId("");
                }}
                disabled={!blockId}
              >
                <option value="">Select…</option>
                {villagesInBlock.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Licensed shop
              <Select className="mt-1" value={shopId} onChange={(e) => setShopId(e.target.value)} disabled={!villageId}>
                <option value="">Select shop…</option>
                {shopsInVillage.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          {selectedShop && (
            <div className="mt-4 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-orange-50/50 p-3 text-xs shadow-sm">
              <p className="font-semibold text-[var(--color-cg-green-900)]">{selectedShop.name}</p>
              <p className="mt-1 text-slate-600">License: {selectedShop.licenseNo}</p>
            </div>
          )}
        </Card>

        <Card title="District availability & shop stock" className="xl:col-span-1">
          {!districtId ? (
            <EmptyState title="Pick a district" hint="We will show SKUs currently held at the district depot and what the shop already holds." />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">District depot (selected district)</p>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-sky-100 bg-white p-2 shadow-inner">
                  {Object.keys(distInv).length === 0 ? (
                    <p className="text-xs text-slate-500">No stock at this district yet — issue from state first.</p>
                  ) : (
                    Object.entries(distInv).map(([sid, qty]) => {
                      const row = centralStock.find((s) => s.id === sid);
                      if (!qty) return null;
                      return (
                        <div key={sid} className="flex justify-between gap-2 text-xs">
                          <span>{row?.liquorName ?? sid}</span>
                          <Badge tone="success">
                            {qty} {row?.unit}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {shopId && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Shop on-hand</p>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-amber-100 bg-amber-50/30 p-2">
                    {Object.keys(shopStock).length === 0 ? (
                      <p className="text-xs text-slate-500">No receipts yet for this shop.</p>
                    ) : (
                      Object.entries(shopStock).map(([sid, qty]) => {
                        const row = centralStock.find((s) => s.id === sid);
                        return (
                          <div key={sid} className="flex justify-between gap-2 text-xs">
                            <span>{row?.liquorName ?? sid}</span>
                            <span className="font-mono">
                              {qty} {row?.unit}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Distribution entry" className="xl:col-span-1">
          {!shopId ? (
            <EmptyState title="Select a shop" hint="Choose the full chain on the left to unlock quantity entry." />
          ) : (
            <>
              <div className="space-y-2">
                {lines.map((ln, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2">
                    <Select
                      className="min-w-[180px] flex-1"
                      value={ln.stockId}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx] = { ...next[idx], stockId: e.target.value };
                        setLines(next);
                      }}
                    >
                      <option value="">SKU from district pool…</option>
                      {Object.entries(distInv)
                        .filter(([, q]) => q > 0)
                        .map(([sid]) => {
                          const row = centralStock.find((s) => s.id === sid);
                          return (
                            <option key={sid} value={sid}>
                              {row?.liquorName} — max {distInv[sid]} {row?.unit}
                            </option>
                          );
                        })}
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      className="w-24"
                      placeholder="Qty"
                      value={ln.quantity || ""}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx] = { ...next[idx], quantity: Number(e.target.value) };
                        setLines(next);
                      }}
                    />
                    <Button variant="ghost" onClick={() => setLines(lines.filter((_, i) => i !== idx))} disabled={lines.length === 1}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => setLines([...lines, { stockId: "", quantity: 0 }])}>
                  Add line
                </Button>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => void submit()} disabled={loading}>
                  {loading ? "Saving…" : "Confirm distribution"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Recent distributions">
          <DataTable
            rows={filteredDistributions.slice(0, 50)}
            rowKey={(r) => r.id}
            empty={<span>No distributions yet.</span>}
            columns={[
              { key: "t", header: "When", render: (r) => new Date(r.createdAt).toLocaleString() },
              { key: "route", header: "Route", render: (r) => `${r.districtName} › ${r.blockName} › ${r.villageName}` },
              { key: "shop", header: "Shop", render: (r) => r.shopName },
              {
                key: "det",
                header: "Lines",
                render: (r) => (
                  <span className="text-xs">
                    {r.lines.map((l) => {
                      const s = centralStock.find((x) => x.id === l.stockId);
                      return `${s?.liquorName ?? l.stockId}: ${l.quantity}`;
                    }).join(" · ")}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
