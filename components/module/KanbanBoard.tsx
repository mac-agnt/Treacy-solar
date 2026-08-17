"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp, ease } from "@/lib/motion";

export type KanbanColumn = { key: string; label: string };

export function KanbanBoard<T>({
  columns,
  items,
  groupKey,
  renderCard,
  cardKey,
  onCardClick,
}: {
  columns: KanbanColumn[];
  items: T[];
  groupKey: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  cardKey: (item: T) => string;
  onCardClick?: (item: T) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-3">
        {columns.map((col) => {
          const colItems = items.filter((it) => groupKey(it) === col.key);
          return (
            <div key={col.key} className="flex w-[264px] shrink-0 flex-col">
              <div className="flex items-center justify-between px-1 pb-2.5">
                <span className="text-[12.5px] font-semibold text-ink">{col.label}</span>
                <span className="rounded-full bg-border-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-faint">
                  {colItems.length}
                </span>
              </div>
              <motion.div
                variants={staggerContainer(0.04)}
                initial="hidden"
                animate="show"
                className="flex min-h-[80px] flex-1 flex-col gap-2.5 rounded-2xl border border-border-soft bg-bg/40 p-2.5"
              >
                {colItems.length === 0 && (
                  <p className="px-1 py-6 text-center text-[11.5px] text-ink-faint">Empty</p>
                )}
                {colItems.map((it) => (
                  <motion.button
                    key={cardKey(it)}
                    variants={fadeUp}
                    transition={{ duration: 0.25, ease }}
                    onClick={onCardClick ? () => onCardClick(it) : undefined}
                    className="w-full rounded-xl border border-border bg-surface p-3 text-left transition-[border-color,box-shadow] duration-200 hover:border-ink-faint/40 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]"
                  >
                    {renderCard(it)}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
