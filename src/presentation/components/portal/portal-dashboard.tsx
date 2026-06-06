"use client";

import { useState } from "react";
import Link from "next/link";
import { OurMortuariesTab } from "./tabs/our-mortuaries-tab";
import { MarketProfileTab } from "./tabs/market-profile-tab";
import { MarketShareChangesTab } from "./tabs/market-share-changes-tab";
import { CountyStatisticsTab } from "./tabs/county-statistics-tab";
import { StateStatisticsTab } from "./tabs/state-statistics-tab";

const TABS = [
  { id: "our-mortuaries", label: "Our Mortuaries", Component: OurMortuariesTab },
  { id: "profile", label: "Market Profile", Component: MarketProfileTab },
  { id: "comparison", label: "Market Share Changes", Component: MarketShareChangesTab },
  { id: "county", label: "County Statistics", Component: CountyStatisticsTab },
  { id: "statewide", label: "State Statistics", Component: StateStatisticsTab },
] as const;

export function PortalDashboard() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("our-mortuaries");

  return (
    <div className="min-h-screen bg-white font-sans text-[13px] text-portal-black">
      <PortalHeader />
      <PortalTabs active={active} onSelect={setActive} />

      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
        {TABS.map(({ id, Component }) => (
          <div key={id} className={id === active ? "block" : "hidden"}>
            <Component />
          </div>
        ))}
      </div>

      <footer className="mt-8 border-t border-portal-border px-4 py-[18px] text-center text-[9.5px] font-semibold uppercase tracking-[1px] text-portal-gray-lt md:px-8">
        Data Current Through: January 2026
      </footer>
    </div>
  );
}

function PortalHeader() {
  return (
    <header className="sticky top-0 z-[100] flex min-h-[70px] flex-wrap items-center justify-between gap-3 border-b-[3px] border-portal-green bg-white px-4 md:px-8">
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border border-portal-border bg-white px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.7px] text-portal-gray transition-colors hover:border-portal-green hover:text-portal-green-dk"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Menu
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="38"
          height="38"
          className="shrink-0"
        >
          <rect x="5" y="5" width="90" height="90" fill="#f4845f" />
          <rect x="27" y="27" width="46" height="46" fill="#fff" />
          <rect x="38" y="38" width="24" height="24" fill="#f4845f" />
        </svg>
        <div className="text-[0.55rem] font-semibold uppercase leading-none tracking-[1.6px] text-portal-gray-lt">
          Callisto Research
        </div>
      </div>
      <div className="flex-1 text-center">
        <div className="mb-[3px] text-[9px] font-semibold uppercase tracking-[1.2px] text-portal-gray-lt">
          Demo Group
        </div>
        <h1 className="text-[18px] font-bold leading-[1.15] tracking-[-0.5px] text-portal-black">
          Market Analysis Dashboard
        </h1>
      </div>
      <div className="whitespace-nowrap text-right text-[9px] font-semibold uppercase tracking-[1.2px] text-portal-gray-lt">
        Sample Performance Dashboard
      </div>
    </header>
  );
}

function PortalTabs({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: (typeof TABS)[number]["id"]) => void;
}) {
  return (
    <div className="sticky top-[70px] z-[90] flex overflow-x-auto border-b border-portal-border bg-white px-4 md:px-8">
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`-mb-px whitespace-nowrap border-b-[3px] px-5 py-[13px] text-[11px] uppercase tracking-[0.5px] transition-colors ${
              isActive
                ? "border-portal-blue font-bold text-portal-blue"
                : "border-transparent font-medium text-portal-gray-lt hover:border-portal-border hover:bg-portal-bg-lt hover:text-portal-black"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
