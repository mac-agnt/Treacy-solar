"use client";

import { motion } from "framer-motion";
import { Warning, Lightning, ChartLineUp, Gauge } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { DetailSection } from "@/components/module/Detail";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import {
  WIP_BY_STAGE, AVG_DAYS_IN_STAGE, BOTTLENECK, THROUGHPUT, CAPACITY,
  HANDOFFS_REMOVED,
} from "@/lib/data/ops";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function OpsView() {
  const loading = useSimulatedLoad();
  const maxWip = Math.max(...WIP_BY_STAGE.map((s) => s.count));
  const maxDays = Math.max(...AVG_DAYS_IN_STAGE.map((s) => s.days));

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Ops Health"
        title="Ops Health"
        subtitle="The metrics that were missing beyond the SEAI payout report. When operations is what breaks first, this is where you see it before it does."
        sources={["HubSpot", "Scoop", "SEAI", "Sage"]}
      />

      <StatRow
        stats={[
          { label: "Live projects", value: String(WIP_BY_STAGE.reduce((s, x) => s + x.count, 0)), icon: ChartLineUp },
          { label: "Bottleneck stage", value: `${BOTTLENECK.days}d`, tone: "warning", icon: Warning },
          { label: "Installs / week (avg)", value: String(Math.round(THROUGHPUT.reduce((s, x) => s + x.installs, 0) / THROUGHPUT.length)), icon: Gauge },
          { label: "Manual handoffs removed", value: String(HANDOFFS_REMOVED), tone: "success", icon: Lightning },
        ]}
      />

      <Card className="border-warning/30 bg-warning/[0.06]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-warning/15 text-warning">
            <Warning size={17} weight="fill" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Bottleneck: {BOTTLENECK.stage}. Average {BOTTLENECK.days} days.</p>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">100% of that time is manual re-keying from HubSpot into Scoop. It is the single slowest step in the whole pipeline.</p>
          </div>
        </div>
      </Card>

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <DetailSection title="Work in progress by stage">
              <div className="flex flex-col gap-2.5">
                {WIP_BY_STAGE.map((s, i) => (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-[11.5px] text-ink-muted">{s.stage}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / maxWip) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-[11.5px] font-medium text-ink">{s.count}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </Card>

          <Card>
            <DetailSection title="Average days in stage">
              <div className="flex flex-col gap-2.5">
                {AVG_DAYS_IN_STAGE.map((s, i) => (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-[11.5px] text-ink-muted">{s.stage}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.days / maxDays) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease }}
                        className={cn("h-full rounded-full", s.bottleneck ? "bg-warning" : "bg-accent")}
                      />
                    </div>
                    <span className={cn("w-8 shrink-0 text-right text-[11.5px] font-medium", s.bottleneck ? "text-warning" : "text-ink")}>{s.days}d</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </Card>

          <Card>
            <DetailSection title="Capacity vs committed — next 4 weeks">
              <div className="flex flex-col gap-3">
                {CAPACITY.map((c) => (
                  <div key={c.week} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[11.5px] text-ink-muted">{c.week}</span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-border-soft">
                      <div className="absolute inset-y-0 left-0 rounded-lg bg-accent/20" style={{ width: `${(c.capacity / 12) * 100}%` }} />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.committed / 12) * 100}%` }}
                        transition={{ duration: 0.6, ease }}
                        className="absolute inset-y-0 left-0 rounded-lg bg-accent"
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[11.5px] font-medium text-ink">{c.committed}/{c.capacity}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </Card>

          <Card>
            <DetailSection title="Throughput — installs per week (12 weeks)">
              <div className="flex flex-col gap-2">
                <Sparkline data={THROUGHPUT.map((t) => t.installs)} height={72} />
                <div className="flex items-center justify-between text-[11.5px] text-ink-faint">
                  <span>{THROUGHPUT[0].week}</span>
                  <Badge tone="success">Trending up</Badge>
                  <span>{THROUGHPUT[THROUGHPUT.length - 1].week}</span>
                </div>
              </div>
            </DetailSection>
          </Card>
        </div>
      )}

      <p className="text-[12px] text-ink-faint">
        {HANDOFFS_REMOVED} human re-keying events removed since go-live. The only fix the business had found before this was hiring more people.
      </p>
    </div>
  );
}
