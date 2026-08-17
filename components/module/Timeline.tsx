"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { staggerContainer, fadeUp, ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type TimelineItem = {
  id: string;
  icon: Icon;
  tone: "accent" | "success" | "warning" | "danger" | "neutral";
  title: React.ReactNode;
  meta?: string;
  channel?: string;
};

const toneClass: Record<TimelineItem["tone"], string> = {
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-border-soft text-ink-faint",
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <motion.ol
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="show"
      className="relative flex flex-col gap-4 pl-1"
    >
      <span className="absolute bottom-4 left-[15px] top-2 w-px bg-border-soft" aria-hidden />
      {items.map((event) => {
        const Icon = event.icon;
        return (
          <motion.li
            key={event.id}
            variants={fadeUp}
            transition={{ duration: 0.28, ease }}
            className="relative flex gap-3"
          >
            <span
              className={cn(
                "z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface",
                toneClass[event.tone],
              )}
            >
              <Icon size={14} weight="fill" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-[13px] leading-snug text-ink">{event.title}</p>
              {(event.meta || event.channel) && (
                <p className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-faint">
                  {event.channel && <span className="font-medium text-ink-muted">{event.channel}</span>}
                  {event.meta}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
