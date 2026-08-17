"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, Plus, CheckCircle, CalendarBlank, Wrench } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { KeyValueGrid, DetailSection } from "@/components/module/Detail";
import { getProperty } from "@/lib/data/properties";
import { measure, type MeasureName } from "@/lib/data/measures";
import { euro } from "@/lib/data/format";
import { ease } from "@/lib/motion";

export function PropertyDetail({ id }: { id: string }) {
  const property = getProperty(id);
  const [added, setAdded] = useState<MeasureName | null>(null);

  if (!property) return null;
  const p = property;
  const chosen = added ? measure(added) : null;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Link href="/properties" className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink">
        <CaretLeft size={14} /> Properties
      </Link>

      <header className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-[15px] font-semibold text-accent-strong">{p.initials}</span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{p.owner}</h1>
            <p className="mt-1 text-[13px] text-ink-muted">{p.address}, {p.county}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{p.installed.length} measures</Badge>
          <Badge tone="success">{euro(p.ltv)} LTV</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <DetailSection title="Property record">
            <KeyValueGrid
              items={[
                { label: "Eircode", value: p.eircode },
                { label: "MPRN", value: p.mprn },
                { label: "BER before", value: p.berBefore },
                { label: "BER after", value: p.berAfter },
                { label: "Grant drawn", value: euro(p.grantDrawn) },
                { label: "Total spend", value: euro(p.totalSpend) },
              ]}
            />
          </DetailSection>
        </Card>

        <Card>
          <DetailSection title="Measures installed">
            <div className="flex flex-col divide-y divide-border-soft">
              {p.installed.map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} weight="fill" className="text-success" />
                    <div>
                      <p className="text-[13px] font-medium text-ink">{m.name}</p>
                      <p className="text-[11.5px] text-ink-faint">{m.date}</p>
                    </div>
                  </div>
                  <span className="text-[12.5px] text-ink-muted">{euro(m.grant)} grant</span>
                </div>
              ))}
            </div>
          </DetailSection>
        </Card>
      </div>

      <Card>
        <DetailSection title="Eligible measures">
          <div className="flex flex-wrap gap-2">
            {p.eligible.map((name) => (
              <Button key={name} variant="secondary" size="sm" onClick={() => setAdded(name)}>
                <Plus size={13} /> Add measure — {name}
              </Button>
            ))}
            {p.eligible.length === 0 && <p className="text-[13px] text-ink-muted">Every catalogue measure is installed.</p>}
          </div>

          <AnimatePresence mode="wait">
            {chosen && (
              <motion.div
                key={chosen.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="mt-4 rounded-[12px] border border-accent/30 bg-accent-soft/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{chosen.name}</Badge>
                  <span className="text-[12.5px] text-ink-muted">added to this property</span>
                </div>
                <div className="mt-3">
                  <KeyValueGrid
                    cols={2}
                    items={[
                      { label: "Grant scheme", value: chosen.scheme },
                      { label: "Grant value", value: euro(chosen.grant) },
                      { label: "Required trade", value: <span className="inline-flex items-center gap-1.5"><Wrench size={13} className="text-ink-faint" />{chosen.trade}</span> },
                      { label: "Typical duration", value: `${chosen.durationDays} day${chosen.durationDays > 1 ? "s" : ""}` },
                    ]}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-border-soft bg-surface px-3 py-2.5 text-[12.5px] text-ink">
                  <CalendarBlank size={15} className="text-accent-strong" />
                  Provisional slot dropped into the Scheduler. Same customer, same platform, new trade and new grant scheme — no rebuild.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DetailSection>
      </Card>
    </div>
  );
}
