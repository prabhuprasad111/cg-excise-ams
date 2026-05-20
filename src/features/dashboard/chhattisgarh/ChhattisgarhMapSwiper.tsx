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
import {
  CG_DISTRICTS_GEOJSON_URL,
  DISTRICTS_JSON_URL,
  districtMapRowsFromJson,
  rowsFromIssuesOnly,
  type ChhattisgarhDistrictsFile,
  type DistrictMapRow,
} from "../../../utils/districtData";
import { buildSyntheticCgDistrictGeoJson } from "./syntheticCgGeoJson";

const MAP_NAME = "cgDistricts";

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

export type { DistrictMapRow } from "../../../utils/districtData";

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
        const res = await fetch(DISTRICTS_JSON_URL);
        if (!res.ok) {
          if (!alive) return;
          setRows(rowsFromIssuesOnly(issues));
          setLoadErr(
            `District JSON not found at ${DISTRICTS_JSON_URL} (${res.status}). Run npm run data:build-districts to generate it.`,
          );
          return;
        }
        const file = (await res.json()) as ChhattisgarhDistrictsFile;
        if (!file?.districts?.length) {
          if (!alive) return;
          setRows(rowsFromIssuesOnly(issues));
          setLoadErr("District JSON is empty or invalid.");
          return;
        }
        if (!alive) return;
        setRows(districtMapRowsFromJson(file, issues));
        setLoadErr(null);
      } catch (e) {
        if (!alive) return;
        setRows(rowsFromIssuesOnly(issues));
        setLoadErr(e instanceof Error ? e.message : "Failed to load district JSON");
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
        const res = await fetch(CG_DISTRICTS_GEOJSON_URL);
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
            "#eff6ff",
            "#dbeafe",
            "#bfdbfe",
            "#93c5fd",
            "#fdba74",
            "#fb923c",
            "#f97316",
            "#ea580c",
            "#c2410c",
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
              areaColor: "#fb923c",
              borderColor: "#1e4976",
              borderWidth: 2,
              shadowBlur: 14,
              shadowColor: "rgba(251,146,60,0.5)",
            },
          },
          blur: {
            itemStyle: { areaColor: "rgba(239,246,255,0.35)" },
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
      { name: "Issue volume", data: rows.map((r) => r.value) },
      { name: "Block activity", data: rows.map((r) => r.blockActivity) },
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
      colors: ["#3b82f6", "#fb923c"],
    }),
    [rows],
  );

  return (
    <div className="panel-card relative min-w-0 p-3 sm:p-4">
      <p className="mb-1 text-sm font-semibold text-slate-800">Chhattisgarh overview</p>
      <p className="mb-2 hidden text-xs text-slate-500 sm:block">
        Swipe for the district map and bar chart. District list from{" "}
        <code className="break-all rounded bg-slate-100 px-1 text-[10px] sm:text-xs">public/data/chhattisgarh-districts.json</code>
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
