"use client";

import { useMemo, useState } from "react";
import { counties, getComparisonData } from "../lib/analytics";
import {
  Card,
  FilterBar,
  FilterGroup,
  SelectField,
} from "../ui/primitives";
import { SortableTable, type TableRow } from "../ui/sortable-table";

const FYA_OPTIONS = ["FY25", "FY24", "FY23", "FY22", "FY21"];
const FYB_OPTIONS = ["FY26", "FY25", "FY24", "FY23", "FY22"];

const COLUMNS = [
  "Funeral Home",
  "FY A Cases",
  "FY B Cases",
  "Delta",
  "FY A Market Share %",
  "FY B Market Share %",
  "Share Delta",
];

const POS = "font-bold font-mono text-portal-up";
const NEG = "font-bold font-mono text-portal-dn";

export function MarketShareChangesTab() {
  const [county, setCounty] = useState("");
  const [fyA, setFyA] = useState("FY25");
  const [fyB, setFyB] = useState("FY26");

  const countyList = useMemo(() => counties(), []);
  const data = useMemo(
    () => getComparisonData(county, fyA, fyB),
    [county, fyA, fyB],
  );

  const rows: TableRow[] = data.map((r) => ({
    cells: [
      { display: r.name, sortValue: r.name },
      { display: r.casesA.toLocaleString(), sortValue: r.casesA },
      { display: r.casesB.toLocaleString(), sortValue: r.casesB },
      {
        display: `${r.delta >= 0 ? "+" : ""}${r.delta.toLocaleString()}`,
        sortValue: r.delta,
        className: r.delta >= 0 ? POS : NEG,
      },
      { display: `${r.shareA.toFixed(2)}%`, sortValue: r.shareA },
      { display: `${r.shareB.toFixed(2)}%`, sortValue: r.shareB },
      {
        display: `${r.shareDelta >= 0 ? "+" : ""}${r.shareDelta.toFixed(2)}%`,
        sortValue: r.shareDelta,
        className: r.shareDelta >= 0 ? POS : NEG,
      },
    ],
  }));

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
        <FilterGroup label="Comparison FY A">
          <SelectField value={fyA} onChange={setFyA}>
            {FYA_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectField>
        </FilterGroup>
        <FilterGroup label="Comparison FY B">
          <SelectField value={fyB} onChange={setFyB}>
            {FYB_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectField>
        </FilterGroup>
      </FilterBar>

      <Card title="Market Share Delta">
        <div className="overflow-x-auto">
          <SortableTable columns={COLUMNS} rows={rows} />
        </div>
      </Card>
    </div>
  );
}
