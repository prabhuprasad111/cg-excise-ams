import type { DistrictRecord } from "../types";

const villagePrefixes = [
  "Shiv",
  "Ram",
  "Ganesh",
  "Laxmi",
  "Maa",
  "New",
  "Central",
  "Green",
  "Surya",
  "Champa",
];

const villageSuffixes = [
  "Nagar",
  "Pur",
  "Kalan",
  "Khurd",
  "Basti",
  "Colony",
  "Ward",
  "Para",
  "Bazar",
  "Gram",
];

const shopPrefixes = [
  "Sterling Wine Store",
  "Black & Bold Liquor Hub",
  "CG Spirit Corner",
  "Royal Reserve Outlet",
  "Narmada Beverages",
  "Dakshin Drinks",
  "Sarathi FL-2",
  "Heritage Spirits",
  "Janata Cold Store",
  "Excise Licensed Shop",
];

export function generateVillagesForBlock(
  districtId: string,
  blockId: string,
  blockIndex: number,
  count = 4,
): { id: string; name: string; blockId: string; districtId: string }[] {
  const villages = [];
  for (let i = 0; i < count; i++) {
    const p = villagePrefixes[(blockIndex + i) % villagePrefixes.length];
    const s = villageSuffixes[(i * 3 + blockIndex) % villageSuffixes.length];
    villages.push({
      id: `vil_${districtId}_${blockId}_${i}`,
      name: `${p} ${s} ${i + 1}`,
      blockId,
      districtId,
    });
  }
  return villages;
}

export function shopsForVillage(
  villageId: string,
  blockId: string,
  districtId: string,
  villageIndex: number,
): { id: string; name: string; licenseNo: string; villageId: string; blockId: string; districtId: string }[] {
  const base = shopPrefixes[villageIndex % shopPrefixes.length];
  return [
    {
      id: `shop_${villageId}_a`,
      name: `${base}`,
      licenseNo: `CG-FL2-${districtId.slice(-4).toUpperCase()}-${(1000 + villageIndex).toString()}`,
      villageId,
      blockId,
      districtId,
    },
    {
      id: `shop_${villageId}_b`,
      name: `${base} — Annex`,
      licenseNo: `CG-FL2-${districtId.slice(-4).toUpperCase()}-${(2000 + villageIndex).toString()}`,
      villageId,
      blockId,
      districtId,
    },
  ];
}

export function buildVillagesAndShops(districts: DistrictRecord[]): {
  villages: import("../types").VillageRecord[];
  shops: import("../types").ShopRecord[];
} {
  const villages: import("../types").VillageRecord[] = [];
  const shops: import("../types").ShopRecord[] = [];
  let bi = 0;
  for (const d of districts) {
    for (const b of d.blocks) {
      const vs = generateVillagesForBlock(d.id, b.id, bi, 4);
      villages.push(...vs);
      vs.forEach((v, vi) => {
        shops.push(...shopsForVillage(v.id, b.id, d.id, bi + vi));
      });
      bi++;
    }
  }
  return { villages, shops };
}
