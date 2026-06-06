import { FH_DIR_RAW } from "../data/fh-directory";
import { FY_LIC_RAW } from "../data/fy-license";
import { MONTHLY_RAW } from "../data/monthly";
import { FY_TREND } from "../data/fy-trend";
import type {
  Ethnicity,
  FhDirRow,
  FyLicRow,
  MonthlyRow,
  ServiceType,
} from "../data/schema";

export const FH_DIR = FH_DIR_RAW;
export const FY_LIC = FY_LIC_RAW;
export { FY_TREND, MONTHLY_RAW };

export const FISCAL_YEARS = [
  "FY15",
  "FY16",
  "FY17",
  "FY18",
  "FY19",
  "FY20",
  "FY21",
  "FY22",
  "FY23",
  "FY24",
  "FY25",
  "FY26",
] as const;

/** Years used by the market-share trend charts. */
export const MS_FY_LIST = [
  "FY18",
  "FY19",
  "FY20",
  "FY21",
  "FY22",
  "FY23",
  "FY24",
  "FY25",
  "FY26",
] as const;

export const OUR_MORTUARY_LICENSES = [
  "48213",
  "50942",
  "37165",
  "61308",
  "29487",
  "54720",
];

/**
 * Applies ethnicity + service-type slicing to a single case/cremation/scattered
 * triple, mirroring the original dashboard logic exactly.
 */
function applyFilters(
  cases: number,
  cremations: number,
  scattered: number,
  hispanicCases: number,
  hispCremations: number,
  hispScattered: number,
  ethnicity: Ethnicity,
  serviceType: ServiceType,
): { cases: number; cremations: number; scattered: number } {
  let fCases = cases;
  let fCrem = cremations;
  let fScattered = scattered;

  if (ethnicity === "hispanic") {
    fCases = hispanicCases;
    fCrem = hispCremations;
    fScattered = hispScattered;
  } else if (ethnicity === "non-hispanic") {
    fCases = cases - hispanicCases;
    fCrem = cremations - hispCremations;
    fScattered = scattered - hispScattered;
  }

  if (serviceType === "traditional") {
    fCases = fCases - fCrem;
    fCrem = 0;
  } else if (serviceType === "cremation") {
    fCases = fCrem;
  }

  return { cases: fCases, cremations: fCrem, scattered: fScattered };
}

export type FilteredData = {
  fhFiltered: FhDirRow[];
  licFiltered: FyLicRow[];
};

export function getFilteredData(
  county = "",
  estab = "",
  fy = "FY26",
  ethnicity: Ethnicity = "all",
  serviceType: ServiceType = "all",
): FilteredData {
  const fhFiltered = FH_DIR.filter((fh) => {
    if (county && fh[3] !== county) return false;
    if (estab && fh[1] !== estab) return false;
    return true;
  });

  const licenses = new Set(fhFiltered.map((fh) => fh[0]));

  const licFiltered = FY_LIC.filter(
    (row) => row[0] === fy && licenses.has(row[1]),
  ).map((row): FyLicRow => {
    const [
      rowFy,
      rowLic,
      cases,
      cremations,
      burials,
      scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
    ] = row;
    const f = applyFilters(
      cases,
      cremations,
      scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
      ethnicity,
      serviceType,
    );
    return [
      rowFy,
      rowLic,
      f.cases,
      f.cremations,
      burials,
      f.scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
    ];
  });

  return { fhFiltered, licFiltered };
}

export function getOwnerColor(owner: string | null | undefined): string {
  const colors: Record<string, string> = {
    "Group A": "#FF6B6B",
    "Group B": "#4ECDC4",
    Independent: "#1A8872",
    unknown: "#95A5A6",
  };
  return colors[owner ?? "unknown"] ?? "#95A5A6";
}

export const counties = (): string[] =>
  Array.from(new Set(FH_DIR.map((fh) => fh[3]))).sort();

export const establishments = (): string[] => {
  const set = new Set<string>();
  FH_DIR.forEach((fh) => set.add(fh[1]));
  return Array.from(set).sort();
};

export function findFhByName(name: string): FhDirRow | undefined {
  return FH_DIR.find((fh) => fh[1] === name);
}

// ─── County tab ───────────────────────────────────────────────────────────

export type CountyFilters = {
  county: string;
  estab: string;
  fy: string;
  ethnicity: Ethnicity;
  serviceType: ServiceType;
};

