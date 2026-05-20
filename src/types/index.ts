export type LiquorCategory =
  | "Whisky"
  | "Rum"
  | "Vodka"
  | "Gin"
  | "Beer"
  | "Wine"
  | "Brandy"
  | "Other";

export type QuantityUnit = "Bottles" | "Cases";

export interface StockRecord {
  id: string;
  liquorName: string;
  brand: string;
  category: LiquorCategory;
  quantity: number;
  unit: QuantityUnit;
  batchNo: string;
  manufactureDate: string;
  expiryDate: string;
}

export interface BlockRecord {
  id: string;
  name: string;
}

export interface DistrictRecord {
  id: string;
  name: string;
  /** LGD / workbook district code when imported from Excel */
  code?: number;
  blocks: BlockRecord[];
}

export interface VillageRecord {
  id: string;
  name: string;
  blockId: string;
  districtId: string;
}

export interface ShopRecord {
  id: string;
  name: string;
  licenseNo: string;
  villageId: string;
  blockId: string;
  districtId: string;
}

export type UserRole = "admin" | "district_officer";

export interface IssueLine {
  stockId: string;
  quantity: number;
}

export interface StateIssue {
  id: string;
  createdAt: string;
  districtId: string;
  districtName: string;
  lines: IssueLine[];
  referenceNote?: string;
}

export interface DistributionLine {
  stockId: string;
  quantity: number;
}

export interface DistributionRecord {
  id: string;
  createdAt: string;
  districtId: string;
  districtName: string;
  blockId: string;
  blockName: string;
  villageId: string;
  villageName: string;
  shopId: string;
  shopName: string;
  lines: DistributionLine[];
}

export type AuditAction =
  | "stock_add"
  | "stock_update"
  | "stock_delete"
  | "state_issue"
  | "distribution"
  | "excel_import"
  | "role_change";

export interface AuditLogEntry {
  id: string;
  at: string;
  action: AuditAction;
  summary: string;
  meta?: Record<string, string | number | undefined>;
}

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}
