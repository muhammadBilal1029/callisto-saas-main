"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  registerables,
  type ChartConfiguration,
  type Plugin,
} from "chart.js";

Chart.register(...registerables);

export function ChartCanvas({
  config,
  className,
}: {
  config: ChartConfiguration;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const chart = new Chart(canvas, config);
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [config]);

  return <canvas ref={canvasRef} className={className} />;
}

type LabelOptions = {
  color?: string;
  font?: string;
  offsetY?: number;
};

/**
 * Re-creates the inline "value above each point/bar" labels from the original
 * dashboard. Each chart gets its own plugin instance closing over a formatter.
 */
export function dataLabelPlugin(
  format: (value: number) => string,
  { color = "#333", font = "bold 11px sans-serif", offsetY = 12 }: LabelOptions = {},
): Plugin {
  return {
    id: `dataLabels-${Math.random().toString(36).slice(2)}`,
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((point, idx) => {
          const val = dataset.data[idx] as number | null;
          if (val == null) return;
          ctx.save();
          ctx.fillStyle = color;
          ctx.font = font;
          ctx.textAlign = "center";
          ctx.fillText(format(val), point.x, point.y - offsetY);
          ctx.restore();
        });
      });
    },
  };
}