export type CountyTableRow = {
  license: string;
  issueDate: string;
  name: string;
  city: string;
  cases: number;
  marketShare: number;
  cremPct: number;
};

export type CountyTabData = {
  kpiHomes: number;
  kpiCases: number;
  kpiCremPct: string;
  kpiScatteredPct: string;
  kpiHispPct: string;
  rows: CountyTableRow[];
  totals: { cases: number; cremPct: string };
};

export function getCountyTabData(filters: CountyFilters): CountyTabData {
  const { county, estab, fy, ethnicity, serviceType } = filters;
  const { fhFiltered, licFiltered } = getFilteredData(
    county,
    estab,
    fy,
    ethnicity,
    serviceType,
  );

  const licMap = new Map(licFiltered.map((row) => [row[1], row]));

  let totalCases = 0;
  let totalCremations = 0;
  const totalHispanic = 0; // mirrors source: never accumulated → KPI shows 0.0%
  licMap.forEach((row) => {
    totalCases += row[2];
    totalCremations += row[3];
  });

  const cremPct =
    totalCases > 0 ? ((totalCremations / totalCases) * 100).toFixed(1) : "0";
  const trend = FY_TREND.find((t) => t.fy === fy);
  const scatteredPct = trend ? trend.scatteredPct : 0;
  const hispPct =
    totalCases > 0 ? ((totalHispanic / totalCases) * 100).toFixed(1) : "0";

  const rows: CountyTableRow[] = fhFiltered
    .map((fh) => {
      const licData = licMap.get(fh[0]);
      const cases = licData ? licData[2] : 0;
      const cremations = licData ? licData[3] : 0;
      const marketShare =
        totalCases > 0 ? parseFloat(((cases / totalCases) * 100).toFixed(1)) : 0;
      const cPct =
        cases > 0 ? parseFloat(((cremations / cases) * 100).toFixed(1)) : 0;
      return {
        license: fh[0],
        issueDate: fh[5] ?? "",
        name: fh[1],
        city: fh[2],
        cases,
        marketShare,
        cremPct: cPct,
      };
    })
    .sort((a, b) => b.cases - a.cases);

  const tableTotalCases = rows.reduce((sum, r) => sum + r.cases, 0);
  const tableTotalCremations = rows.reduce(
    (sum, r) => sum + Math.round((r.cases * r.cremPct) / 100),
    0,
  );
  const tableTotalCremPct =
    tableTotalCases > 0
      ? ((tableTotalCremations / tableTotalCases) * 100).toFixed(1)
      : "0";

  return {
    kpiHomes: fhFiltered.length,
    kpiCases: totalCases,
    kpiCremPct: `${cremPct}%`,
    kpiScatteredPct: `${scatteredPct}%`,
    kpiHispPct: `${hispPct}%`,
    rows,
    totals: { cases: tableTotalCases, cremPct: `${tableTotalCremPct}%` },
  };
}

/** Market-share-over-time series for the selected establishment, or null. */
export function getMarketShareSeries(
  county: string,
  estab: string,
  ethnicity: Ethnicity,
  serviceType: ServiceType,
): { labels: string[]; data: number[] } | null {
  if (!estab) return null;
  const matched = FH_DIR.filter((fh) => fh[1] === estab);
  if (matched.length === 0) return null;
  const estabCounty = county || matched[0][3] || "";

  const data = MS_FY_LIST.map((fy) => {
    const { licFiltered: countyLic } = getFilteredData(
      estabCounty,
      "",
      fy,
      ethnicity,
      serviceType,
    );
    const totalCountyCases = countyLic.reduce((s, r) => s + r[2], 0);

    const { licFiltered: estabLic } = getFilteredData(
      estabCounty,
      estab,
      fy,
      ethnicity,
      serviceType,
    );
    const estabCases = estabLic.reduce((s, r) => s + r[2], 0);

    const ms = totalCountyCases > 0 ? (estabCases / totalCountyCases) * 100 : 0;
    return parseFloat(ms.toFixed(2));
  });

  return { labels: [...MS_FY_LIST], data };
}

/** Region-wide cremation % trend (independent of filters). */
export function getCremationTrendSeries(): {
  labels: string[];
  data: number[];
} {
  return {
    labels: [...FISCAL_YEARS],
    data: FISCAL_YEARS.map((fy) => {
      const t = FY_TREND.find((x) => x.fy === fy);
      return t ? t.cremPct : 0;
    }),
  };
}

