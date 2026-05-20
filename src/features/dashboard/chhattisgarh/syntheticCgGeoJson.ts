/** Approximate Chhattisgarh bounds (lon, lat) for placeholder district tiles. */
const LON_MIN = 80.55;
const LON_MAX = 84.55;
const LAT_MIN = 17.75;
const LAT_MAX = 24.15;

export interface CgFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { name: string };
    geometry: { type: "Polygon"; coordinates: number[][][] };
  }>;
}

function cellPolygon(
  col: number,
  row: number,
  cols: number,
  rows: number,
): number[][][] {
  const lonSpan = (LON_MAX - LON_MIN) / cols;
  const latSpan = (LAT_MAX - LAT_MIN) / rows;
  const lon0 = LON_MIN + col * lonSpan;
  const lat0 = LAT_MIN + row * latSpan;
  const lon1 = lon0 + lonSpan * 0.92;
  const lat1 = lat0 + latSpan * 0.92;
  return [
    [
      [lon0, lat0],
      [lon1, lat0],
      [lon1, lat1],
      [lon0, lat1],
      [lon0, lat0],
    ],
  ];
}

/**
 * Builds a minimal GeoJSON FeatureCollection so ECharts `map` series can render
 * when no official district boundary file is present. Each district gets a small
 * rectangle laid out on a grid (visualisation only).
 */
export function buildSyntheticCgDistrictGeoJson(districtNames: string[]): CgFeatureCollection {
  const names = [...new Set(districtNames.map((n) => n.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
  const n = names.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const rows = Math.max(1, Math.ceil(n / cols));

  const features = names.map((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      type: "Feature" as const,
      properties: { name },
      geometry: {
        type: "Polygon" as const,
        coordinates: cellPolygon(col, row, cols, rows),
      },
    };
  });

  return {
    type: "FeatureCollection",
    features,
  };
}
