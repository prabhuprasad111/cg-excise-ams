import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultDistricts, initialCentralStock } from "../data/seed";
import { buildVillagesAndShops } from "../utils/generateLocations";
import { newId } from "../utils/id";
import { LOW_STOCK_DEFAULT } from "../utils/units";
import type {
  AuditLogEntry,
  DistrictRecord,
  DistributionLine,
  DistributionRecord,
  IssueLine,
  ShopRecord,
  StateIssue,
  StockRecord,
  UserRole,
  VillageRecord,
} from "../types";

function rebuildGeo(districts: DistrictRecord[]): {
  villages: VillageRecord[];
  shops: ShopRecord[];
} {
  return buildVillagesAndShops(districts);
}

interface AppState {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  role: UserRole;
  officerDistrictId: string | null;
  lowStockThresholdBottles: number;
  setLowStockThreshold: (n: number) => void;
  centralStock: StockRecord[];
  districtInventory: Record<string, Record<string, number>>;
  shopInventory: Record<string, Record<string, number>>;
  issues: StateIssue[];
  distributions: DistributionRecord[];
  auditLogs: AuditLogEntry[];
  districts: DistrictRecord[];
  villages: VillageRecord[];
  shops: ShopRecord[];
  hierarchyFromExcel: boolean;
  setDarkMode: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setRole: (r: UserRole) => void;
  setOfficerDistrict: (id: string | null) => void;
  importDistrictsFromExcel: (districts: DistrictRecord[]) => void;
  resetHierarchyToDefault: () => void;
  addStock: (row: Omit<StockRecord, "id">) => void;
  updateStock: (id: string, patch: Partial<StockRecord>) => void;
  deleteStock: (id: string) => void;
  issueToDistrict: (districtId: string, lines: IssueLine[], note?: string) => boolean;
  distributeToShop: (
    shopId: string,
    lines: DistributionLine[],
  ) => { ok: boolean; message?: string };
  appendAudit: (entry: Omit<AuditLogEntry, "id" | "at">) => void;
  /** District officer's district for limited view */
  getEffectiveDistrictFilter: () => string | null;
}

function logAudit(
  _get: () => AppState,
  set: (fn: (s: AppState) => Partial<AppState> | AppState) => void,
  action: AuditLogEntry["action"],
  summary: string,
  meta?: AuditLogEntry["meta"],
) {
  const entry: AuditLogEntry = {
    id: newId("aud"),
    at: new Date().toISOString(),
    action,
    summary,
    meta,
  };
  set((s) => ({ auditLogs: [entry, ...s.auditLogs].slice(0, 500) }));
}

