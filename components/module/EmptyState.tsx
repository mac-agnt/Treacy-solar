"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { fadeUp, ease } from "@/lib/motion";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: Icon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.35, ease }}
      className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center"
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Icon size={24} weight="fill" />
      </div>
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-ink-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
