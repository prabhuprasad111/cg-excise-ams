import { defaultDistricts, initialCentralStock } from "./seed";
import { buildVillagesAndShops } from "../utils/generateLocations";
import type {
  DistributionRecord,
  StateIssue,
  StockRecord,
} from "../types";

function daysAgo(dayOffset: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

/** Pre-filled issues, distributions, and inventory so dashboard charts show movement data. */
export function buildDemoMovementData(): {
  issues: StateIssue[];
  distributions: DistributionRecord[];
  districtInventory: Record<string, Record<string, number>>;
  shopInventory: Record<string, Record<string, number>>;
  centralStock: StockRecord[];
} {
  const centralStock = initialCentralStock.map((s) => ({ ...s }));
  const districtInventory: Record<string, Record<string, number>> = {};
  const shopInventory: Record<string, Record<string, number>> = {};
  const issues: StateIssue[] = [];
  const distributions: DistributionRecord[] = [];
  const stockIds = centralStock.map((s) => s.id);

  defaultDistricts.forEach((dist, di) => {
    const issueCount = 2 + (di % 2);
    for (let j = 0; j < issueCount; j++) {
      const stockId = stockIds[(di + j) % stockIds.length];
      const row = centralStock.find((s) => s.id === stockId);
      if (!row) continue;
      const qty = 35 + ((di * 23 + j * 41) % 95);
      if (row.quantity < qty) continue;

      row.quantity -= qty;
      const inv = { ...(districtInventory[dist.id] ?? {}) };
      inv[stockId] = (inv[stockId] ?? 0) + qty;
      districtInventory[dist.id] = inv;

      issues.push({
        id: `demo_iss_${dist.id}_${j}`,
        createdAt: daysAgo((di * 2 + j) % 13, 9 + ((di + j) % 6)),
        districtId: dist.id,
        districtName: dist.name,
        lines: [{ stockId, quantity: qty }],
        referenceNote: "Demo — state issue",
      });
    }
  });

  const { villages, shops } = buildVillagesAndShops(defaultDistricts);
  shops.slice(0, 24).forEach((shop, si) => {
    const dist = defaultDistricts.find((d) => d.id === shop.districtId);
    const block = dist?.blocks.find((b) => b.id === shop.blockId);
    const village = villages.find((v) => v.id === shop.villageId);
    const inv = districtInventory[shop.districtId];
    if (!inv || !dist) return;

    const stockId = stockIds[si % stockIds.length];
    const available = inv[stockId] ?? 0;
    if (available < 12) return;

    const qty = Math.min(available, 10 + (si % 28));
    inv[stockId] = available - qty;
    const sm = { ...(shopInventory[shop.id] ?? {}) };
    sm[stockId] = (sm[stockId] ?? 0) + qty;
    shopInventory[shop.id] = sm;

    distributions.push({
      id: `demo_dist_${shop.id}`,
      createdAt: daysAgo((si + 3) % 12, 11 + (si % 5)),
      districtId: shop.districtId,
      districtName: dist.name,
      blockId: shop.blockId,
      blockName: block?.name ?? "",
      villageId: shop.villageId,
      villageName: village?.name ?? "",
      shopId: shop.id,
      shopName: shop.name,
      lines: [{ stockId, quantity: qty }],
    });
  });

  return {
    issues,
    distributions,
    districtInventory,
    shopInventory,
    centralStock,
  };
}
