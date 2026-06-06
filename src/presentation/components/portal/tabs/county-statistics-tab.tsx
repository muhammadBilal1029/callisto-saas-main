"use client";

import { useMemo, useState } from "react";
import { ChartCanvas } from "../charts/chart-canvas";
import { emptyLineConfig, lineConfig } from "../charts/configs";
import {
  counties,
  establishments,
  findFhByName,
  getCountyTabData,
  getCremationTrendSeries,
  getMarketShareSeries,
  MS_FY_LIST,
} from "../lib/analytics";
import type { Ethnicity, ServiceType } from "../data/schema";
import {
  Card,
  FilterBar,
  FilterGroup,
  KpiCard,
  KpiGrid,
  SelectField,
} from "../ui/primitives";
import { SearchSelect } from "../ui/search-select";
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
  "FY17",
  "FY16",
  "FY15",
];

const COLUMNS = [
  "License #",
  "Issue Date",
  "Establishment",
  "City",
  "Cases",
  "Market Share %",
  "Cremation %",
];

export function CountyStatisticsTab() {
  const [county, setCounty] = useState("");
  const [estab, setEstab] = useState("");
  const [fy, setFy] = useState("FY26");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("all");
  const [serviceType, setServiceType] = useState<ServiceType>("all");

  const countyList = useMemo(() => counties(), []);
  const estabList = useMemo(() => establishments(), []);

  const data = useMemo(
    () => getCountyTabData({ county, estab, fy, ethnicity, serviceType }),
    [county, estab, fy, ethnicity, serviceType],
  );

  const marketShareSeries = useMemo(
    () => getMarketShareSeries(county, estab, ethnicity, serviceType),
    [county, estab, ethnicity, serviceType],
  );

  const cremTrend = useMemo(() => getCremationTrendSeries(), []);

  const tableRows: TableRow[] = data.rows.map((r) => ({
    cells: [
      { display: r.license, sortValue: r.license },
      { display: r.issueDate, sortValue: r.issueDate },
      { display: r.name, sortValue: r.name },
      { display: r.city, sortValue: r.city },
      { display: r.cases.toLocaleString(), sortValue: r.cases },
      { display: `${r.marketShare}%`, sortValue: r.marketShare },
      { display: `${r.cremPct}%`, sortValue: r.cremPct },
    ],
  }));

  const marketShareConfig = useMemo(
    () =>
      marketShareSeries
        ? lineConfig(marketShareSeries.labels, marketShareSeries.data, {
            label: "Market Share %",
            hideY: true,
            topPadding: true,
            hideXGrid: true,
            labelFormat: (v) => `${v.toFixed(1)}%`,
          })
        : emptyLineConfig(
            [...MS_FY_LIST],
            "Select an establishment to view market share trend",
          ),
    [marketShareSeries],
  );

  const trendConfig = useMemo(
    () =>
      lineConfig(cremTrend.labels, cremTrend.data, {
        label: "Cremation % Trend",
        legend: "top",
        yMin: 50,
        yMax: 75,
        yTicksPercent: true,
      }),
    [cremTrend],
  );

  function onEstabChange(name: string) {
    setEstab(name);
    if (name) {
      const fh = findFhByName(name);
      if (fh && fh[3] && county !== fh[3]) setCounty(fh[3]);
    }
  }

  return (
    <div>
      <FilterBar>
        <FilterGroup label="County">
          <SelectField value={county} onChange={setCounty}>
            <option value="">All Counties</option>
            {countyList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
        </FilterGroup>
        <FilterGroup label="Funeral Establishment">
          <SearchSelect value={estab} options={estabList} onChange={onEstabChange} />
        </FilterGroup>
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
        <KpiCard label="Funeral Homes" value={data.kpiHomes} />
        <KpiCard label="Total Cases" value={data.kpiCases.toLocaleString()} />
        <KpiCard label="Cremation %" value={data.kpiCremPct} />
        <KpiCard label="Cremations Home/Scattered %" value={data.kpiScatteredPct} />
        <KpiCard label="Hispanic %" value={data.kpiHispPct} />
      </KpiGrid>

      <div className="mb-6 grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card
          title="Funeral Establishments Detail"
          bodyClassName="max-h-[600px] overflow-auto"
        >
          <SortableTable
            columns={COLUMNS}
            rows={tableRows}
            totalsRow={
              <tr className="border-y-2 border-portal-black bg-[#F2F2EF] font-bold">
                <td className="px-[10px] py-2 font-bold" colSpan={4}>
                  TOTAL
                </td>
                <td className="px-[10px] py-2 font-bold">
                  {data.totals.cases.toLocaleString()}
                </td>
                <td className="px-[10px] py-2 font-bold">100%</td>
                <td className="px-[10px] py-2 font-bold">{data.totals.cremPct}</td>
              </tr>
            }
          />
        </Card>
        <Card title="Market Share Trend">
          <div className="relative h-[300px]">
            <ChartCanvas config={marketShareConfig} />
          </div>
        </Card>
      </div>

      <Card title="Cremation % Trend">
        <div className="relative h-[300px]">
          <ChartCanvas config={trendConfig} />
        </div>
      </Card>
    </div>
  );
}