const { villages: seedVillages, shops: seedShops } = rebuildGeo(defaultDistricts);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      sidebarCollapsed: false,
      role: "admin",
      officerDistrictId: "dist_raipur",
      lowStockThresholdBottles: LOW_STOCK_DEFAULT,
      centralStock: initialCentralStock,
      districtInventory: {},
      shopInventory: {},
      issues: [],
      distributions: [],
      auditLogs: [],
      districts: defaultDistricts,
      villages: seedVillages,
      shops: seedShops,
      hierarchyFromExcel: false,

      setDarkMode: (_v) => {
        set({ darkMode: false });
        document.documentElement.classList.remove("dark");
      },

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setRole: (r) => {
        set({ role: r });
        logAudit(get, set, "role_change", `Role switched to ${r}`);
      },

      setOfficerDistrict: (id) => set({ officerDistrictId: id }),

      setLowStockThreshold: (n) => set({ lowStockThresholdBottles: Math.max(0, n) }),

      getEffectiveDistrictFilter: () => {
        const { role, officerDistrictId } = get();
        if (role === "admin") return null;
        return officerDistrictId;
      },

      importDistrictsFromExcel: (districts) => {
        if (!districts.length) return;
        const { villages, shops } = rebuildGeo(districts);
        set({
          districts,
          villages,
          shops,
          hierarchyFromExcel: true,
          districtInventory: {},
          shopInventory: {},
        });
        logAudit(get, set, "excel_import", `Imported ${districts.length} districts from workbook`, {
          districts: districts.length,
        });
      },

      resetHierarchyToDefault: () => {
        const { villages, shops } = rebuildGeo(defaultDistricts);
        set({
          districts: defaultDistricts,
          villages,
          shops,
          hierarchyFromExcel: false,
        });
        logAudit(get, set, "excel_import", "Reverted to built-in Chhattisgarh mock hierarchy");
      },

      addStock: (row) => {
        const id = newId("stk");
        set((s) => ({
          centralStock: [...s.centralStock, { ...row, id }],
        }));
        logAudit(get, set, "stock_add", `Added stock: ${row.liquorName} (${row.brand})`, {
          id,
        });
      },

      updateStock: (id, patch) => {
        set((s) => ({
          centralStock: s.centralStock.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
        logAudit(get, set, "stock_update", `Updated stock id ${id}`);
      },

      deleteStock: (id) => {
        const row = get().centralStock.find((x) => x.id === id);
        set((s) => ({
          centralStock: s.centralStock.filter((x) => x.id !== id),
        }));
        logAudit(get, set, "stock_delete", `Removed stock: ${row?.liquorName ?? id}`);
      },

      issueToDistrict: (districtId, lines, note) => {
        const d = get().districts.find((x) => x.id === districtId);
        if (!d) return false;
        const stock = get().centralStock;
        for (const ln of lines) {
          const row = stock.find((x) => x.id === ln.stockId);
          if (!row || ln.quantity <= 0) return false;
          if (row.quantity < ln.quantity) return false;
        }
        set((s) => {
          const nextCentral = s.centralStock.map((row) => {
            const ln = lines.find((l) => l.stockId === row.id);
            if (!ln) return row;
            return { ...row, quantity: row.quantity - ln.quantity };
          });
          const inv = { ...s.districtInventory };
          const di = { ...(inv[districtId] ?? {}) };
          for (const ln of lines) {
            di[ln.stockId] = (di[ln.stockId] ?? 0) + ln.quantity;
          }
          inv[districtId] = di;
          const issue: StateIssue = {
            id: newId("iss"),
            createdAt: new Date().toISOString(),
            districtId,
            districtName: d.name,
            lines,
            referenceNote: note,
          };
          return {
            centralStock: nextCentral,
            districtInventory: inv,
            issues: [issue, ...s.issues],
          };
        });
        logAudit(get, set, "state_issue", `Issued to ${d.name}: ${lines.length} line(s)`, {
          districtId,
        });
        return true;
      },

      distributeToShop: (shopId, lines) => {
        const shop = get().shops.find((x) => x.id === shopId);
        if (!shop) return { ok: false, message: "Shop not found" };
        const inv = get().districtInventory[shop.districtId] ?? {};
        for (const ln of lines) {
          const have = inv[ln.stockId] ?? 0;
          if (!ln.quantity || ln.quantity <= 0) return { ok: false, message: "Invalid quantity" };
          if (have < ln.quantity) return { ok: false, message: "Insufficient district stock" };
        }
        const d = get().districts.find((x) => x.id === shop.districtId);
        const b = d?.blocks.find((x) => x.id === shop.blockId);
        const v = get().villages.find((x) => x.id === shop.villageId);
        set((s) => {
          const dInv = { ...s.districtInventory };
          const districtMap = { ...(dInv[shop.districtId] ?? {}) };
          for (const ln of lines) {
            districtMap[ln.stockId] = (districtMap[ln.stockId] ?? 0) - ln.quantity;
          }
          dInv[shop.districtId] = districtMap;
          const sInv = { ...s.shopInventory };
          const sm = { ...(sInv[shopId] ?? {}) };
          for (const ln of lines) {
            sm[ln.stockId] = (sm[ln.stockId] ?? 0) + ln.quantity;
          }
          sInv[shopId] = sm;
          const rec: DistributionRecord = {
            id: newId("dist"),
            createdAt: new Date().toISOString(),
            districtId: shop.districtId,
            districtName: d?.name ?? "",
            blockId: shop.blockId,
            blockName: b?.name ?? "",
            villageId: shop.villageId,
            villageName: v?.name ?? "",
            shopId,
            shopName: shop.name,
            lines,
          };
          return {
            districtInventory: dInv,
            shopInventory: sInv,
            distributions: [rec, ...s.distributions],
          };
        });
        logAudit(get, set, "distribution", `Distributed to ${shop.name}`, { shopId });
        return { ok: true };
      },

      appendAudit: (e) => {
        logAudit(get, set, e.action, e.summary, e.meta);
      },
    }),
    {
      name: "cg-excise-ams-v1",
      partialize: (s) => ({
        darkMode: s.darkMode,
        sidebarCollapsed: s.sidebarCollapsed,
        role: s.role,
        officerDistrictId: s.officerDistrictId,
        centralStock: s.centralStock,
        districtInventory: s.districtInventory,
        shopInventory: s.shopInventory,
        issues: s.issues,
        distributions: s.distributions,
        auditLogs: s.auditLogs,
        districts: s.districts,
        villages: s.villages,
        shops: s.shops,
        hierarchyFromExcel: s.hierarchyFromExcel,
        lowStockThresholdBottles: s.lowStockThresholdBottles,
      }),
    },
  ),
);

export { LOW_STOCK_DEFAULT };
