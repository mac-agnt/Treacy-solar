"use client";

import { motion } from "framer-motion";
import { springSoft } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function ViewToggle<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-[10px] border border-border bg-bg p-0.5">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={cn(
              "relative rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="view-toggle"
                transition={springSoft}
                className="absolute inset-0 rounded-[8px] bg-surface shadow-[0_1px_0_rgba(15,23,42,0.04)]"
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
