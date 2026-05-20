import { Package, TrendingDown, Truck, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { Card } from "../components/ui/Card";
import { DashboardCharts } from "../features/dashboard/DashboardCharts";
import { useAppStore } from "../store/useAppStore";
import { totalCentralBottles, totalDistributedBottles, totalIssuedBottles } from "../utils/stats";
import { bottlesEquivalent } from "../utils/units";

export function DashboardPage() {
  const role = useAppStore((s) => s.role);
  const officerDistrictId = useAppStore((s) => s.officerDistrictId);
  const districtInventory = useAppStore((s) => s.districtInventory);
  const centralStock = useAppStore((s) => s.centralStock);
  const issues = useAppStore((s) => s.issues);
  const distributions = useAppStore((s) => s.distributions);
  const lowTh = useAppStore((s) => s.lowStockThresholdBottles);
  const [boot, setBoot] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setBoot(false), 500);
    return () => window.clearTimeout(t);
  }, []);

  const scoped = useMemo(() => {
    if (role === "admin" || !officerDistrictId) {
      const lowCount = centralStock.filter((s) => bottlesEquivalent(s.quantity, s.unit) < lowTh).length;
      return {
        totalB: totalCentralBottles(centralStock),
        totalHint: "State warehouse on hand",
        issuedB: totalIssuedBottles(issues, centralStock),
        issueCount: issues.length,
        issueHint: `${issues.length} issue note(s)`,
        distB: totalDistributedBottles(distributions, centralStock),
        distCount: distributions.length,
        distHint: `${distributions.length} distribution(s)`,
        lowCount,
        lowHint: `Threshold: ${lowTh} bottle-equiv.`,
      };
    }
    const inv = districtInventory[officerDistrictId] ?? {};
    let pool = 0;
    let low = 0;
    for (const [sid, qty] of Object.entries(inv)) {
      const row = centralStock.find((s) => s.id === sid);
      if (!row) continue;
      pool += bottlesEquivalent(qty, row.unit);
      if (bottlesEquivalent(qty, row.unit) < lowTh) low++;
    }
    const iss = issues.filter((i) => i.districtId === officerDistrictId);
    const dist = distributions.filter((d) => d.districtId === officerDistrictId);
    return {
      totalB: pool,
      totalHint: "Your district depot (bottle-equiv.)",
      issuedB: totalIssuedBottles(iss, centralStock),
      issueCount: iss.length,
      issueHint: `${iss.length} issue(s) to your district`,
      distB: totalDistributedBottles(dist, centralStock),
      distCount: dist.length,
      distHint: `${dist.length} shop distribution(s)`,
      lowCount: low,
      lowHint: `SKUs under ${lowTh} bottle-equiv. at depot`,
    };
  }, [role, officerDistrictId, districtInventory, centralStock, issues, distributions, lowTh]);

  const cards = [
    {
      title: role === "admin" ? "Total stock (equiv. bottles)" : "District depot stock",
      value: Math.round(scoped.totalB).toLocaleString(),
      hint: scoped.totalHint,
      icon: Warehouse,
      tone: "blue",
    },
    {
      title: role === "admin" ? "Issued to districts" : "Received from state",
      value: Math.round(scoped.issuedB).toLocaleString(),
      hint: scoped.issueHint,
      icon: Truck,
      tone: "slate",
    },
    {
      title: "Distributed to shops",
      value: Math.round(scoped.distB).toLocaleString(),
      hint: scoped.distHint,
      icon: Package,
      tone: "amber",
    },
    {
      title: role === "admin" ? "Low-stock SKUs" : "Low at depot",
      value: String(scoped.lowCount),
      hint: scoped.lowHint,
      icon: TrendingDown,
      tone: scoped.lowCount ? "red" : "slate",
    },
  ] as const;

  return (
    <div>
      <BreadcrumbNav items={[{ label: "Dashboard" }]} />

      {boot ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-cg-blue-500)] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid min-w-0 grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.title} className="relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.title}</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-cg-green-900)]">{c.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
                  </div>
                  <div
                    className={
                      c.tone === "blue"
                        ? "stat-icon-blue rounded-xl p-3"
                        : c.tone === "amber"
                          ? "stat-icon-orange rounded-xl p-3"
                          : c.tone === "red"
                            ? "rounded-xl bg-red-100 p-3 text-red-800 shadow-sm"
                            : "rounded-xl bg-slate-100 p-3 text-slate-700"
                    }
                  >
                    <c.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-sky-400/10" />
                <div className="pointer-events-none absolute -left-4 -top-6 h-20 w-20 rounded-full bg-orange-300/15" />
              </Card>
            ))}
          </div>
          <DashboardCharts />
        </>
      )}
    </div>
  );
}