// ─── Market Share Changes (comparison) tab ─────────────────────────────────

export type ComparisonRow = {
  name: string;
  casesA: number;
  casesB: number;
  delta: number;
  shareA: number;
  shareB: number;
  shareDelta: number;
};

export function getComparisonData(
  county: string,
  fyA: string,
  fyB: string,
): ComparisonRow[] {
  const { licFiltered: licA } = getFilteredData(county, "", fyA, "all", "all");
  const { licFiltered: licB } = getFilteredData(county, "", fyB, "all", "all");

  const mapA = new Map(licA.map((row) => [row[1], row]));
  const mapB = new Map(licB.map((row) => [row[1], row]));

  const totalA = licA.reduce((s, r) => s + r[2], 0);
  const totalB = licB.reduce((s, r) => s + r[2], 0);

  const allLicenses = new Set([...mapA.keys(), ...mapB.keys()]);
  const rows: ComparisonRow[] = [];

  allLicenses.forEach((lic) => {
    const casesA = mapA.get(lic)?.[2] ?? 0;
    const casesB = mapB.get(lic)?.[2] ?? 0;
    const shareA = totalA > 0 ? (casesA / totalA) * 100 : 0;
    const shareB = totalB > 0 ? (casesB / totalB) * 100 : 0;
    const fh = FH_DIR.find((f) => f[0] === lic);
    rows.push({
      name: fh ? fh[1] : lic,
      casesA,
      casesB,
      delta: casesB - casesA,
      shareA,
      shareB,
      shareDelta: shareB - shareA,
    });
  });

  rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return rows;
}

// ─── Statewide tab ─────────────────────────────────────────────────────────

export function getStatewideData() {
  const latest = FY_TREND[FY_TREND.length - 1];
  return {
    latest,
    rows: FY_TREND,
    labels: FY_TREND.map((t) => t.fy),
    cases: FY_TREND.map((t) => t.cases),
    cremPcts: FY_TREND.map((t) => t.cremPct),
  };
}

// ─── Our Mortuaries tab ─────────────────────────────────────────

export type OurMortuaryTableRow = {
  license: string;
  name: string;
  cases: number;
  cremPct: string;
  takeHomePct: string;
};

export type OurMortuaryFyDatum = {
  fy: string;
  cases: number;
  crem: number;
  scattered: number;
  cremPct: number;
  takeHomePct: number;
  hispPct: number;
  marketShare: number;
};

export type OurMortuaryTabData = {
  kpiCases: number;
  kpiCremPct: string;
  kpiTakeHomePct: string;
  kpiHispPct: string;
  rows: OurMortuaryTableRow[];
  fyData: OurMortuaryFyDatum[];
};

export function getOurMortuaryTabData(
  fy: string,
  ethnicity: Ethnicity,
  serviceType: ServiceType,
  selectedLicense: string | null,
): OurMortuaryTabData {
  const ourFHs = FH_DIR.filter((fh) => OUR_MORTUARY_LICENSES.includes(fh[0]));
  const ourLicSet = new Set(OUR_MORTUARY_LICENSES);

  const licData = FY_LIC.filter(
    (row) => row[0] === fy && ourLicSet.has(row[1]),
  ).map((row): FyLicRow => {
    const [
      rFy,
      rLic,
      cases,
      cremations,
      burials,
      scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
    ] = row;
    const f = applyFilters(
      cases,
      cremations,
      scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
      ethnicity,
      serviceType,
    );
    return [
      rFy,
      rLic,
      f.cases,
      f.cremations,
      burials,
      f.scattered,
      hispanicCases,
      hispCremations,
      hispScattered,
    ];
  });

  const licMap = new Map(licData.map((r) => [r[1], r]));

  let totalCases = 0;
  let totalCrem = 0;
  let totalScattered = 0;
  let totalHisp = 0;
  let totalAllForHisp = 0;
  licData.forEach((r) => {
    totalCases += r[2];
    totalCrem += r[3];
    totalScattered += r[5];
    totalHisp += r[6];
    const orig = FY_LIC.find((o) => o[0] === fy && o[1] === r[1]);
    if (orig) totalAllForHisp += orig[2];
  });

  const rows: OurMortuaryTableRow[] = ourFHs
    .map((fh) => {
      const ld = licMap.get(fh[0]);
      const cases = ld ? ld[2] : 0;
      const crem = ld ? ld[3] : 0;
      const scattered = ld ? ld[5] : 0;
      return {
        license: fh[0],
        name: fh[1],
        cases,
        cremPct: cases > 0 ? ((crem / cases) * 100).toFixed(0) : "0",
        takeHomePct: crem > 0 ? ((scattered / crem) * 100).toFixed(0) : "0",
      };
    })
    .sort((a, b) => b.cases - a.cases);

  return {
    kpiCases: totalCases,
    kpiCremPct: `${totalCases > 0 ? ((totalCrem / totalCases) * 100).toFixed(0) : 0}%`,
    kpiTakeHomePct: `${totalCrem > 0 ? ((totalScattered / totalCrem) * 100).toFixed(0) : 0}%`,
    kpiHispPct: `${totalAllForHisp > 0 ? ((totalHisp / totalAllForHisp) * 100).toFixed(0) : 0}%`,
    rows,
    fyData: getOurMortuaryFyData(ethnicity, serviceType, selectedLicense),
  };
}

