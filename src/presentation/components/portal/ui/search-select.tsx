"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SearchSelect({
  value,
  options,
  placeholder = "All Establishments",
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return options
      .filter((o) => !term || o.toLowerCase().includes(term))
      .slice(0, 100);
  }, [options, query]);

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapRef} className="relative min-w-[250px]">
      <input
        type="text"
        value={open ? query : value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full rounded-none border border-portal-border bg-white px-[10px] py-[6px] pr-[26px] text-[11.5px] text-portal-black outline-none focus:border-portal-green"
      />
      {value ? (
        <span
          onClick={() => select("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-[14px] text-portal-gray-lt"
        >
          ×
        </span>
      ) : null}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-[1000] max-h-[250px] overflow-y-auto border border-t-0 border-portal-border bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
          <Option
            label="All Establishments"
            selected={value === ""}
            onClick={() => select("")}
          />
          {filtered.map((name) => (
            <Option
              key={name}
              label={name}
              selected={value === name}
              onClick={() => select(name)}
            />
          ))}
          {filtered.length === 0 && query ? (
            <div className="border-b border-portal-border-lt px-[10px] py-[7px] text-[11.5px] italic text-portal-gray-lt">
              No matches found
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Option({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-b border-portal-border-lt px-[10px] py-[7px] text-[11.5px] hover:bg-portal-blue-lt hover:text-portal-blue ${
        selected
          ? "bg-[#E7EAFE] font-bold text-[#3730A3]"
          : "text-portal-black"
      }`}
    >
      {label}
    </div>
  );
}
