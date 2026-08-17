"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlass, CaretLeft, CaretRight, ArrowsDownUp } from "@phosphor-icons/react";
import { Select } from "../ui/Select";
import { cn } from "@/lib/cn";
import { fadeUp, ease } from "@/lib/motion";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: T) => React.ReactNode;
};

export type FilterDef<T> = {
  key: string;
  label: string;
  options: string[];
  value: (row: T) => string;
};

export type SortDef<T> = {
  key: string;
  label: string;
  value: (row: T) => number | string;
  dir?: "asc" | "desc";
};

export function DataList<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Search...",
  filters = [],
  sorts = [],
  pageSize = 12,
  onRowClick,
  emptyLabel = "Nothing matches those filters.",
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: FilterDef<T>[];
  sorts?: SortDef<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string>(sorts[0]?.key ?? "");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((row) => {
      if (q && !searchText(row).toLowerCase().includes(q)) return false;
      for (const f of filters) {
        const v = filterValues[f.key];
        if (v && v !== "All" && f.value(row) !== v) return false;
      }
      return true;
    });
    const sort = sorts.find((s) => s.key === sortKey);
    if (sort) {
      const dir = sort.dir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = sort.value(a);
        const bv = sort.value(b);
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
    return out;
  }, [rows, query, filterValues, sortKey, filters, sorts, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function updateFilter(key: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative flex h-9 min-w-0 flex-1 items-center sm:max-w-xs">
          <MagnifyingGlass size={15} className="pointer-events-none absolute left-3 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-[10px] border border-border bg-bg pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>

        {filters.map((f) => (
          <Select
            key={f.key}
            aria-label={f.label}
            value={filterValues[f.key] ?? "All"}
            onChange={(e) => updateFilter(f.key, e.target.value)}
          >
            <option value="All">{f.label}: All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        ))}

        {sorts.length > 0 && (
          <div className="flex items-center gap-1.5">
            <ArrowsDownUp size={14} className="text-ink-faint" />
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Sort by">
              {sorts.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        <span className="text-[12px] text-ink-faint sm:ml-auto">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <MagnifyingGlass size={22} className="mb-3 text-ink-faint" />
          <p className="text-[13px] text-ink-muted">{emptyLabel}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-soft">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint",
                      alignClass[c.align ?? "left"],
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <motion.tr
                  key={rowKey(row)}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.25, ease, delay: Math.min(i * 0.015, 0.2) }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border-soft last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-border-soft/50",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-5 py-3.5 text-[13px] text-ink align-middle",
                        alignClass[c.align ?? "left"],
                        c.className,
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-ink-faint">
            Page {safePage + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="flex size-8 items-center justify-center rounded-[8px] border border-border text-ink-muted transition-colors hover:bg-border-soft hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <CaretLeft size={14} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage >= totalPages - 1}
              className="flex size-8 items-center justify-center rounded-[8px] border border-border text-ink-muted transition-colors hover:bg-border-soft hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
