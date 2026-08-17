"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { Card } from "../ui/Card";
import { staggerContainer, fadeUp, ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type Stat = {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  icon?: Icon;
};

const toneText: Record<NonNullable<Stat["tone"]>, string> = {
  neutral: "text-ink",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={fadeUp} transition={{ duration: 0.3, ease }}>
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] text-ink-faint">{stat.label}</p>
                {Icon && (
                  <span className="flex size-8 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                    <Icon size={15} weight="fill" />
                  </span>
                )}
              </div>
              <p className={cn("text-[26px] font-semibold tracking-tight", toneText[stat.tone ?? "neutral"])}>
                {stat.value}
              </p>
              {stat.sub && <p className="text-[12px] text-ink-muted">{stat.sub}</p>}
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
