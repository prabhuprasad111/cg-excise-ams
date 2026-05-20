import { useEffect, useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import Chart from "react-apexcharts";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { StateIssue } from "../../../types";
import { ChartShell } from "../../../components/ui/ChartShell";
import { useChartHeight } from "../../../hooks/useChartHeight";
import { echartsTheme } from "../../../utils/chartTheme";
import { parseDistrictBlockWorkbook } from "../../../utils/excel";
import { districtIssueTotals } from "../../../utils/stats";
import { titleDistrictLabel, toGeoDistrictName } from "./districtGeoAliases";
import { buildSyntheticCgDistrictGeoJson } from "./syntheticCgGeoJson";

const MAP_NAME = "cgDistricts";
const GEO_JSON_URL = "/data/cg-districts.geojson";
const EXCEL_URL = "/data/chhattisgarh-district-block-list.xlsx";

function normKey(s: string): string {
  return s.trim().toLowerCase();
}

/** Dummy “issue / index” when a district has no recorded issues (stable per name). */
function hashDummy(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return 12 + (h % 188);
}

function normalizeGeoForEcharts(gj: {
  type?: string;
  features?: Array<{ type?: string; properties?: Record<string, unknown>; geometry?: unknown }>;
}): Parameters<typeof echarts.registerMap>[1] {
  if (!gj?.features) return gj as Parameters<typeof echarts.registerMap>[1];
  return {
    ...gj,
    type: "FeatureCollection",
    features: gj.features.map((f) => {
      const props = (f.properties ?? {}) as Record<string, unknown>;
      const name =
        (typeof props.name === "string" && props.name) ||
        (typeof props.Dist_Name === "string" && props.Dist_Name) ||
        (typeof props.dist_name === "string" && props.dist_name) ||
        "Unknown";
      return {
        ...f,
        properties: { ...props, name },
      };
    }),
  } as Parameters<typeof echarts.registerMap>[1];
}

export type DistrictMapRow = {
  district: string;
  mapName: string;
  label: string;
  code?: number;
  blocks: number;
  value: number;
};

function rowsFromIssuesOnly(issues: StateIssue[]): DistrictMapRow[] {
  const totals = districtIssueTotals(issues);
  return totals.map((t) => ({
    district: t.name,
    mapName: toGeoDistrictName(t.name),
    label: titleDistrictLabel(t.name),
    blocks: 0,
    value: t.value,
  }));
}

export function ChhattisgarhMapSwiper({ issues, mapHeight }: { issues: StateIssue[]; mapHeight?: number }) {
  const apexH = useChartHeight(280, 340, 400);
  const mapH = mapHeight ?? apexH;
  const [rows, setRows] = useState<DistrictMapRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [geoTick, setGeoTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(EXCEL_URL);
        if (!res.ok) {
          if (!alive) return;
          setRows(rowsFromIssuesOnly(issues));
          setLoadErr(
            `Workbook not found at ${EXCEL_URL} (${res.status}). Showing districts from issues only; add the Excel file under public/data/.`,
          );
          return;
        }
        const buf = await res.arrayBuffer();
        const districts = parseDistrictBlockWorkbook(buf);
        const totals = districtIssueTotals(issues);
        const byName = new Map(totals.map((t) => [normKey(t.name), t.value]));

        const merged: DistrictMapRow[] = districts.map((d) => {
          const v = byName.get(normKey(d.name)) ?? hashDummy(d.name);
          return {
            district: d.name,
            mapName: toGeoDistrictName(d.name),
            label: titleDistrictLabel(d.name),
            code: d.code,
            blocks: d.blocks.length,
            value: v,
          };
        });
        if (!alive) return;
        setRows(merged.sort((a, b) => a.district.localeCompare(b.district)));
        setLoadErr(null);
      } catch (e) {
        if (!alive) return;
        setRows(rowsFromIssuesOnly(issues));
        setLoadErr(e instanceof Error ? e.message : "Failed to load workbook");
      }
    })();
    return () => {
      alive = false;
    };
  }, [issues]);

  useEffect(() => {
    if (rows.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(GEO_JSON_URL);
        if (res.ok) {
          const raw = await res.json();
          if (cancelled) return;
          echarts.registerMap(MAP_NAME, normalizeGeoForEcharts(raw));
          setGeoTick((n) => n + 1);
          return;
        }
      } catch {
        /* fall through */
      }
      if (cancelled) return;
      const syn = buildSyntheticCgDistrictGeoJson(rows.map((r) => r.mapName));
      echarts.registerMap(MAP_NAME, syn as Parameters<typeof echarts.registerMap>[1]);
      setGeoTick((n) => n + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [rows]);

  const mapOption = useMemo(() => {
    if (rows.length === 0) {
      return {
        title: { text: "Loading…", left: "center", top: "middle", textStyle: { color: "#64748b" } },
      };
    }
    const vmax = Math.max(...rows.map((r) => r.value), 1);
    const theme = echartsTheme(false);
    return {
      ...theme,
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: "#0f172a", fontSize: 13 },
        formatter: (p: { name?: string; value?: number; data?: { label?: string; code?: number } }) => {
          const label = p.data?.label ?? p.name ?? "";
          const code = p.data?.code ?? p.value ?? 0;
          return `<div style="font-weight:600;margin-bottom:4px">${label}</div>Code: <b>${code}</b>`;
        },
      },
      visualMap: {
        show: true,
        min: 0,
        max: vmax,
        left: 8,
        bottom: 16,
        text: ["Low", "High"],
        calculable: false,
        inRange: {
          color: [
            "#f0fdf4",
            "#dcfce7",
            "#bbf7d0",
            "#86efac",
            "#4ade80",
            "#22c55e",
            "#16a34a",
            "#15803d",
            "#166534",
          ],
        },
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
      },
      series: [
        {
          name: "Districts",
          type: "map",
          map: MAP_NAME,
          roam: true,
          selectedMode: false,
          label: {
            show: true,
            color: "#ffffff",
            fontSize: 9,
            fontWeight: 500,
            textBorderColor: "rgba(15,23,42,0.55)",
            textBorderWidth: 1,
          },
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 1,
          },
          emphasis: {
            focus: "self",
            label: { show: true, color: "#ffffff", fontSize: 10, fontWeight: 600 },
            itemStyle: {
              areaColor: "#4ade80",
              borderColor: "#14532d",
              borderWidth: 2,
              shadowBlur: 12,
              shadowColor: "rgba(22,163,74,0.45)",
            },
          },
          blur: {
            itemStyle: { areaColor: "rgba(240,253,244,0.35)" },
          },
          data: rows.map((r) => ({
            name: r.mapName,
            value: r.value,
            label: r.label,
            code: r.code,
          })),
        },
      ],
    };
  }, [rows, geoTick]);

  const apexSeries = useMemo(
    () => [
      { name: "Issues / index", data: rows.map((r) => r.value) },
      { name: "Blocks (count)", data: rows.map((r) => r.blocks) },
    ],
    [rows],
  );

  const apexOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        foreColor: "#64748b",
        fontFamily: "inherit",
      },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "70%" } },
      dataLabels: { enabled: false },
      xaxis: { categories: rows.map((r) => r.label) },
      legend: { position: "bottom" },
      tooltip: { shared: true, intersect: false },
      colors: ["#0f4d36", "#c9a227"],
    }),
    [rows],
  );

  return (
    <div className="panel-card min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
      <p className="mb-1 text-sm font-semibold text-slate-800">Chhattisgarh overview</p>
      <p className="mb-2 hidden text-xs text-slate-500 sm:block">
        Swipe for the district map and bar chart. Data from{" "}
        <code className="break-all rounded bg-slate-100 px-1 text-[10px] sm:text-xs">public/data/chhattisgarh-district-block-list.xlsx</code>
      </p>
      <p className="mb-2 text-xs text-slate-500 sm:hidden">Swipe left/right for map and district bars.</p>
      {loadErr ? (
        <p className="mb-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
          {loadErr}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <div className="flex h-[min(280px,50vh)] items-center justify-center text-sm text-slate-500">Loading district data…</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={12}
          navigation
          pagination={{ clickable: true }}
          className="chhattisgarh-swiper !overflow-hidden pb-10"
        >
          <SwiperSlide className="!h-auto">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">District map</p>
            <ChartShell size="lg" className="!h-[min(320px,55vh)] sm:!h-[380px]">
              <ReactECharts
                key={geoTick}
                option={mapOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </ChartShell>
          </SwiperSlide>
          <SwiperSlide className="!h-auto">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">District metrics</p>
            <ChartShell size="lg" className="!h-[min(320px,55vh)] sm:!h-[380px]">
              <Chart type="bar" series={apexSeries} options={apexOptions} height={mapH} width="100%" />
            </ChartShell>
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  );
}
