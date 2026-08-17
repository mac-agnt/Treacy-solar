"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft, WhatsappLogo, Phone, EnvelopeSimple, CheckCircle, Lightning,
  CalendarBlank, WarningCircle, SealCheck, FileText, CurrencyEur,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/module/Tabs";
import { KeyValueGrid, DetailSection } from "@/components/module/Detail";
import { Timeline, type TimelineItem } from "@/components/module/Timeline";
import { getProject, ragDot, ragLabel, stageTone } from "@/lib/data/projects";
import { DOCUMENTS, docStatusTone } from "@/lib/data/documents";
import { PAYMENTS } from "@/lib/data/payments";
import { GRANTS } from "@/lib/data/compliance";
import { euro, kwp, ddmmyyyy, daysAgo } from "@/lib/data/format";
import { staggerContainer, fadeUp, ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "bom", label: "Quote & BOM" },
  { key: "documents", label: "Documents" },
  { key: "schedule", label: "Schedule" },
  { key: "compliance", label: "Compliance" },
  { key: "comms", label: "Comms" },
  { key: "payments", label: "Payments" },
];

export function ProjectDetail({ id }: { id: string }) {
  const project = getProject(id);
  const [tab, setTab] = useState("overview");
  const [created, setCreated] = useState(false);

  if (!project) return null;
  const p = project;
  const isHandoff = p.stage === "Contract Signed";
  const docs = DOCUMENTS.filter((d) => d.projectId === p.id);
  const payment = PAYMENTS.find((x) => x.projectId === p.id);
  const grant = GRANTS.find((g) => g.projectId === p.id);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <CaretLeft size={14} /> Projects
      </Link>

      <header className="flex flex-col gap-4 border-b border-border-soft pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-[15px] font-semibold text-accent-strong">
            {p.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{p.customer}</h1>
              <span className={cn("inline-block size-2.5 rounded-full", ragDot[p.rag])} aria-label={ragLabel[p.rag]} />
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              {p.ref} · {p.town}, {p.county}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={stageTone(p.stage)}>{p.stage}</Badge>
          <Badge tone="neutral">{euro(p.value)}</Badge>
        </div>
      </header>

      {isHandoff && <CreateProjectPanel created={created} onCreate={() => setCreated(true)} project={p} />}

      <Tabs tabs={TABS} active={tab} onChange={setTab} idPrefix="project" />

      <div>
        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <DetailSection title="Customer & property">
                <KeyValueGrid
                  items={[
                    { label: "Customer", value: p.customer },
                    { label: "Owner", value: p.owner },
                    { label: "Address", value: p.address },
                    { label: "Eircode", value: p.eircode },
                    {
                      label: "MPRN",
                      value: p.mprnValid ? p.mprn : `${p.mprn} · invalid`,
                      tone: p.mprnValid ? "default" : "danger",
                    },
                    { label: "BER", value: p.ber },
                    { label: "Roof type", value: p.roofType },
                    { label: "Days in stage", value: `${p.daysInStage} · ${ragLabel[p.rag]}` },
                  ]}
                />
              </DetailSection>
            </Card>
            <Card>
              <DetailSection title="System specification">
                <KeyValueGrid
                  items={[
                    { label: "System size", value: kwp(p.systemKwp) },
                    { label: "Panels", value: `${p.panelCount} × ${p.panelWatt}W` },
                    { label: "Inverter", value: p.inverter },
                    { label: "Battery", value: p.batteryKwh > 0 ? `${p.batteryKwh} kWh` : "None" },
                    { label: "Project value", value: euro(p.value) },
                    { label: "SEAI grant", value: p.grantValue > 0 ? euro(p.grantValue) : "N/A" },
                  ]}
                />
              </DetailSection>
            </Card>
          </div>
        )}

        {tab === "bom" && (
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-border-soft">
                    {["Line item", "Qty", "Unit price", "Total"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint",
                          i > 0 && "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.bom.map((line) => (
                    <tr key={line.item} className="border-b border-border-soft last:border-0">
                      <td className="px-5 py-3.5 text-[13px] text-ink">{line.item}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-ink-muted">
                        {line.qty} {line.unit}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-ink-muted">{euro(line.unitPrice)}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-medium text-ink">{euro(line.total)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="px-5 py-3.5 text-right text-[13px] font-semibold text-ink">
                      Quote total
                    </td>
                    <td className="px-5 py-3.5 text-right text-[14px] font-semibold text-ink">{euro(p.value)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "documents" && (
          <Card className="p-0">
            {docs.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-ink-faint">No documents raised yet.</p>
            ) : (
              <div className="divide-y divide-border-soft">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    <FileText size={16} className="shrink-0 text-ink-faint" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{d.type}</p>
                      <p className="text-[11.5px] text-ink-faint">
                        {d.status === "Signed" ? "Settled" : `${d.daysOutstanding}d outstanding · ${d.channel}`}
                      </p>
                    </div>
                    <Badge tone={docStatusTone[d.status]}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "schedule" && (
          <Card>
            {p.installDate ? (
              <KeyValueGrid
                items={[
                  { label: "Install date", value: ddmmyyyy(p.installDate) },
                  { label: "Assigned crew", value: p.crew ?? "—" },
                  { label: "System", value: `${kwp(p.systemKwp)} · ${p.panelCount} panels` },
                  { label: "Status", value: <Badge tone="accent">{p.stage}</Badge> },
                ]}
              />
            ) : (
              <div className="flex items-center gap-3 py-2 text-[13px] text-ink-muted">
                <CalendarBlank size={18} className="text-ink-faint" />
                Not scheduled yet. A slot is assigned once the project is created and materials are confirmed.
              </div>
            )}
          </Card>
        )}

        {tab === "compliance" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-2">
              <p className="text-[12px] text-ink-faint">SEAI grant</p>
              {grant ? <Badge tone="accent">{grant.stage}</Badge> : <span className="text-[13px] text-ink-muted">Not started</span>}
              {p.grantValue > 0 && <p className="text-[13px] font-medium text-ink">{euro(p.grantValue)}</p>}
            </Card>
            <Card className="flex flex-col gap-2">
              <p className="text-[12px] text-ink-faint">DSB permit</p>
              <Badge tone={p.stageIndex >= 6 ? "success" : "neutral"}>
                {p.stageIndex >= 8 ? "Registered" : p.stageIndex >= 6 ? "Pending" : "Not submitted"}
              </Badge>
            </Card>
            <Card className="flex flex-col gap-2">
              <p className="text-[12px] text-ink-faint">MPRN check</p>
              <Badge tone={p.mprnValid ? "success" : "danger"}>{p.mprnValid ? "11-digit OK" : "Invalid format"}</Badge>
              <p className="font-mono text-[12px] text-ink-muted">{p.mprn}</p>
            </Card>
          </div>
        )}

        {tab === "comms" && <Card><Timeline items={commsFor(p.id, p.customer)} /></Card>}

        {tab === "payments" && (
          <Card>
            {payment ? (
              <div className="flex flex-col gap-4">
                <KeyValueGrid
                  items={[
                    { label: "Project value", value: euro(payment.value) },
                    { label: "Deposit (50%)", value: `${euro(payment.deposit)} · ${p.depositPaid ? "Paid" : "Due"}` },
                    { label: "Balance (50%)", value: `${euro(payment.balance)} · ${p.balancePaid ? "Paid" : "Due"}` },
                    { label: "Grant offset", value: payment.grantOffset > 0 ? euro(payment.grantOffset) : "N/A" },
                  ]}
                />
                <div className="flex items-center gap-2 text-[12px] text-ink-faint">
                  <CurrencyEur size={14} /> Sage sync: {payment.sage}
                </div>
              </div>
            ) : (
              <p className="py-2 text-[13px] text-ink-muted">No invoice raised yet.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// The single most important interaction in the build.
function CreateProjectPanel({
  created,
  onCreate,
  project,
}: {
  created: boolean;
  onCreate: () => void;
  project: ReturnType<typeof getProject>;
}) {
  const p = project!;
  const fields: { label: string; value: string }[] = [
    { label: "Customer name", value: p.customer },
    { label: "Address", value: p.address },
    { label: "Eircode", value: p.eircode },
    { label: "MPRN", value: p.mprn },
    { label: "BER rating", value: p.ber },
    { label: "Roof type", value: p.roofType },
    { label: "System size", value: kwp(p.systemKwp) },
    { label: "Panel count", value: `${p.panelCount} × ${p.panelWatt}W` },
    { label: "Inverter", value: p.inverter },
    { label: "Battery", value: p.batteryKwh > 0 ? `${p.batteryKwh} kWh` : "None" },
    { label: "Project value", value: euro(p.value) },
    { label: "Deposit due", value: euro(Math.round(p.value * 0.5)) },
    { label: "SEAI grant", value: euro(p.grantValue) },
    { label: "Materials list", value: `${p.bom.length} lines from quote` },
    { label: "DSB permit", value: "Queued" },
    { label: "Suggested crew", value: p.crew ?? "Crew B" },
    { label: "Owner", value: p.owner },
  ];

  return (
    <Card className="border-accent/30 bg-accent-soft/40">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-accent-ink">
            <Lightning size={17} weight="fill" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-ink">Contract signed — ready for Scoop</p>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">
              Today this is where a person copies 17 fields from HubSpot into Scoop by hand. That step is the delay,
              and it is where a wrong MPRN gets typed.
            </p>
          </div>
          {!created && (
            <Button variant="primary" size="sm" onClick={onCreate} className="shrink-0">
              Create Project
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {created && (
            <motion.div
              key="populated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              <motion.div
                variants={staggerContainer(0.055)}
                initial="hidden"
                animate="show"
                className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2"
              >
                {fields.map((f) => (
                  <motion.div
                    key={f.label}
                    variants={fadeUp}
                    transition={{ duration: 0.28, ease }}
                    className="flex items-center justify-between gap-3 border-b border-border-soft/70 pb-1.5"
                  >
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <CheckCircle size={13} weight="fill" className="text-success" />
                      {f.label}
                    </span>
                    <span className="truncate text-[12.5px] font-medium text-ink">{f.value}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 1.15 }}
                className="rounded-[12px] border border-success/30 bg-success/[0.08] px-4 py-3.5"
              >
                <p className="text-[13.5px] font-semibold text-ink">
                  17 fields written. 0 keystrokes. 0 chance of a wrong MPRN.
                </p>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Materials, customer details, MPRN and a suggested crew all pulled from the quotation. Today this
                  takes an admin 3.4 days and a person&apos;s full attention.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

function commsFor(id: string, customer: string): TimelineItem[] {
  const first = customer.split(" ")[0];
  return [
    {
      id: `${id}-1`,
      icon: WhatsappLogo,
      tone: "success",
      channel: "WhatsApp",
      title: `${first} confirmed they are happy to proceed and asked about install timing.`,
      meta: ddmmyyyy(daysAgo(1)),
    },
    {
      id: `${id}-2`,
      icon: Phone,
      tone: "accent",
      channel: "Aircall",
      title: `Outbound call logged — 4m 12s. Walked through the signed contract and deposit.`,
      meta: ddmmyyyy(daysAgo(2)),
    },
    {
      id: `${id}-3`,
      icon: EnvelopeSimple,
      tone: "neutral",
      channel: "Email",
      title: `Signed contract received and countersigned.`,
      meta: ddmmyyyy(daysAgo(3)),
    },
    {
      id: `${id}-4`,
      icon: SealCheck,
      tone: "accent",
      channel: "HubSpot",
      title: `Lead round-robined to owner and quotation issued.`,
      meta: ddmmyyyy(daysAgo(9)),
    },
    {
      id: `${id}-5`,
      icon: WarningCircle,
      tone: "warning",
      channel: "WhatsApp",
      title: `${first} asked whether a battery could be added before install.`,
      meta: ddmmyyyy(daysAgo(11)),
    },
  ];
}
