"use client";

import { useMemo } from "react";
import { ChartCanvas } from "../charts/chart-canvas";
import { barConfig, GREEN, GREEN_DK, lineConfig, WARN, WARN_FILL } from "../charts/configs";
import { getStatewideData } from "../lib/analytics";
import { Card, KpiCard, KpiGrid } from "../ui/primitives";
import { SortableTable, type TableRow } from "../ui/sortable-table";

const COLUMNS = [
  "FY",
  "Cases",
  "Cremations",
  "Cremation %",
  "Burials",
  "Scattered",
  "Hispanic %",
];

export function StateStatisticsTab() {
  const data = useMemo(() => getStatewideData(), []);

  const casesConfig = useMemo(
    () =>
      barConfig(data.labels, data.cases, {
        label: "Case Count",
        backgroundColor: GREEN,
        borderColor: GREEN_DK,
        beginAtZero: true,
      }),
    [data],
  );

  const cremConfig = useMemo(
    () =>
      lineConfig(data.labels, data.cremPcts, {
        label: "Cremation %",
        borderColor: WARN,
        backgroundColor: WARN_FILL,
        legend: true,
        yMin: 55,
        yMax: 75,
        yTicksPercent: true,
      }),
    [data],
  );

  const rows: TableRow[] = data.rows.map((t) => ({
    cells: [
      { display: t.fy, sortValue: t.fy },
      { display: t.cases.toLocaleString(), sortValue: t.cases },
      { display: t.cremations.toLocaleString(), sortValue: t.cremations },
      { display: `${t.cremPct.toFixed(1)}%`, sortValue: t.cremPct },
      { display: t.burials.toLocaleString(), sortValue: t.burials },
      { display: t.scattered.toLocaleString(), sortValue: t.scattered },
      { display: `${t.hispPct.toFixed(1)}%`, sortValue: t.hispPct },
    ],
  }));

  return (
    <div>
      <KpiGrid>
        <KpiCard
          label="Total Cases (FY26)"
          value={data.latest.cases.toLocaleString()}
        />
        <KpiCard
          label="Cremation % (FY26)"
          value={`${data.latest.cremPct.toFixed(1)}%`}
        />
        <KpiCard
          label="Scattered % (FY26)"
          value={`${data.latest.scatteredPct.toFixed(1)}%`}
        />
        <KpiCard
          label="Hispanic % (FY26)"
          value={`${data.latest.hispPct.toFixed(1)}%`}
        />
      </KpiGrid>

      <Card title="Case Count by Fiscal Year" className="mb-[18px]">
        <div className="relative h-[300px]">
          <ChartCanvas config={casesConfig} />
        </div>
      </Card>

      <Card title="Cremation % Trend" className="mb-[18px]">
        <div className="relative h-[300px]">
          <ChartCanvas config={cremConfig} />
        </div>
      </Card>

      <Card title="Statewide Fiscal Year Summary">
        <div className="overflow-x-auto">
          <SortableTable columns={COLUMNS} rows={rows} />
        </div>
      </Card>
    </div>
  );
}
