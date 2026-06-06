// One-off generator: writes fully synthetic, non-proprietary datasets for the
// portal dashboard so the app demos correctly without any client data.
// Deterministic (seeded) so output is stable. Run with: node scripts/generate-synthetic-portal-data.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DATA_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "presentation",
  "components",
  "portal",
  "data",
);

// ── seeded RNG ──────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260529);
const rand = (min, max) => min + rng() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const FISCAL_YEARS = [
  "FY15", "FY16", "FY17", "FY18", "FY19", "FY20",
  "FY21", "FY22", "FY23", "FY24", "FY25", "FY26",
];

// Approximate, public county centroids (lat, lng) for marker placement.
const COUNTIES = [
  { name: "Los Angeles", lat: 34.05, lng: -118.24, zip: 90000, weight: 26,
    cities: ["Los Angeles", "Long Beach", "Glendale", "Pasadena", "Whittier", "Burbank", "Inglewood", "Culver City", "Pomona", "Lancaster", "Mission Hills"] },
  { name: "San Diego", lat: 32.72, lng: -117.16, zip: 92000, weight: 14,
    cities: ["San Diego", "Chula Vista", "El Cajon", "Escondido", "Oceanside", "National City"] },
  { name: "Orange", lat: 33.78, lng: -117.87, zip: 92600, weight: 12,
    cities: ["Anaheim", "Santa Ana", "Irvine", "Costa Mesa", "Orange", "Fullerton"] },
  { name: "Riverside", lat: 33.95, lng: -117.4, zip: 92500, weight: 9,
    cities: ["Riverside", "Moreno Valley", "Corona", "Temecula", "Hemet"] },
  { name: "San Bernardino", lat: 34.1, lng: -117.3, zip: 92400, weight: 9,
    cities: ["San Bernardino", "Fontana", "Ontario", "Rancho Cucamonga", "Redlands"] },
  { name: "Santa Clara", lat: 37.35, lng: -121.95, zip: 95100, weight: 8,
    cities: ["San Jose", "Santa Clara", "Sunnyvale", "Mountain View", "Palo Alto"] },
  { name: "Alameda", lat: 37.77, lng: -122.24, zip: 94600, weight: 7,
    cities: ["Oakland", "Fremont", "Hayward", "Berkeley", "Pleasanton"] },
  { name: "Sacramento", lat: 38.58, lng: -121.49, zip: 95800, weight: 6,
    cities: ["Sacramento", "Elk Grove", "Folsom", "Citrus Heights"] },
  { name: "Fresno", lat: 36.74, lng: -119.77, zip: 93700, weight: 5,
    cities: ["Fresno", "Clovis", "Sanger", "Reedley"] },
  { name: "Ventura", lat: 34.27, lng: -119.23, zip: 93000, weight: 4,
    cities: ["Ventura", "Oxnard", "Thousand Oaks", "Simi Valley"] },
];

const NAME_PREFIXES = [
  "Brightwood", "Fairhaven", "Greenfield", "Hillcrest", "Lakeside", "Meadowview",
  "Oakmont", "Pinecrest", "Stonebridge", "Westgate", "Evergreen", "Maplewood",
  "Cedarbrook", "Willowbrook", "Sunset", "Highland", "Valley", "Bayview",
  "Northgate", "Silverlake", "Rosewood", "Glenwood", "Eastbrook", "Summit",
];
const NAME_TYPES = [
  "Funeral Home", "Mortuary", "Memorial Chapel", "Cremation Services",
  "Funeral & Cremation", "Memorial Park",
];
const OWNERS = ["Independent", "Independent", "Group A", "Group B", null];

// "Our Mortuaries" licenses are referenced by analytics; give them
// recognizable (but fictional) names in Los Angeles county.
const OUR_MORTUARY_LICENSES = ["48213", "50942", "37165", "61308", "29487", "54720"];
const OUR_MORTUARY_NAMES = [
  "Maplecrest Memorial Mortuary", "Riverbend Memorial Chapel", "Oakhaven Funeral Home",
  "Cedar Hill Mortuary", "Lakeshore Memorial Chapel", "Summit View Mortuary",
];

function weightedCounty() {
  const total = COUNTIES.reduce((s, c) => s + c.weight, 0);
  let r = rand(0, total);
  for (const c of COUNTIES) {
    if (r < c.weight) return c;
    r -= c.weight;
  }
  return COUNTIES[0];
}

