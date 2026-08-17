"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/Badge";
import { fadeUp, ease } from "@/lib/motion";
import type { SourceKey } from "@/lib/data/sources";

export function ModuleHeader({
  eyebrow,
  title,
  subtitle,
  sources,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  sources?: SourceKey[];
  actions?: React.ReactNode;
}) {
  return (
    <motion.header
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.35, ease }}
      className="flex flex-col gap-4 border-b border-border-soft pb-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {sources && sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-faint">Data flows from</span>
          {sources.map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
        </div>
      )}
    </motion.header>
  );
}
