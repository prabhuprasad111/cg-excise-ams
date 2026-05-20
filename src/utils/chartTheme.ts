/** Brand chart palette — soft orange + light blue */
export const brandChartColors = {
  orange: "#fb923c",
  orangeDeep: "#f97316",
  blue: "#60a5fa",
  blueDeep: "#3b82f6",
  ink: "#1e4976",
  sky: "#7dd3fc",
  cream: "#fff7ed",
} as const;

/** Shared ECharts styling so charts stay readable in light UI. */
export function echartsTheme(dark: boolean) {
  const text = dark ? "#cbd5e1" : "#64748b";
  const title = dark ? "#e2e8f0" : "#1e4976";
  const axis = dark ? "#94a3b8" : "#64748b";
  const split = dark ? "#334155" : "#e2e8f0";
  return {
    backgroundColor: "transparent",
    textStyle: { color: text },
    title: { textStyle: { color: title } },
    legend: { textStyle: { color: text } },
    xAxis: {
      axisLine: { lineStyle: { color: split } },
      axisLabel: { color: axis },
      splitLine: { lineStyle: { color: split } },
    },
    yAxis: {
      axisLine: { lineStyle: { color: split } },
      axisLabel: { color: axis },
      splitLine: { lineStyle: { color: split } },
    },
    color: [
      brandChartColors.blueDeep,
      brandChartColors.orange,
      brandChartColors.sky,
      brandChartColors.ink,
      "#fbbf24",
      "#38bdf8",
    ],
  };
}

export function emptyChartGraphic(dark: boolean, message: string) {
  return [
    {
      type: "text" as const,
      left: "center",
      top: "middle",
      style: {
        text: message,
        fill: dark ? "#94a3b8" : "#64748b",
        fontSize: 14,
        fontWeight: 500,
      },
    },
  ];
}
