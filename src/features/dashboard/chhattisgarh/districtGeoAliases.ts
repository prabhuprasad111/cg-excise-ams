/** Maps workbook district labels (often UPPERCASE) to names in cg-districts.geojson. */
const EXCEL_TO_GEO: Record<string, string> = {
  balod: "Balod",
  balodabazar: "Baloda Bazar",
  balrampur: "Balrampur",
  bastar: "Bastar",
  bemetara: "Bemetra",
  bijapur: "Bijapur",
  bilaspur: "Bilaspur",
  dantewada: "Dakshin Bastar Dantewada",
  dhamtari: "Dhamtari",
  durg: "Durg",
  gariyaband: "Gariaband",
  "janjgir-champa": "Janjgir-Champa",
  jashpur: "Jashpur",
  kabeerdham: "Kabeerdham",
  kanker: "Uttar Bastar Kanker",
  kondagaon: "Kondagaon",
  korba: "Korba",
  koriya: "Koriya",
  mahasamund: "Mahasamund",
  mungeli: "Mungeli",
  narayanpur: "Narayanpur",
  raigarh: "Raigarh",
  raipur: "Raipur",
  rajnandgaon: "Rajnandgaon",
  sukma: "Sukma",
  surajpur: "Surajpur",
  surguja: "Surguja",
};

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function toGeoDistrictName(excelOrDisplayName: string): string {
  const k = normKey(excelOrDisplayName);
  return EXCEL_TO_GEO[k] ?? excelOrDisplayName.trim();
}

export function titleDistrictLabel(name: string): string {
  return name
    .trim()
    .split(/[\s-]+/)
    .map((w) => (w ? w.charAt(0) + w.slice(1).toLowerCase() : ""))
    .join(" ");
}
