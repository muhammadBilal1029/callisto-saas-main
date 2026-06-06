import type { ChartConfiguration } from "chart.js";
import { dataLabelPlugin } from "./chart-canvas";

export const GREEN = "#1A8872";
export const GREEN_FILL = "rgba(26, 201, 160, 0.1)";
export const GREEN_DK = "#116655";
export const GREEN_MID = "#2E8B73";
export const WARN = "#B8760A";
export const WARN_FILL = "rgba(255, 152, 0, 0.1)";

type LineOptions = {
  label?: string;
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  legend?: boolean | "top";
  hideY?: boolean;
  beginAtZero?: boolean;
  yMin?: number;
  yMax?: number;
  yTicksPercent?: boolean;
  topPadding?: boolean;
  hideXGrid?: boolean;
  labelFormat?: (v: number) => string;
  labelColor?: string;
};

export function lineConfig(
  labels: string[],
  data: number[],
  o: LineOptions = {},
): ChartConfiguration<"line"> {
  const plugins = o.labelFormat
    ? [dataLabelPlugin(o.labelFormat, { color: o.labelColor })]
    : [];

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: o.label,
          data,
          borderColor: o.borderColor ?? GREEN,
          backgroundColor: o.backgroundColor ?? GREEN_FILL,
          borderWidth: 2,
          fill: o.fill ?? true,
          tension: o.tension ?? 0.4,
          pointRadius: 4,
        },
      ],
    },
    plugins,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: o.topPadding ? { padding: { top: 20 } } : undefined,
      plugins: {
        legend: {
          display: o.legend !== false,
          position: o.legend === "top" ? "top" : undefined,
        },
      },
      scales: {
        x: { grid: { display: !o.hideXGrid } },
        y: o.hideY
          ? { display: false, min: o.yMin, max: o.yMax }
          : {
              beginAtZero: o.beginAtZero ?? false,
              min: o.yMin,
              max: o.yMax,
              ticks: o.yTicksPercent
                ? { callback: (value) => `${value}%` }
                : undefined,
            },
      },
    },
  };
}

/** Empty line chart with a centered prompt (used when no establishment chosen). */
export function emptyLineConfig(
  labels: string[],
  message: string,
): ChartConfiguration<"line"> {
  return {
    type: "line",
    data: { labels, datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: message,
          font: { size: 14 },
          color: "#999",
        },
      },
    },
  };
}

type BarOptions = {
  label?: string;
  backgroundColor?: string;
  borderColor?: string;
  legend?: boolean;
  beginAtZero?: boolean;
  hideY?: boolean;
  labelFormat?: (v: number) => string;
  labelColor?: string;
  rotateX?: boolean;
};

export function barConfig(
  labels: string[],
  data: number[],
  o: BarOptions = {},
): ChartConfiguration<"bar"> {
  const plugins = o.labelFormat
    ? [dataLabelPlugin(o.labelFormat, { color: o.labelColor ?? "#116655", offsetY: 8 })]
    : [];

  const scales: NonNullable<ChartConfiguration<"bar">["options"]>["scales"] = {
    y: o.hideY ? { display: false } : { beginAtZero: o.beginAtZero ?? true },
  };
  if (o.rotateX) {
    scales.x = {
      ticks: { font: { size: 10 }, maxRotation: 45 },
      grid: { display: false },
    };
  }

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: o.label,
          data,
          backgroundColor: o.backgroundColor ?? GREEN,
          borderColor: o.borderColor,
          borderWidth: o.borderColor ? 1 : 0,
        },
      ],
    },
    plugins,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: o.legend ?? false } },
      scales,
    },
  };
}
