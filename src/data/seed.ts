import type { DistrictRecord, StockRecord } from "../types";

/** Fallback hierarchy when no Excel is loaded — aligned with Chhattisgarh-style naming */
export const defaultDistricts: DistrictRecord[] = [
  {
    id: "dist_raipur",
    name: "Raipur",
    blocks: [
      { id: "blk_raipur_sadar", name: "Raipur Sadar" },
      { id: "blk_raipur_abhanpur", name: "Abhanpur" },
      { id: "blk_raipur_arang", name: "Arang" },
    ],
  },
  {
    id: "dist_durg",
    name: "Durg",
    blocks: [
      { id: "blk_durg_patton", name: "Patton" },
      { id: "blk_durg_dondiluhara", name: "Dondi Luhara" },
    ],
  },
  {
    id: "dist_bilaspur",
    name: "Bilaspur",
    blocks: [
      { id: "blk_bilaspur_masturi", name: "Masturi" },
      { id: "blk_bilaspur_bilha", name: "Bilha" },
    ],
  },
  {
    id: "dist_korba",
    name: "Korba",
    blocks: [
      { id: "blk_korba_katghora", name: "Katghora" },
      { id: "blk_korba_pali", name: "Pali" },
    ],
  },
  {
    id: "dist_raigarh",
    name: "Raigarh",
    blocks: [
      { id: "blk_raigarh_tamnar", name: "Tamnar" },
      { id: "blk_raigarh_gharghoda", name: "Gharghoda" },
    ],
  },
  {
    id: "dist_janjgir",
    name: "Janjgir-Champa",
    blocks: [
      { id: "blk_jj_champa", name: "Champa" },
      { id: "blk_jj_akaltara", name: "Akaltara" },
    ],
  },
];

export const initialCentralStock: StockRecord[] = [
  {
    id: "stk_1",
    liquorName: "Single Malt Reserve",
    brand: "Hillside",
    category: "Whisky",
    quantity: 2400,
    unit: "Bottles",
    batchNo: "CG-B24-881",
    manufactureDate: "2024-06-01",
    expiryDate: "2029-12-31",
  },
  {
    id: "stk_2",
    liquorName: "Premium Strong",
    brand: "Mahanadi Brew",
    category: "Beer",
    quantity: 180,
    unit: "Cases",
    batchNo: "CG-BR-112",
    manufactureDate: "2025-01-10",
    expiryDate: "2025-10-10",
  },
  {
    id: "stk_3",
    liquorName: "Cabernet Collection",
    brand: "Indravati Cellars",
    category: "Wine",
    quantity: 320,
    unit: "Bottles",
    batchNo: "CG-WN-009",
    manufactureDate: "2024-09-15",
    expiryDate: "2026-09-15",
  },
  {
    id: "stk_4",
    liquorName: "Heritage XXX",
    brand: "Bastar Spirits",
    category: "Rum",
    quantity: 45,
    unit: "Cases",
    batchNo: "CG-RM-204",
    manufactureDate: "2024-11-01",
    expiryDate: "2027-11-01",
  },
  {
    id: "stk_5",
    liquorName: "Crystal Filter",
    brand: "Hasdeo",
    category: "Vodka",
    quantity: 890,
    unit: "Bottles",
    batchNo: "CG-VD-551",
    manufactureDate: "2025-02-20",
    expiryDate: "2028-02-20",
  },
];
