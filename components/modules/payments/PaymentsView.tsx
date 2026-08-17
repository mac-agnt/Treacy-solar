"use client";

import { useState } from "react";
import { CurrencyEur, Lightning, ArrowSquareOut } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { ViewToggle } from "@/components/module/ViewToggle";
import { KanbanBoard } from "@/components/module/KanbanBoard";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Drawer } from "@/components/module/Drawer";
import { KeyValueGrid } from "@/components/module/Detail";
import { Toast } from "@/components/module/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import {
  PAYMENTS, PAY_STAGES, payStageTone, sageTone,
  TOTAL_OUTSTANDING, OVERDUE_30, COLLECTED_THIS_MONTH, type Payment,
} from "@/lib/data/payments";
import { euro } from "@/lib/data/format";

const COUNTIES = Array.from(new Set(PAYMENTS.map((p) => p.county))).sort();

export function PaymentsView() {
  const loading = useSimulatedLoad();
  const [view, setView] = useState<"board" | "table">("table");
  const [rows, setRows] = useState<Payment[]>(PAYMENTS);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [toast, setToast] = useState("");

  function chaseOverdue() {
    const count = rows.filter((p) => p.stage === "Overdue").length;
    if (!count) return;
    setToast(`${count} overdue balances chased via WhatsApp + email. Logged to HubSpot.`);
  }

  function pushToSage(p: Payment) {
    setRows((prev) => prev.map((x) => (x.projectId === p.projectId ? { ...x, sage: "Synced" } : x)));
    setSelected((prev) => (prev ? { ...prev, sage: "Synced" } : prev));
    setToast(`Invoice for ${p.customer} pushed to Sage.`);
  }

  const columns: Column<Payment>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{p.customer}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{p.ref} · {p.county}</p>
        </div>
      ),
    },
    { key: "value", header: "Value", align: "right", render: (p) => <span className="font-medium">{euro(p.value)}</span> },
    { key: "deposit", header: "Deposit", align: "right", render: (p) => euro(p.deposit) },
    { key: "balance", header: "Balance", align: "right", render: (p) => euro(p.balance) },
    { key: "stage", header: "Stage", render: (p) => <Badge tone={payStageTone[p.stage]}>{p.stage}</Badge> },
    {
      key: "overdue",
      header: "Overdue",
      align: "right",
      render: (p) => (p.daysOverdue > 0 ? <span className="text-danger">{p.daysOverdue}d</span> : <span className="text-ink-faint">—</span>),
    },
    { key: "sage", header: "Sage", render: (p) => <Badge tone={sageTone[p.sage]}>{p.sage}</Badge> },
  ];

  const filters: FilterDef<Payment>[] = [
    { key: "stage", label: "Stage", options: [...PAY_STAGES], value: (p) => p.stage },
    { key: "sage", label: "Sage", options: ["Synced", "Pending", "Error"], value: (p) => p.sage },
    { key: "county", label: "County", options: COUNTIES, value: (p) => p.county },
  ];
  const sorts: SortDef<Payment>[] = [
    { key: "value", label: "Value (high to low)", value: (p) => p.value, dir: "desc" },
    { key: "overdue", label: "Days overdue", value: (p) => p.daysOverdue, dir: "desc" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Payments & Sage Bridge"
        title="Payments"
        subtitle="Deposit and balance against every project, with a one-click bridge to Sage. Accounts stop being the tool that is not connected to anything."
        sources={["Sage", "HubSpot", "SEAI"]}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle options={[{ key: "table", label: "Table" }, { key: "board", label: "Board" }]} value={view} onChange={setView} />
            <Button variant="primary" size="sm" onClick={chaseOverdue}>
              <Lightning size={15} weight="fill" /> Chase all overdue
            </Button>
          </div>
        }
      />

      <StatRow
        stats={[
          { label: "Total outstanding", value: euro(TOTAL_OUTSTANDING), icon: CurrencyEur },
          { label: "Overdue 30+ days", value: euro(OVERDUE_30), tone: "danger" },
          { label: "Collected this month", value: euro(COLLECTED_THIS_MONTH), tone: "success" },
          { label: "Sage errors", value: String(rows.filter((p) => p.sage === "Error").length), tone: rows.some((p) => p.sage === "Error") ? "warning" : "success" },
        ]}
      />

      {loading ? (
        <TableSkeleton rows={7} cols={7} />
      ) : view === "table" ? (
        <DataList
          rows={rows}
          columns={columns}
          rowKey={(p) => p.projectId}
          searchText={(p) => `${p.customer} ${p.ref} ${p.county}`}
          searchPlaceholder="Search customer, ref or county..."
          filters={filters}
          sorts={sorts}
          onRowClick={setSelected}
        />
      ) : (
        <KanbanBoard
          columns={PAY_STAGES.map((s) => ({ key: s, label: s }))}
          items={rows}
          groupKey={(p) => p.stage}
          cardKey={(p) => p.projectId}
          onCardClick={setSelected}
          renderCard={(p) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium leading-snug text-ink">{p.customer}</p>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-ink-muted">{euro(p.stage === "Deposit Due" ? p.deposit : p.balance)}</span>
                <Badge tone={sageTone[p.sage]}>{p.sage}</Badge>
              </div>
            </div>
          )}
        />
      )}

      <p className="text-[12px] text-ink-faint">
        50% deposit, 50% balance. Every invoice can push to Sage in one click instead of being re-keyed by accounts.
      </p>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={selected?.ref}
        title={selected?.customer ?? ""}
        actions={selected && <Badge tone={payStageTone[selected.stage]}>{selected.stage}</Badge>}
      >
        {selected && (
          <div className="flex flex-col gap-6">
            <KeyValueGrid
              items={[
                { label: "Project value", value: euro(selected.value) },
                { label: "Deposit (50%)", value: euro(selected.deposit) },
                { label: "Balance (50%)", value: euro(selected.balance) },
                { label: "Grant offset", value: selected.grantOffset > 0 ? euro(selected.grantOffset) : "N/A" },
                { label: "Raised", value: selected.raised },
                { label: "Days overdue", value: selected.daysOverdue > 0 ? `${selected.daysOverdue}d` : "—", tone: selected.daysOverdue > 0 ? "danger" : "default" },
              ]}
            />
            <div className="flex items-center justify-between rounded-[12px] border border-border-soft bg-bg/50 px-4 py-3">
              <span className="text-[12.5px] text-ink-muted">Sage sync</span>
              <Badge tone={sageTone[selected.sage]}>{selected.sage}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => pushToSage(selected)} disabled={selected.sage === "Synced"}>
                <ArrowSquareOut size={14} /> Push to Sage
              </Button>
              <Button variant="secondary" size="sm">Raise invoice</Button>
              <Button variant="ghost" size="sm">Chase payment</Button>
            </div>
          </div>
        )}
      </Drawer>

      <Toast open={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}
