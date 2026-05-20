import type { StockRecord } from "../types";

export function bottlesEquivalent(qty: number, unit: StockRecord["unit"]): number {
  return unit === "Cases" ? qty * 12 : qty;
}

export const LOW_STOCK_DEFAULT = 120;
