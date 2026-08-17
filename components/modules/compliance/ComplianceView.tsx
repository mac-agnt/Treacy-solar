"use client";

import { useState } from "react";
import { SealCheck, DownloadSimple, WarningCircle, CurrencyEur } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { Tabs } from "@/components/module/Tabs";
import { KanbanBoard } from "@/components/module/KanbanBoard";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Toast } from "@/components/module/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import {
  GRANTS, GRANT_STAGES, DSB_REGISTER, MPRN_REGISTER, MPRN_ERRORS,
  REMITTANCE_IDS, REMITTANCE_TOTAL, type GrantRecord, type DsbRecord, type MprnRecord,
} from "@/lib/data/compliance";
import { euro } from "@/lib/data/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "grants", label: "Grant pipeline" },
  { key: "dsb", label: "DSB permits" },
  { key: "mprn", label: "MPRN validation" },
];

export function ComplianceView() {
  const loading = useSimulatedLoad();
  const [tab, setTab] = useState("grants");
  const [grants, setGrants] = useState<GrantRecord[]>(GRANTS);
  const [imported, setImported] = useState(false);
  const [toast, setToast] = useState("");

  const inFlight = grants.filter((g) => g.stage !== "Paid").reduce((s, g) => s + g.grantValue, 0);

  function importRemittance() {
    if (imported) return;
    const count = grants.filter((g) => REMITTANCE_IDS.has(g.projectId)).length;
    setGrants((prev) => prev.map((g) => (REMITTANCE_IDS.has(g.projectId) ? { ...g, stage: "Paid" } : g)));
    setImported(true);
    setToast(
      `${count} projects reconciled and closed automatically. ${euro(REMITTANCE_TOTAL)} in grants matched and pushed into Aftercare.`,
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Grants & Compliance"
        title="Compliance"
        subtitle="SEAI grants, DSB permits and MPRN checks in one place. The SEAI remittance report stops being a PDF someone reads and becomes a live signal that closes projects."
        sources={["SEAI", "DSB", "Scoop", "HubSpot"]}
        actions={
          <Button variant="primary" size="sm" onClick={importRemittance} disabled={imported}>
            <DownloadSimple size={15} weight="bold" /> Import SEAI remittance
          </Button>
        }
      />

      <StatRow
        stats={[
          { label: "Grant value in flight", value: euro(inFlight), icon: CurrencyEur },
          { label: "Grants tracked", value: String(grants.length) },
          { label: "MPRN errors", value: String(MPRN_ERRORS.length), tone: MPRN_ERRORS.length ? "danger" : "success", icon: WarningCircle },
          { label: "DSB pending", value: String(DSB_REGISTER.filter((d) => d.status === "Pending").length), icon: SealCheck },
        ]}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} idPrefix="compliance" />

      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : tab === "grants" ? (
        <KanbanBoard
          columns={GRANT_STAGES.map((s) => ({ key: s, label: s }))}
          items={grants}
          groupKey={(g) => g.stage}
          cardKey={(g) => g.projectId}
          renderCard={(g) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium leading-snug text-ink">{g.customer}</p>
              <p className="text-[11.5px] text-ink-faint">{g.county}</p>
              <p className="text-[12px] font-medium text-accent-strong">{euro(g.grantValue)}</p>
            </div>
          )}
        />
      ) : tab === "dsb" ? (
        <DsbTable rows={DSB_REGISTER} />
      ) : (
        <MprnTable rows={MPRN_REGISTER} />
      )}

      <p className="text-[12px] text-ink-faint">
        The SEAI remittance report is currently the only reliable signal that a project is finished — read by a person
        and actioned by hand. Here it reconciles itself.
      </p>

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function DsbTable({ rows }: { rows: DsbRecord[] }) {
  const columns: Column<DsbRecord>[] = [
    {
      key: "customer",
      header: "Project",
      render: (d) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{d.customer}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{d.ref}</p>
        </div>
      ),
    },
    { key: "permit", header: "Permit ref", render: (d) => <span className="font-mono text-[12px] text-ink-muted">{d.permitRef}</span> },
    { key: "submitted", header: "Submitted", render: (d) => <span className="text-ink-muted">{d.submitted ?? "—"}</span> },
    {
      key: "status",
      header: "Status",
      render: (d) => <Badge tone={d.status === "Registered" ? "success" : d.status === "Pending" ? "warning" : "neutral"}>{d.status}</Badge>,
    },
    { key: "days", header: "Days pending", align: "right", render: (d) => (d.daysPending > 0 ? `${d.daysPending}d` : "—") },
  ];
  const filters: FilterDef<DsbRecord>[] = [
    { key: "status", label: "Status", options: ["Pending", "Registered"], value: (d) => d.status },
  ];
  const sorts: SortDef<DsbRecord>[] = [
    { key: "days", label: "Days pending", value: (d) => d.daysPending, dir: "desc" },
    { key: "customer", label: "Customer (A–Z)", value: (d) => d.customer, dir: "asc" },
  ];
  return (
    <DataList
      rows={rows}
      columns={columns}
      rowKey={(d) => d.projectId}
      searchText={(d) => `${d.customer} ${d.ref} ${d.permitRef}`}
      searchPlaceholder="Search project or permit ref..."
      filters={filters}
      sorts={sorts}
    />
  );
}

function MprnTable({ rows }: { rows: MprnRecord[] }) {
  const columns: Column<MprnRecord>[] = [
    {
      key: "customer",
      header: "Project",
      render: (m) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{m.customer}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{m.ref}</p>
        </div>
      ),
    },
    {
      key: "mprn",
      header: "MPRN",
      render: (m) => <span className={cn("font-mono text-[12.5px]", m.valid ? "text-ink" : "text-danger")}>{m.mprn}</span>,
    },
    { key: "reason", header: "Check", render: (m) => <span className="text-ink-muted">{m.reason}</span> },
    {
      key: "valid",
      header: "Result",
      align: "center",
      render: (m) => <Badge tone={m.valid ? "success" : "danger"}>{m.valid ? "Valid" : "Error"}</Badge>,
    },
  ];
  const filters: FilterDef<MprnRecord>[] = [
    { key: "valid", label: "Result", options: ["Valid", "Error"], value: (m) => (m.valid ? "Valid" : "Error") },
  ];
  return (
    <DataList
      rows={rows}
      columns={columns}
      rowKey={(m) => m.projectId}
      searchText={(m) => `${m.customer} ${m.ref} ${m.mprn}`}
      searchPlaceholder="Search project or MPRN..."
      filters={filters}
    />
  );
}