function getOurMortuaryFyData(
  ethnicity: Ethnicity,
  serviceType: ServiceType,
  selectedLicense: string | null,
): OurMortuaryFyDatum[] {
  const activeLicenses = selectedLicense
    ? [selectedLicense]
    : OUR_MORTUARY_LICENSES;
  const ourLicSet = new Set(activeLicenses);
  const laLicenses = new Set(
    FH_DIR.filter((fh) => fh[3] === "Los Angeles").map((fh) => fh[0]),
  );

  return MS_FY_LIST.map((fy) => {
    let cases = 0;
    let crem = 0;
    let scattered = 0;
    let hisp = 0;
    let allCases = 0;

    FY_LIC.forEach((row) => {
      if (row[0] !== fy || !ourLicSet.has(row[1])) return;
      const [, , c, cr, , sc, h, hcr, hsc] = row;
      allCases += c;
      hisp += h;
      const f = applyFilters(c, cr, sc, h, hcr, hsc, ethnicity, serviceType);
      cases += f.cases;
      crem += f.cremations;
      scattered += f.scattered;
    });

    let countyTotal = 0;
    FY_LIC.forEach((row) => {
      if (row[0] !== fy || !laLicenses.has(row[1])) return;
      const [, , rc, rcr, , rsc, rh, rhcr, rhsc] = row;
      const f = applyFilters(
        rc,
        rcr,
        rsc,
        rh,
        rhcr,
        rhsc,
        ethnicity,
        serviceType,
      );
      countyTotal += f.cases;
    });

    return {
      fy,
      cases,
      crem,
      scattered,
      cremPct: cases > 0 ? (crem / cases) * 100 : 0,
      takeHomePct: crem > 0 ? (scattered / crem) * 100 : 0,
      hispPct: allCases > 0 ? (hisp / allCases) * 100 : 0,
      marketShare: countyTotal > 0 ? (cases / countyTotal) * 100 : 0,
    };
  });
}

// ─── Market Profile tab ────────────────────────────────────────────────────

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let _monthlyByLicense: Record<string, MonthlyRow[]> | null = null;
function getMonthlyByLicense(): Record<string, MonthlyRow[]> {
  if (_monthlyByLicense) return _monthlyByLicense;
  const map: Record<string, MonthlyRow[]> = {};
  for (const row of MONTHLY_RAW) {
    const lic = row[2];
    if (!map[lic]) map[lic] = [];
    map[lic].push(row);
  }
  _monthlyByLicense = map;
  return map;
}

function getFilteredMonthlyCases(
  row: MonthlyRow,
  ethnicity: Ethnicity,
  serviceType: ServiceType,
): { cases: number; crem: number; scattered: number } {
  const f = applyFilters(
    row[3],
    row[4],
    row[5],
    row[6],
    row[7],
    row[8],
    ethnicity,
    serviceType,
  );
  return { cases: f.cases, crem: f.cremations, scattered: f.scattered };
}

export type ProfileLocation = { license: string; name: string; city: string };

