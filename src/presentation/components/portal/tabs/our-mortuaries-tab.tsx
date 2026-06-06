"use client";

import { useMemo, useState } from "react";
import { ChartCanvas } from "../charts/chart-canvas";
import { lineConfig } from "../charts/configs";
import { getOurMortuaryTabData, MS_FY_LIST } from "../lib/analytics";
import type { Ethnicity, ServiceType } from "../data/schema";
import {
  Card,
  FilterBar,
  FilterGroup,
  KpiCard,
  KpiGrid,
  SectionBanner,
  SelectField,
} from "../ui/primitives";
import { SortableTable, type TableRow } from "../ui/sortable-table";

const FY_OPTIONS = [
  "FY26",
  "FY25",
  "FY24",
  "FY23",
  "FY22",
  "FY21",
  "FY20",
  "FY19",
  "FY18",
];

const COLUMNS = ["License", "Establishment", "Cases", "Cremation %", "Take Home %"];

const LABELS = [...MS_FY_LIST];
const pctFmt = (v: number) => `${v.toFixed(1)}%`;
const numFmt = (v: number) => Math.round(v).toLocaleString();

function trendChart(
  labels: string[],
  data: number[],
  format: (v: number) => string,
) {
  return lineConfig(labels, data, {
    fill: false,
    tension: 0.1,
    backgroundColor: "#1A887222",
    hideY: true,
    hideXGrid: true,
    legend: false,
    labelFormat: format,
  });
}

export function OurMortuariesTab() {
  const [fy, setFy] = useState("FY26");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("all");
  const [serviceType, setServiceType] = useState<ServiceType>("all");
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

  const data = useMemo(
    () => getOurMortuaryTabData(fy, ethnicity, serviceType, selectedLicense),
    [fy, ethnicity, serviceType, selectedLicense],
  );

  const marketShareConfig = useMemo(
    () => trendChart(LABELS, data.fyData.map((d) => d.marketShare), pctFmt),
    [data],
  );
  const cremConfig = useMemo(
    () => trendChart(LABELS, data.fyData.map((d) => d.cremPct), pctFmt),
    [data],
  );
  const takeHomeConfig = useMemo(
    () => trendChart(LABELS, data.fyData.map((d) => d.takeHomePct), pctFmt),
    [data],
  );
  const hispConfig = useMemo(
    () => trendChart(LABELS, data.fyData.map((d) => d.hispPct), pctFmt),
    [data],
  );
  const casesConfig = useMemo(
    () => trendChart(LABELS, data.fyData.map((d) => d.cases), numFmt),
    [data],
  );

  const selectedName =
    selectedLicense != null
      ? data.rows.find((r) => r.license === selectedLicense)?.name
      : null;

  const rows: TableRow[] = data.rows.map((r) => ({
    selected: selectedLicense === r.license,
    onClick: () =>
      setSelectedLicense((prev) => (prev === r.license ? null : r.license)),
    cells: [
      { display: r.license, sortValue: r.license },
      { display: r.name, sortValue: r.name },
      { display: r.cases.toLocaleString(), sortValue: r.cases },
      { display: `${r.cremPct}%`, sortValue: Number(r.cremPct) },
      { display: `${r.takeHomePct}%`, sortValue: Number(r.takeHomePct) },
    ],
  }));

  return (
    <div>
      <SectionBanner label="Our Mortuaries" title="At-a-Glance — Historical Perspective">
        Clicking on a location name will display information for just the
        selected location. Click again to return to all locations.
      </SectionBanner>

      <FilterBar>
        <FilterGroup label="Fiscal Year">
          <SelectField value={fy} onChange={setFy}>
            {FY_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectField>
        </FilterGroup>
        <FilterGroup label="Ethnicity">
          <SelectField
            value={ethnicity}
            onChange={(v) => setEthnicity(v as Ethnicity)}
          >
            <option value="all">All</option>
            <option value="hispanic">Hispanic</option>
            <option value="non-hispanic">Non-Hispanic</option>
          </SelectField>
        </FilterGroup>
        <FilterGroup label="Service Type">
          <SelectField
            value={serviceType}
            onChange={(v) => setServiceType(v as ServiceType)}
          >
            <option value="all">All</option>
            <option value="traditional">Traditional</option>
            <option value="cremation">Cremation</option>
          </SelectField>
        </FilterGroup>
      </FilterBar>

      <KpiGrid>
        <KpiCard label="Cases" value={data.kpiCases.toLocaleString()} />
        <KpiCard label="Cremation %" value={data.kpiCremPct} />
        <KpiCard label="Take Home %" value={data.kpiTakeHomePct} />
        <KpiCard label="Hispanic Funeral %" value={data.kpiHispPct} />
        <KpiCard label="Data Current Through" value="January 2026" />
      </KpiGrid>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card title="Our Mortuaries Detail" bodyClassName="max-h-[600px] overflow-auto">
          <SortableTable columns={COLUMNS} rows={rows} />
        </Card>
        <Card title="Los Angeles County Market Share">
          <div className="relative h-[300px]">
            <ChartCanvas config={marketShareConfig} />
          </div>
        </Card>
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card title="Cremation %">
          <div className="relative h-[300px]">
            <ChartCanvas config={cremConfig} />
          </div>
        </Card>
        <Card title="Take Home % of all Cremations">
          <div className="relative h-[300px]">
            <ChartCanvas config={takeHomeConfig} />
          </div>
        </Card>
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card title="Hispanic %">
          <div className="relative h-[300px]">
            <ChartCanvas config={hispConfig} />
          </div>
        </Card>
        <Card title="Cases">
          <div className="relative h-[300px]">
            <ChartCanvas config={casesConfig} />
          </div>
        </Card>
      </div>

      <Card className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[1px] text-portal-gray">
          {selectedName ? `Showing: ${selectedName}` : "Showing all Our Mortuaries"}
        </div>
      </Card>
    </div>
  );
}
