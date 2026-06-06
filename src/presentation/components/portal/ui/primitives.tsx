import type { ReactNode } from "react";

export function SectionBanner({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 border border-portal-border border-l-4 border-l-portal-green bg-white px-[18px] py-[14px]">
      <div className="mb-1.5 text-[8.5px] font-bold uppercase tracking-[1.4px] text-portal-green">
        {label}
      </div>
      <h2 className="mb-1 text-[15px] font-bold leading-[1.3] tracking-[-0.2px] text-portal-black">
        {title}
      </h2>
      {children ? (
        <p className="text-[11.5px] leading-[1.55] text-portal-gray">
          {children}
        </p>
      ) : null}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`min-w-0 border border-portal-border bg-white p-[18px] ${className}`}
    >
      {title ? (
        <h2 className="mb-[14px] border-b-2 border-portal-black pb-[7px] text-[10px] font-bold uppercase leading-tight tracking-[0.9px] text-portal-black">
          {title}
        </h2>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mb-7 grid grid-cols-2 gap-px border border-portal-border bg-portal-border sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  subtext,
  valueClassName = "",
}: {
  label: string;
  value: ReactNode;
  subtext?: string;
  valueClassName?: string;
}) {
  return (
    <div className="border-t-[3px] border-portal-green bg-white px-4 py-[18px] transition-colors hover:bg-portal-bg-lt">
      <h3 className="mb-2 text-[9px] font-bold uppercase leading-tight tracking-[1px] text-portal-gray-lt">
        {label}
      </h3>
      <div
        className={`text-[24px] font-bold leading-none tracking-[-0.6px] text-portal-black ${valueClassName}`}
      >
        {value}
      </div>
      {subtext ? (
        <div className="mt-1.5 text-[10px] tracking-[0.2px] text-portal-gray-lt">
          {subtext}
        </div>
      ) : null}
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[18px] flex flex-wrap items-end gap-[14px] border-b border-portal-border py-[10px]">
      {children}
    </div>
  );
}

export function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="whitespace-nowrap text-[9.5px] font-bold uppercase tracking-[0.8px] text-portal-gray">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClasses =
  "min-w-[150px] cursor-pointer rounded-none border border-portal-border bg-white px-[10px] py-[6px] text-[11.5px] text-portal-black outline-none transition-colors focus:border-portal-green";

export function SelectField({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClasses} ${className}`}
    >
      {children}
    </select>
  );
}

export function NumberField({
  value,
  onChange,
  min,
  max,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${fieldClasses} min-w-0 ${className}`}
    />
  );
}
