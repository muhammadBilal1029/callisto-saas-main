"use client";

import { useMemo, useState } from "react";
import { ChartCanvas } from "../charts/chart-canvas";
import { barConfig, GREEN, GREEN_MID } from "../charts/configs";
import { getProfileLocations, getProfileTabData } from "../lib/analytics";
import type { Ethnicity, ServiceType } from "../data/schema";
import { MarketAreaMap, type MapPoint } from "../map/market-area-map";
import {
  Card,
  FilterBar,
  FilterGroup,
  KpiCard,
  KpiGrid,
  NumberField,
  SelectField,
} from "../ui/primitives";
import { SortableTable, type TableRow } from "../ui/sortable-table";

const COLUMNS = [
  "License #",
  "Original Issue Date",
  "Funeral Establishment",
  "City",
  "Case Count",
  "Market Share %",
  "Cremation %",
];

export function MarketProfileTab() {
  const [license, setLicense] = useState("");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("all");
  const [serviceType, setServiceType] = useState<ServiceType>("all");
  const [radiusMin, setRadiusMin] = useState(0);
  const [radiusMax, setRadiusMax] = useState(200);

  const locations = useMemo(() => getProfileLocations(), []);

  const data = useMemo(
    () =>
      license
        ? getProfileTabData(license, ethnicity, serviceType, radiusMin, radiusMax)
        : null,
    [license, ethnicity, serviceType, radiusMin, radiusMax],
  );

  const points: MapPoint[] = useMemo(
    () =>
      data
        ? data.marketStats.map((s) => ({
            license: s.license,
            name: s.name,
            city: s.city,
            lat: s.lat,
            lng: s.lng,
            owner: s.owner,
            dist: s.dist,
            cases12m: s.cases12m,
          }))
        : [],
    [data],
  );

  const rows: TableRow[] = data
    ? data.marketStats.map((s) => ({
        cells: [
          { display: s.license, sortValue: s.license },
          { display: s.issueDate, sortValue: s.issueDate },
          { display: s.name, sortValue: s.name },
          { display: s.city, sortValue: s.city },
          { display: s.cases12m.toLocaleString(), sortValue: s.cases12m },
          { display: `${s.marketShare}%`, sortValue: Number(s.marketShare) },
          { display: `${s.cremPct}%`, sortValue: Number(s.cremPct) },
        ],
      }))
    : [];

  const marketShareConfig = useMemo(
    () =>
      data
        ? barConfig(data.monthLabels, data.marketSharePcts, {
            backgroundColor: GREEN,
            hideY: true,
            rotateX: true,
            labelFormat: (v) => `${v.toFixed(1)}%`,
          })
        : null,
    [data],
  );

  const takeHomeConfig = useMemo(
    () =>
      data
        ? barConfig(data.monthLabels, data.takeHomeCounts, {
            backgroundColor: GREEN_MID,
            hideY: true,
            rotateX: true,
            labelFormat: (v) => `${Math.round(v)}`,
          })
        : null,
    [data],
  );

  return (
    <div>
      <FilterBar>
        <FilterGroup label="Select your Location">
          <SelectField value={license} onChange={setLicense} className="min-w-[260px]">
            <option value="">-- Select Funeral Home --</option>
            {locations.map((loc) => (
              <option key={loc.license} value={loc.license}>
                {loc.name}
                {loc.city ? ` (${loc.city})` : ""}
              </option>
            ))}
          </SelectField>
        </FilterGroup>
        <FilterGroup label="Ethnicity">
          <SelectField value={ethnicity} onChange={(v) => setEthnicity(v as Ethnicity)}>
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
        <FilterGroup label="Market Area Radius (miles)">
          <div className="flex items-center gap-[10px]">
            <NumberField
              value={radiusMin}
              onChange={setRadiusMin}
              min={0}
              max={200}
              className="w-[80px]"
            />
            <span className="text-[11.5px] text-portal-gray">to</span>
            <NumberField
              value={radiusMax}
              onChange={setRadiusMax}
              min={0}
              max={200}
              className="w-[80px]"
            />
          </div>
        </FilterGroup>
      </FilterBar>

      <KpiGrid>
        <KpiCard label="Funeral Homes in Market Area" value={data?.kpiCount ?? 0} />
        <KpiCard
          label="Total Cases in Market Area"
          value={(data?.kpiCases ?? 0).toLocaleString()}
        />
        <KpiCard label="Cremation % in Market Area" value={data?.kpiCremPct ?? "0%"} />
        <KpiCard label="Data Current Through" value="January 2026" />
      </KpiGrid>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card title="Market Statistics for last 12 Months">
          <div className="overflow-x-auto">
            {data ? (
              <SortableTable columns={COLUMNS} rows={rows} />
            ) : (
              <EmptyHint />
            )}
          </div>
        </Card>
        <Card title="Market Area Map">
          {data ? (
            <MarketAreaMap
              selLat={data.selLat}
              selLng={data.selLng}
              selectedLicense={license}
              radiusMin={radiusMin}
              radiusMax={radiusMax}
              points={points}
            />
          ) : (
            <div className="flex h-[400px] w-full items-center justify-center border border-portal-border">
              <EmptyHint />
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <Card title="Your Location's Monthly Market Share within selected Market Area">
          <div className="relative h-[300px]">
            {marketShareConfig ? (
              <ChartCanvas config={marketShareConfig} />
            ) : (
              <EmptyHint />
            )}
          </div>
        </Card>
        <Card title="# of Take Home Cremations for your Location">
          <div className="relative h-[300px]">
            {takeHomeConfig ? (
              <ChartCanvas config={takeHomeConfig} />
            ) : (
              <EmptyHint />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <p className="p-5 text-center text-[11px] font-semibold uppercase tracking-[0.5px] text-portal-gray-lt">
      Select a funeral home to view its market area
    </p>
  );
}