export function getProfileLocations(): ProfileLocation[] {
  return FH_DIR.filter((fh) => fh[6] != null && fh[7] != null)
    .map((fh) => ({
      license: fh[0],
      name: fh[1] || `License #${fh[0]}`,
      city: fh[2] || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type ProfileMarketRow = {
  license: string;
  name: string;
  city: string;
  county: string;
  issueDate: string;
  lat: number;
  lng: number;
  owner: string | null;
  dist: number;
  cases12m: number;
  crem12m: number;
  cremPct: string;
  marketShare: string;
};

export type ProfileTabData = {
  selLat: number;
  selLng: number;
  kpiCount: number;
  kpiCases: number;
  kpiCremPct: string;
  marketStats: ProfileMarketRow[];
  monthLabels: string[];
  marketSharePcts: number[];
  takeHomeCounts: number[];
};

export function getProfileTabData(
  selectedLicense: string,
  ethnicity: Ethnicity,
  serviceType: ServiceType,
  radiusMin: number,
  radiusMax: number,
): ProfileTabData | null {
  const selFH = FH_DIR.find((fh) => fh[0] === selectedLicense);
  if (!selFH || selFH[6] == null || selFH[7] == null) return null;
  const selLat = selFH[6];
  const selLng = selFH[7];

  const monthlyByLic = getMonthlyByLicense();

  const fhInRadius = FH_DIR.filter((fh) => fh[6] != null && fh[7] != null)
    .map((fh) => {
      const dist = haversineDistance(
        selLat,
        selLng,
        fh[6] as number,
        fh[7] as number,
      );
      return { fh, dist };
    })
    .filter(({ dist }) => dist >= radiusMin && dist <= radiusMax)
    .map(({ fh, dist }) => ({
      license: fh[0],
      name: fh[1],
      city: fh[2],
      county: fh[3],
      issueDate: fh[5] ?? "",
      lat: fh[6] as number,
      lng: fh[7] as number,
      owner: fh[8],
      dist,
    }));

  const radiusLicenses = new Set(fhInRadius.map((fh) => fh.license));

  let totalCasesMarket = 0;
  let totalCremMarket = 0;
  const stats = fhInRadius.map((fh) => {
    const rows = monthlyByLic[fh.license] || [];
    let c = 0;
    let cr = 0;
    rows.forEach((r) => {
      const f = getFilteredMonthlyCases(r, ethnicity, serviceType);
      c += f.cases;
      cr += f.crem;
    });
    totalCasesMarket += c;
    totalCremMarket += cr;
    return {
      ...fh,
      cases12m: c,
      crem12m: cr,
      cremPct: c > 0 ? ((cr / c) * 100).toFixed(1) : "0.0",
    };
  });

  const marketStats: ProfileMarketRow[] = stats
    .map((s) => ({
      ...s,
      marketShare:
        totalCasesMarket > 0
          ? ((s.cases12m / totalCasesMarket) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.cases12m - a.cases12m);

  // Monthly market-share + take-home series
  const sortedMonthKeys = [...new Set(MONTHLY_RAW.map((r) => r[1]))].sort();
  const monthLabels: string[] = [];
  const myMonthlyCases: number[] = [];
  const marketMonthlyCases: number[] = [];
  const myMonthlyScattered: number[] = [];

  sortedMonthKeys.forEach((sk) => {
    monthLabels.push(MONTHLY_RAW.find((r) => r[1] === sk)?.[0] || sk);

    let myCases = 0;
    let myScattered = 0;
    let marketCases = 0;

    (monthlyByLic[selectedLicense] || [])
      .filter((r) => r[1] === sk)
      .forEach((r) => {
        const f = getFilteredMonthlyCases(r, ethnicity, serviceType);
        myCases += f.cases;
        myScattered += f.scattered;
      });

    radiusLicenses.forEach((lic) => {
      (monthlyByLic[lic] || [])
        .filter((r) => r[1] === sk)
        .forEach((r) => {
          marketCases += getFilteredMonthlyCases(r, ethnicity, serviceType).cases;
        });
    });

    myMonthlyCases.push(myCases);
    marketMonthlyCases.push(marketCases);
    myMonthlyScattered.push(myScattered);
  });

  const marketSharePcts = myMonthlyCases.map((c, i) =>
    marketMonthlyCases[i] > 0 ? (c / marketMonthlyCases[i]) * 100 : 0,
  );

  return {
    selLat,
    selLng,
    kpiCount: fhInRadius.length,
    kpiCases: totalCasesMarket,
    kpiCremPct: `${totalCasesMarket > 0 ? ((totalCremMarket / totalCasesMarket) * 100).toFixed(0) : "0"}%`,
    marketStats,
    monthLabels,
    marketSharePcts,
    takeHomeCounts: myMonthlyScattered,
  };
}
