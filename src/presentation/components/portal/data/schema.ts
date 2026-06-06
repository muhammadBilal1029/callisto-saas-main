// Raw tuple shapes for the synthetic dashboard datasets.
// Keeping the array layout avoids any transformation risk in the
// aggregation logic.

/** [license, name, city, county, zip, issueDate, lat, lng, owner, segment, address] */
export type FhDirRow = [
  string, // 0 license
  string, // 1 name
  string, // 2 city
  string, // 3 county
  string, // 4 zip
  string | null, // 5 issueDate (a few records are null)
  number | null, // 6 lat
  number | null, // 7 lng
  string | null, // 8 owner
  string | null, // 9 segment
  string, // 10 address
];

/** [fy, license, cases, cremations, burials, scattered, hispanicCases, hispCremations, hispScattered] */
export type FyLicRow = [
  string, // 0 fiscal year
  string, // 1 license
  number, // 2 cases
  number, // 3 cremations
  number, // 4 burials
  number, // 5 scattered
  number, // 6 hispanicCases
  number, // 7 hispCremations
  number, // 8 hispScattered
];

/** [monthLabel, sortKey, license, cases, crem, scattered, hCases, hCrem, hScattered] */
export type MonthlyRow = [
  string, // 0 month label (e.g. "Apr-FY25")
  string, // 1 sort key (e.g. "FY25-10")
  string, // 2 license
  number, // 3 cases
  number, // 4 cremations
  number, // 5 scattered
  number, // 6 hispanicCases
  number, // 7 hispCremations
  number, // 8 hispScattered
];

export type FyTrend = {
  fy: string;
  cases: number;
  cremations: number;
  burials: number;
  scattered: number;
  hispanicCases: number;
  cremPct: number;
  hispPct: number;
  scatteredPct: number;
};

export type Ethnicity = "all" | "hispanic" | "non-hispanic";
export type ServiceType = "all" | "traditional" | "cremation";
