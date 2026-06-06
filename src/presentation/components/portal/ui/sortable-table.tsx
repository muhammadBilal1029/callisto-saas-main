"use client";

import { useMemo, useState, type ReactNode } from "react";

export type TableCell = {
  display: ReactNode;
  sortValue: number | string;
  className?: string;
};

export type TableRow = {
  cells: TableCell[];
  onClick?: () => void;
  selected?: boolean;
};

type Props = {
  columns: string[];
  rows: TableRow[];
  /** Optional pinned totals row (rendered as-is below the sorted rows). */
  totalsRow?: ReactNode;
};

type SortState = { col: number; dir: "asc" | "desc" } | null;

export function SortableTable({ columns, rows, totalsRow }: Props) {
  const [sort, setSort] = useState<SortState>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a.cells[sort.col]?.sortValue ?? "";
      const bv = b.cells[sort.col]?.sortValue ?? "";
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort]);

  function toggleSort(col: number) {
    setSort((prev) =>
      prev && prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" },
    );
  }

  return (
    <table className="w-full border-collapse bg-white text-[11.5px]">
      <thead>
        <tr>
          {columns.map((label, i) => {
            const active = sort?.col === i;
            const indicator = active
              ? sort?.dir === "asc"
                ? " ↑"
                : " ↓"
              : " ⇅";
            return (
              <th
                key={label}
                onClick={() => toggleSort(i)}
                className={`cursor-pointer select-none whitespace-nowrap border-b-2 px-[10px] py-[9px] text-left text-[9px] font-bold uppercase tracking-[0.8px] hover:bg-[#F5F5F3] hover:text-portal-green ${
                  active
                    ? "border-portal-green text-portal-green"
                    : "border-portal-black text-portal-black"
                }`}
              >
                {label}
                <span className={active ? "opacity-100" : "opacity-35"}>
                  {indicator}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, idx) => (
          <tr
            key={idx}
            onClick={row.onClick}
            className={`border-b border-l-[3px] border-l-transparent border-b-[#F0F0EE] transition-colors hover:!bg-portal-blue-lt hover:border-l-portal-blue ${
              row.selected
                ? "bg-portal-blue-lt"
                : idx % 2 === 1
                  ? "bg-portal-bg-zebra"
                  : "bg-white"
            } ${row.onClick ? "cursor-pointer" : ""}`}
          >
            {row.cells.map((cell, ci) => (
              <td
                key={ci}
                className={`px-[10px] py-2 text-[11px] text-portal-black ${cell.className ?? ""}`}
              >
                {cell.display}
              </td>
            ))}
          </tr>
        ))}
        {totalsRow}
      </tbody>
    </table>
  );
}