function isoDate() {
  const y = randInt(1968, 2021);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── funeral home directory ───────────────────────────────────────────────────
const usedNames = new Set();
function uniqueName(base) {
  let name = base;
  let i = 2;
  while (usedNames.has(name)) name = `${base} ${i++}`;
  usedNames.add(name);
  return name;
}

const fhRows = [];
const TOTAL_FH = 110;
const la = COUNTIES.find((c) => c.name === "Los Angeles");

// "Our Mortuaries" first (fixed licenses, Los Angeles).
OUR_MORTUARY_LICENSES.forEach((lic, i) => {
  const city = pick(la.cities);
  fhRows.push([
    lic,
    uniqueName(OUR_MORTUARY_NAMES[i]),
    city,
    la.name,
    String(la.zip + randInt(1, 998)),
    isoDate(),
    +(la.lat + rand(-0.25, 0.25)).toFixed(6),
    +(la.lng + rand(-0.25, 0.25)).toFixed(6),
    "Independent",
    "Affiliated",
    `${randInt(100, 9999)} ${pick(NAME_PREFIXES)} Ave`,
  ]);
});

// Non-sequential, unique 5-digit license numbers (avoiding the fixed
// "Our Mortuaries" licensed homes above). Deterministic via the seeded RNG.
const usedLicenses = new Set(OUR_MORTUARY_LICENSES);
function nextLicense() {
  let lic;
  do {
    lic = String(randInt(10000, 99999));
  } while (usedLicenses.has(lic));
  usedLicenses.add(lic);
  return lic;
}

while (fhRows.length < TOTAL_FH) {
  const county = weightedCounty();
  const base = `${pick(NAME_PREFIXES)} ${pick(NAME_TYPES)}`;
  fhRows.push([
    nextLicense(),
    uniqueName(base),
    pick(county.cities),
    county.name,
    String(county.zip + randInt(1, 998)),
    isoDate(),
    +(county.lat + rand(-0.3, 0.3)).toFixed(6),
    +(county.lng + rand(-0.3, 0.3)).toFixed(6),
    pick(OWNERS),
    null,
    `${randInt(100, 9999)} ${pick(NAME_PREFIXES)} ${pick(["St", "Ave", "Blvd", "Rd"])}`,
  ]);
}

// ── per-license fiscal-year case data ────────────────────────────────────────
const fyLicRows = [];
for (const fh of fhRows) {
  const lic = fh[0];
  const baseCases = randInt(40, 520);
  FISCAL_YEARS.forEach((fy, idx) => {
    const growth = 1 + (idx - 6) * 0.012 + rand(-0.05, 0.05);
    const cases = Math.max(0, Math.round(baseCases * growth));
    const cremPct = Math.min(0.92, 0.58 + idx * 0.012 + rand(-0.05, 0.05));
    const cremations = Math.round(cases * cremPct);
    const burials = cases - cremations;
    const scattered = Math.round(cremations * rand(0.45, 0.78));
    const hispShare = rand(0.08, 0.32);
    const hispanicCases = Math.round(cases * hispShare);
    const hispCremations = Math.min(
      cremations,
      Math.round(hispanicCases * rand(0.55, 0.85)),
    );
    const hispScattered = Math.min(
      scattered,
      Math.round(hispCremations * rand(0.4, 0.75)),
    );
    fyLicRows.push([
      fy, lic, cases, cremations, burials, scattered,
      hispanicCases, hispCremations, hispScattered,
    ]);
  });
}

// ── monthly data (for the Market Profile tab) ────────────────────────────────
const MONTH_NAMES = [
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
];
const monthlyRows = [];
// Fiscal months FY25 (full) + FY26 (first 7), giving ~19 months of history.
const monthlySpec = [];
MONTH_NAMES.forEach((mn, i) =>
  monthlySpec.push({ label: `${mn}-FY25`, key: `FY25-${String(i + 1).padStart(2, "0")}` }),
);
MONTH_NAMES.slice(0, 7).forEach((mn, i) =>
  monthlySpec.push({ label: `${mn}-FY26`, key: `FY26-${String(i + 1).padStart(2, "0")}` }),
);

for (const fh of fhRows) {
  const lic = fh[0];
  const monthlyBase = randInt(2, 40);
  for (const { label, key } of monthlySpec) {
    const cases = Math.max(0, Math.round(monthlyBase * rand(0.6, 1.4)));
    const crem = Math.round(cases * rand(0.55, 0.82));
    const scattered = Math.round(crem * rand(0.4, 0.75));
    const hCases = Math.round(cases * rand(0.08, 0.3));
    const hCrem = Math.min(crem, Math.round(hCases * rand(0.5, 0.85)));
    const hScattered = Math.min(scattered, Math.round(hCrem * rand(0.4, 0.7)));
    monthlyRows.push([label, key, lic, cases, crem, scattered, hCases, hCrem, hScattered]);
  }
}

// ── statewide trend (independent aggregate) ──────────────────────────────────
const fyTrend = FISCAL_YEARS.map((fy, idx) => {
  const cases =
    fy === "FY26"
      ? Math.round(165000 + idx * 1000) // partial year, smaller
      : Math.round(130000 + idx * 14000 + rand(-4000, 4000));
  const cremPct = +(61 + idx * 0.85 + rand(-0.4, 0.4)).toFixed(1);
  const cremations = Math.round((cases * cremPct) / 100);
  const burials = cases - cremations;
  const scatteredPct = +(67 + idx * 0.5 + rand(-0.3, 0.3)).toFixed(1);
  const scattered = Math.round((cremations * scatteredPct) / 100);
  const hispPct = +(18 + idx * 0.45 + rand(-0.3, 0.3)).toFixed(1);
  const hispanicCases = Math.round((cases * hispPct) / 100);
  return { fy, cases, cremations, burials, scattered, hispanicCases, cremPct, hispPct, scatteredPct };
});

// ── write files ──────────────────────────────────────────────────────────────
const header = (typeName, constName, payload) =>
  `import type { ${typeName} } from "./schema";\n\nexport const ${constName} = ${JSON.stringify(payload)} as const satisfies ${typeName}[];\n`;

// Use plain typed arrays (not `as const`) to keep TS happy with the tuple types.
const writeTyped = (file, typeName, constName, payload) => {
  const body = `import type { ${typeName} } from "./schema";\n\nexport const ${constName}: ${typeName}[] = ${JSON.stringify(payload)};\n`;
  writeFileSync(join(DATA_DIR, file), body);
};

writeTyped("fh-directory.ts", "FhDirRow", "FH_DIR_RAW", fhRows);
writeTyped("fy-license.ts", "FyLicRow", "FY_LIC_RAW", fyLicRows);
writeTyped("monthly.ts", "MonthlyRow", "MONTHLY_RAW", monthlyRows);
writeTyped("fy-trend.ts", "FyTrend", "FY_TREND", fyTrend);

console.log(
  `Wrote: ${fhRows.length} FH, ${fyLicRows.length} FY_LIC, ${monthlyRows.length} monthly, ${fyTrend.length} trend rows`,
);
void header; // unused helper retained for clarity
