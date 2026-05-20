import { bottlesEquivalent } from "./units";
import type { DistributionRecord, StateIssue, StockRecord } from "../types";

function lineQty(lines: { quantity: number }[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

/** Daily issue & distribution counts for the spline area chart (last N days). */
export function movementTrendByDay(
  issues: StateIssue[],
  distributions: DistributionRecord[],
  dayCount = 14,
): { labels: string[]; issued: number[]; distributed: number[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const labels: string[] = [];
  const issued: number[] = [];
  const distributed: number[] = [];

  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    labels.push(key);

    let iss = 0;
    for (const row of issues) {
      const t = new Date(row.createdAt).getTime();
      if (t >= d.getTime() && t < next.getTime()) iss += lineQty(row.lines);
    }
    let dist = 0;
    for (const row of distributions) {
      const t = new Date(row.createdAt).getTime();
      if (t >= d.getTime() && t < next.getTime()) dist += lineQty(row.lines);
    }
    issued.push(iss);
    distributed.push(dist);
  }

  return { labels, issued, distributed };
}

export function totalCentralBottles(stock: StockRecord[]): number {
  return stock.reduce((acc, s) => acc + bottlesEquivalent(s.quantity, s.unit), 0);
}

export function totalIssuedBottles(issues: StateIssue[], stock: StockRecord[]): number {
  let sum = 0;
  for (const iss of issues) {
    for (const ln of iss.lines) {
      const row = stock.find((s) => s.id === ln.stockId);
      if (row) sum += bottlesEquivalent(ln.quantity, row.unit);
    }
  }
  return sum;
}

export function totalDistributedBottles(dists: DistributionRecord[], stock: StockRecord[]): number {
  let sum = 0;
  for (const d of dists) {
    for (const ln of d.lines) {
      const row = stock.find((s) => s.id === ln.stockId);
      if (row) sum += bottlesEquivalent(ln.quantity, row.unit);
    }
  }
  return sum;
}

export function stockByCategory(stock: StockRecord[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const s of stock) {
    const v = bottlesEquivalent(s.quantity, s.unit);
    map.set(s.category, (map.get(s.category) ?? 0) + v);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function districtIssueTotals(issues: StateIssue[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const i of issues) {
    let lineQty = 0;
    for (const ln of i.lines) lineQty += ln.quantity;
    map.set(i.districtName, (map.get(i.districtName) ?? 0) + lineQty);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}
