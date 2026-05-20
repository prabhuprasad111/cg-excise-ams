import { useMemo, useState } from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Input } from "../components/ui/Input";
import { useAppStore } from "../store/useAppStore";

export function AuditPage() {
  const auditLogs = useAppStore((s) => s.auditLogs);
  const role = useAppStore((s) => s.role);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q) return auditLogs;
    const qq = q.toLowerCase();
    return auditLogs.filter((a) => a.summary.toLowerCase().includes(qq) || a.action.toLowerCase().includes(qq));
  }, [auditLogs, q]);

  const tone = (a: string): "neutral" | "success" | "warn" | "danger" => {
    if (a.includes("delete")) return "danger";
    if (a.includes("issue") || a.includes("distribution") || a.includes("add")) return "success";
    if (a.includes("excel") || a.includes("role")) return "warn";
    return "neutral";
  };

  return (
    <div>
      <BreadcrumbNav items={[{ label: "Audit trail" }]} />
      <h1 className="page-title mb-2 text-2xl font-bold text-[var(--color-cg-green-900)]">Movement audit</h1>
      <p className="page-lead mb-6 text-sm text-slate-600">
        {role === "admin"
          ? "Immutable-style log of stock mutations, issues, distributions, and configuration events (client-side demo)."
          : "Events visible for your district-scoped session (demo)."}
      </p>
      <Card title="Search">
        <Input placeholder="Filter by action or summary…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>
      <Card className="mt-6">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          empty={<span>No audit entries.</span>}
          columns={[
            { key: "at", header: "Timestamp", render: (r) => new Date(r.at).toLocaleString() },
            { key: "act", header: "Action", render: (r) => <Badge tone={tone(r.action)}>{r.action}</Badge> },
            { key: "sum", header: "Summary", render: (r) => r.summary },
          ]}
        />
      </Card>
    </div>
  );
}
