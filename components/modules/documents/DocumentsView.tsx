"use client";

import { useMemo, useState } from "react";
import { FileText, Lightning, WhatsappLogo, EnvelopeSimple, Clock, PaperPlaneTilt } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { StatRow } from "@/components/module/StatTile";
import { Drawer } from "@/components/module/Drawer";
import { Timeline, type TimelineItem } from "@/components/module/Timeline";
import { Toast } from "@/components/module/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { KeyValueGrid } from "@/components/module/Detail";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { DOCUMENTS, DOC_TYPES, docStatusTone, type DocRecord } from "@/lib/data/documents";

function ageBucket(d: DocRecord): string {
  if (d.status === "Signed") return "Settled";
  if (d.daysOutstanding >= 10) return "10+ days";
  if (d.daysOutstanding >= 5) return "5–9 days";
  return "0–4 days";
}

export function DocumentsView() {
  const loading = useSimulatedLoad();
  const [rows, setRows] = useState<DocRecord[]>(DOCUMENTS);
  const [selected, setSelected] = useState<DocRecord | null>(null);
  const [toast, setToast] = useState("");

  const outstanding = rows.filter((d) => d.status !== "Signed").length;
  const overdue = rows.filter((d) => d.status === "Overdue").length;
  const owners = useMemo(() => Array.from(new Set(DOCUMENTS.map((d) => d.owner))).sort(), []);

  function chaseAll() {
    const count = rows.filter((d) => d.status === "Overdue").length;
    if (count === 0) return;
    const customers = new Set(rows.filter((d) => d.status === "Overdue").map((d) => d.customer)).size;
    setRows((prev) =>
      prev.map((d) =>
        d.status === "Overdue"
          ? { ...d, status: "Sent", chasesSent: d.chasesSent + 1, daysOutstanding: 0, nextChase: "Day 2" }
          : d,
      ),
    );
    setToast(`${customers} customers chased via WhatsApp + email. Logged to HubSpot. 4 seconds.`);
  }

  const columns: Column<DocRecord>[] = [
    {
      key: "type",
      header: "Document",
      render: (d) => (
        <div className="flex items-center gap-3">
          <FileText size={16} className="shrink-0 text-ink-faint" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{d.type}</p>
            <p className="truncate text-[11.5px] text-ink-faint">{d.ref}</p>
          </div>
        </div>
      ),
    },
    { key: "customer", header: "Customer", render: (d) => <span className="text-ink-muted">{d.customer}</span> },
    { key: "status", header: "Status", render: (d) => <Badge tone={docStatusTone[d.status]}>{d.status}</Badge> },
    {
      key: "days",
      header: "Outstanding",
      align: "right",
      render: (d) => (d.status === "Signed" ? <span className="text-ink-faint">—</span> : `${d.daysOutstanding}d`),
    },
    { key: "chases", header: "Chases", align: "right", render: (d) => d.chasesSent },
    {
      key: "next",
      header: "Next auto-chase",
      render: (d) =>
        d.nextChase ? (
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Clock size={13} className="text-ink-faint" />
            {d.nextChase}
          </span>
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
  ];

  const filters: FilterDef<DocRecord>[] = [
    { key: "status", label: "Status", options: ["Draft", "Sent", "Viewed", "Signed", "Overdue"], value: (d) => d.status },
    { key: "type", label: "Type", options: [...DOC_TYPES], value: (d) => d.type },
    { key: "owner", label: "Owner", options: owners, value: (d) => d.owner },
    { key: "age", label: "Age", options: ["0–4 days", "5–9 days", "10+ days", "Settled"], value: ageBucket },
  ];

  const sorts: SortDef<DocRecord>[] = [
    { key: "days", label: "Days outstanding", value: (d) => d.daysOutstanding, dir: "desc" },
    { key: "chases", label: "Chases sent", value: (d) => d.chasesSent, dir: "desc" },
    { key: "customer", label: "Customer (A–Z)", value: (d) => d.customer, dir: "asc" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Document Engine & Signature Chase"
        title="Documents"
        subtitle="Generate from templates, send over WhatsApp or email, and let the system chase every unsigned document so nobody has to keep a list in their head."
        sources={["HubSpot", "WhatsApp", "Aircall", "Sage"]}
        actions={
          <Button variant="primary" size="sm" onClick={chaseAll}>
            <Lightning size={15} weight="fill" /> Chase all overdue
          </Button>
        }
      />

      <StatRow
        stats={[
          { label: "Outstanding", value: String(outstanding), icon: FileText },
          { label: "Overdue", value: String(overdue), tone: overdue > 0 ? "danger" : "success", icon: Clock },
          { label: "Chased via WhatsApp", value: String(rows.filter((d) => d.channel === "WhatsApp").length) },
          { label: "Auto-chase cadence", value: "Day 2 / 5 / 9" },
        ]}
      />

      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : (
        <DataList
          rows={rows}
          columns={columns}
          rowKey={(d) => d.id}
          searchText={(d) => `${d.type} ${d.customer} ${d.ref}`}
          searchPlaceholder="Search document, customer or ref..."
          filters={filters}
          sorts={sorts}
          onRowClick={setSelected}
        />
      )}

      <p className="text-[12px] text-ink-faint">
        Document creation and chasing were named as the two biggest time sinks. Chasing 9 overdue documents by hand is
        a morning&apos;s work; here it is one click.
      </p>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={selected?.customer}
        title={selected?.type ?? ""}
        actions={selected && <Badge tone={docStatusTone[selected.status]}>{selected.status}</Badge>}
      >
        {selected && (
          <div className="flex flex-col gap-6">
            <KeyValueGrid
              items={[
                { label: "Project", value: selected.ref },
                { label: "Channel", value: selected.channel === "WhatsApp" ? "WhatsApp" : "Email" },
                { label: "Owner", value: selected.owner },
                { label: "Days outstanding", value: selected.status === "Signed" ? "—" : `${selected.daysOutstanding}d` },
                { label: "Chases sent", value: String(selected.chasesSent) },
                { label: "Next auto-chase", value: selected.nextChase ?? "—" },
              ]}
            />
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-ink">Chase history</h3>
              <Timeline items={docTimeline(selected)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm"><PaperPlaneTilt size={14} /> Chase now</Button>
              <Button variant="ghost" size="sm">Set cadence</Button>
            </div>
          </div>
        )}
      </Drawer>

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function docTimeline(d: DocRecord): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      id: `${d.id}-gen`,
      icon: FileText,
      tone: "neutral",
      channel: "HubSpot",
      title: `${d.type} generated from template.`,
    },
  ];
  if (d.status !== "Draft") {
    items.unshift({
      id: `${d.id}-sent`,
      icon: d.channel === "WhatsApp" ? WhatsappLogo : EnvelopeSimple,
      tone: "accent",
      channel: d.channel === "WhatsApp" ? "WhatsApp" : "Email",
      title: `Sent to ${d.customer}.`,
    });
  }
  for (let i = 0; i < d.chasesSent; i++) {
    items.unshift({
      id: `${d.id}-chase-${i}`,
      icon: Clock,
      tone: "warning",
      channel: "Auto-chase",
      title: `Reminder ${i + 1} sent to ${d.customer}.`,
    });
  }
  if (d.status === "Signed") {
    items.unshift({ id: `${d.id}-signed`, icon: FileText, tone: "success", channel: "Signed", title: "Document signed and filed." });
  }
  return items;
}
