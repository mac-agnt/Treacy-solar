"use client";

import { motion } from "framer-motion";
import { springSoft } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  active,
  onChange,
  idPrefix = "tab",
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  idPrefix?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border-soft">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              isActive ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold",
                    isActive ? "bg-accent-soft text-accent-strong" : "bg-border-soft text-ink-faint",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <motion.span
                layoutId={`${idPrefix}-underline`}
                transition={springSoft}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
