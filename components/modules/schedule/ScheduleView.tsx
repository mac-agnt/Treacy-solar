"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarBlank, X, Path, PaperPlaneTilt, Package, WarningCircle } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { ViewToggle } from "@/components/module/ViewToggle";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Toast } from "@/components/module/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { JOBS, CREW_ROWS, WEEKDAYS, STANDBY, type Job } from "@/lib/data/schedule";
import { kwp } from "@/lib/data/format";
import { fadeUp, ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function ScheduleView() {
  const loading = useSimulatedLoad();
  const [week, setWeek] = useState<"0" | "1" | "2">("0");
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [openSlot, setOpenSlot] = useState<{ crew: string; discipline: string; day: number } | null>(null);
  const [toast, setToast] = useState("");
  const w = Number(week);

  function cancelJob(job: Job) {
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    setOpenSlot({ crew: job.crew, discipline: job.discipline, day: job.day });
  }

  function backfill(customer: string) {
    setOpenSlot(null);
    setToast(`Slot backfilled with ${customer}. Both customers messaged via WhatsApp. Crew lead notified.`);
  }

  const matched = [...STANDBY].sort((a, b) => b.bomMatch - a.bomMatch).slice(0, 3);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Install Scheduler & Crew Board"
        title="Schedule"
        subtitle="The week's installs across every crew. When a job cancels, the standby list surfaces the customers whose materials already match — so a gap gets filled the same day."
        sources={["Scoop", "WhatsApp", "Stock Control"]}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle
              options={[
                { key: "0", label: "This week" },
                { key: "1", label: "Week 2" },
                { key: "2", label: "Week 3" },
              ]}
              value={week}
              onChange={setWeek}
            />
            <Button variant="primary" size="sm" onClick={() => setToast("Week published to 6 crew leads via WhatsApp. Vans load Monday.")}>
              <PaperPlaneTilt size={14} /> Publish week
            </Button>
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-border-soft">
                  <th className="sticky left-0 z-10 bg-surface px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                    Crew
                  </th>
                  {WEEKDAYS.map((d) => (
                    <th key={d} className="px-3 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CREW_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border-soft last:border-0">
                    <td className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-[12px] font-medium text-ink whitespace-nowrap">
                      <span className={cn("mr-1.5 inline-block size-2 rounded-full", row.discipline === "Electrical" ? "bg-accent" : "bg-warning")} />
                      {row.label}
                    </td>
                    {WEEKDAYS.map((_, day) => {
                      const cellJobs = jobs.filter(
                        (j) => j.week === w && j.crew === row.crew && j.discipline === row.discipline && j.day === day,
                      );
                      const isOpen =
                        openSlot?.crew === row.crew && openSlot?.discipline === row.discipline && openSlot?.day === day;
                      return (
                        <td key={day} className="px-2 py-2 align-top">
                          <AnimatePresence mode="popLayout">
                            {cellJobs.map((job) => (
                              <motion.div
                                key={job.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25, ease }}
                                className="group relative mb-1.5 rounded-lg border border-border bg-bg p-2 last:mb-0"
                              >
                                <button
                                  onClick={() => cancelJob(job)}
                                  aria-label="Cancel job"
                                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md text-ink-faint opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                                >
                                  <X size={11} />
                                </button>
                                <p className="pr-4 text-[11.5px] font-medium leading-tight text-ink">{job.customer}</p>
                                <p className="text-[10.5px] text-ink-faint">{job.county} · {kwp(job.kwp)}</p>
                                <p className="mt-1 text-[10px] text-ink-faint">{job.lead.split(" ")[0]}</p>
                                <div className="mt-1 flex items-center gap-1">
                                  {job.materialsReady ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-success">
                                      <Package size={9} weight="fill" /> Ready
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-[9.5px] font-medium text-warning">
                                      <WarningCircle size={9} weight="fill" /> Short
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-0.5 text-[9.5px] text-ink-faint">
                                    <Path size={9} /> {job.travelMins}m
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="rounded-lg border border-dashed border-danger/40 bg-danger/[0.05] p-2 text-center text-[10.5px] font-medium text-danger"
                            >
                              Open slot
                            </motion.div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3">
            <Card className="p-0">
              <div className="border-b border-border-soft px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">Standby list</p>
                <p className="text-[11.5px] text-ink-faint">
                  {openSlot ? "Matched to the open slot by BOM" : "Customers ready to take a cancellation"}
                </p>
              </div>
              <div className="flex flex-col divide-y divide-border-soft">
                {(openSlot ? matched : STANDBY).map((s) => (
                  <motion.div
                    key={s.projectId}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ duration: 0.25, ease }}
                    className="flex flex-col gap-1.5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12.5px] font-medium text-ink">{s.customer}</p>
                      <Badge tone={s.bomMatch >= 90 ? "success" : "warning"}>{s.bomMatch}%</Badge>
                    </div>
                    <p className="text-[11px] text-ink-faint">{s.county} · {kwp(s.kwp)}</p>
                    {openSlot && (
                      <>
                        <p className="text-[11px] text-ink-muted">{s.note}</p>
                        <Button variant="secondary" size="sm" className="mt-1 w-full" onClick={() => backfill(s.customer)}>
                          Backfill slot
                        </Button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
            {openSlot && (
              <p className="px-1 text-[11.5px] text-ink-faint">
                Cancel a job on the grid and the closest BOM matches jump to the top — materials already in the van.
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-[12px] text-ink-faint">
        <CalendarBlank size={13} className="mr-1 inline align-[-2px]" />
        6 crews · crews get their week on Monday and load their own vans. Backfilling a cancellation used to mean phoning around.
      </p>

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}
