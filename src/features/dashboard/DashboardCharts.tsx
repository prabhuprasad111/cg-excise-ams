import type { ApexOptions } from "apexcharts";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ChartShell } from "../../components/ui/ChartShell";
import { useChartHeight } from "../../hooks/useChartHeight";
import { ChhattisgarhMapSwiper } from "./chhattisgarh/ChhattisgarhMapSwiper";
import { movementTrendByDay, stockByCategory } from "../../utils/stats";
import { echartsTheme } from "../../utils/chartTheme";
import { bottlesEquivalent } from "../../utils/units";
import { useAppStore } from "../../store/useAppStore";

function scaleRadarSeries(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.round((v / max) * 100));
}

const chartOpts = { renderer: "canvas" as const };

export function DashboardCharts() {
  const chartH = useChartHeight(240, 280, 320);
  const chartHLg = useChartHeight(260, 300, 360);
  const centralStock = useAppStore((s) => s.centralStock);
  const issues = useAppStore((s) => s.issues);
  const districtInventory = useAppStore((s) => s.districtInventory);
  const shopInventory = useAppStore((s) => s.shopInventory);
  const distributions = useAppStore((s) => s.distributions);

  const pieOption = useMemo(() => {
    const data = stockByCategory(centralStock);
    const theme = echartsTheme(false);
    return {
      ...theme,
      title: {
        text: "Central stock by category",
        left: 0,
        top: 4,
        textStyle: { fontSize: 13, color: "#475569", fontWeight: 600 },
      },
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { color: theme.textStyle.color } },
      series: [
        {
          name: "Central stock by category",
          type: "pie",
          radius: ["42%", "68%"],
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { color: "#334155" },
          data: data.map((d) => ({ name: d.name, value: Math.round(d.value) })),
        },
      ],
    };
  }, [centralStock]);

  const trend = useMemo(
    () => movementTrendByDay(issues, distributions, 14),
    [issues, distributions],
  );

  const splineAreaOption = useMemo(() => {
    const theme = echartsTheme(false);
    const maxVal = Math.max(...trend.issued, ...trend.distributed, 0);
    return {
      ...theme,
      tooltip: { trigger: "axis" },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
      },
      title: {
        text: "Movement trend (last 14 days)",
        left: 0,
        textStyle: { fontSize: 13, color: "#475569", fontWeight: 600 },
      },
      grid: { left: 8, right: 8, bottom: 28, top: 52, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.labels,
        axisLabel: { color: theme.xAxis.axisLabel.color, fontSize: 10 },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: maxVal > 0 ? undefined : 8,
        axisLabel: { color: theme.yAxis.axisLabel.color },
      },
      series: [
        {
          name: "Issued to districts",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#0f4d36" },
          itemStyle: { color: "#0f4d36" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(22, 101, 74, 0.45)" },
                { offset: 1, color: "rgba(22, 101, 74, 0.05)" },
              ],
            },
          },
          data: trend.issued,
        },
        {
          name: "Distributed to shops",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#c9a227" },
          itemStyle: { color: "#c9a227" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(201, 162, 39, 0.4)" },
                { offset: 1, color: "rgba(201, 162, 39, 0.05)" },
              ],
            },
          },
          data: trend.distributed,
        },
      ],
    };
  }, [trend]);

  const radar6 = useMemo(() => movementTrendByDay(issues, distributions, 6), [issues, distributions]);

  const radarSeries = useMemo(() => {
    let cum = 0;
    const cumulative = radar6.issued.map((v) => {
      cum += v;
      return cum;
    });
    return [
      { name: "Issued to districts", data: scaleRadarSeries(radar6.issued) },
      { name: "Distributed to shops", data: scaleRadarSeries(radar6.distributed) },
      { name: "Cumulative issued", data: scaleRadarSeries(cumulative) },
    ];
  }, [radar6]);

  const radarOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "radar",
        toolbar: { show: false },
        fontFamily: "inherit",
        foreColor: "#64748b",
      },
      title: {
        text: "Radar chart — multi series",
        align: "left",
        style: { fontSize: "13px", fontWeight: 600, color: "#475569" },
      },
      colors: ["#3b82f6", "#22c55e", "#f59e0b"],
      stroke: { width: 2 },
      fill: { opacity: 0.18 },
      markers: { size: 4, hover: { size: 6 } },
      xaxis: { categories: radar6.labels },
      yaxis: {
        show: true,
        min: 0,
        max: 100,
        tickAmount: 5,
        labels: { formatter: (v) => String(Math.round(Number(v))) },
      },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: "#e2e8f0",
            connectorColors: "#e2e8f0",
            fill: { colors: ["#f8fafc", "#ffffff"] },
          },
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
      },
      tooltip: {
        y: {
          formatter: (_val, opts) => {
            const si = opts?.seriesIndex ?? 0;
            const di = opts?.dataPointIndex ?? 0;
            const raw =
              si === 0 ? radar6.issued[di] : si === 1 ? radar6.distributed[di] : radar6.issued.slice(0, di + 1).reduce((a, b) => a + b, 0);
            return `${raw} (line qty)`;
          },
        },
      },
    }),
    [radar6],
  );

  const flowOption = useMemo(() => {
    let districtHeld = 0;
    for (const inv of Object.values(districtInventory)) {
      for (const [stockId, qty] of Object.entries(inv)) {
        const row = centralStock.find((s) => s.id === stockId);
        if (row) districtHeld += bottlesEquivalent(qty, row.unit);
      }
    }
    let shopHeld = 0;
    for (const inv of Object.values(shopInventory)) {
      for (const [stockId, qty] of Object.entries(inv)) {
        const row = centralStock.find((s) => s.id === stockId);
        if (row) shopHeld += bottlesEquivalent(qty, row.unit);
      }
    }
    const stateHeld = stockByCategory(centralStock).reduce((a, b) => a + b.value, 0);
    const theme = echartsTheme(false);
    return {
      ...theme,
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      title: {
        text: "Bottle-equivalent by tier",
        left: 0,
        textStyle: { fontSize: 13, color: "#475569", fontWeight: 600 },
      },
      grid: { left: 12, right: 24, bottom: 12, top: 40, containLabel: true },
      xAxis: { type: "value", axisLabel: { color: theme.xAxis.axisLabel.color } },
      yAxis: {
        type: "category",
        data: ["State warehouse", "District depots", "Shops"],
        axisLabel: { color: theme.yAxis.axisLabel.color },
      },
      series: [
        {
          name: "Bottles (equiv.)",
          type: "bar",
          barMaxWidth: 36,
          data: [
            { value: Math.round(stateHeld), itemStyle: { color: "#0f4d36", borderRadius: [0, 6, 6, 0] } },
            { value: Math.round(districtHeld), itemStyle: { color: "#16634a", borderRadius: [0, 6, 6, 0] } },
            { value: Math.round(shopHeld), itemStyle: { color: "#c9a227", borderRadius: [0, 6, 6, 0] } },
          ],
        },
      ],
    };
  }, [centralStock, districtInventory, shopInventory]);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <div className="panel-card min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
        <ChartShell size="md">
          <ReactECharts option={pieOption} style={{ height: "100%", width: "100%" }} opts={chartOpts} />
        </ChartShell>
      </div>
      <div className="panel-card min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
        <ChartShell size="md">
          <ReactECharts
            key={`spline-${issues.length}-${distributions.length}-${chartH}`}
            option={splineAreaOption}
            style={{ height: "100%", width: "100%" }}
            opts={chartOpts}
          />
        </ChartShell>
      </div>
      <div className="panel-card min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
        <ChartShell size="sm">
          <ReactECharts option={flowOption} style={{ height: "100%", width: "100%" }} opts={chartOpts} />
        </ChartShell>
      </div>
      <div className="panel-card min-w-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
        <ChartShell size="sm">
          <Chart
            key={`radar-${issues.length}-${distributions.length}-${chartH}`}
            type="radar"
            height={chartH}
            series={radarSeries}
            options={radarOptions}
          />
        </ChartShell>
      </div>
      <div className="min-w-0 lg:col-span-2">
        <ChhattisgarhMapSwiper issues={issues} mapHeight={chartHLg} />
        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
          {distributions.length} shop-level distribution(s) recorded. District map uses the workbook list and issue totals.
        </p>
      </div>
    </div>
  );
}
