/** Shared ECharts styling so charts stay readable in light and dark UI. */
export function echartsTheme(dark: boolean) {
  const text = dark ? "#cbd5e1" : "#64748b";
  const title = dark ? "#e2e8f0" : "#475569";
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
