"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Kanban } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { ViewToggle } from "@/components/module/ViewToggle";
import { KanbanBoard } from "@/components/module/KanbanBoard";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Badge } from "@/components/ui/Badge";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { PROJECTS, STAGES, ragDot, stageTone, type Project } from "@/lib/data/projects";
import { euro, kwp } from "@/lib/data/format";
import { cn } from "@/lib/cn";

const COUNTIES = Array.from(new Set(PROJECTS.map((p) => p.county))).sort();

const columns: Column<Project>[] = [
  {
    key: "customer",
    header: "Customer",
    render: (p) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-strong">
          {p.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{p.customer}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{p.ref}</p>
        </div>
      </div>
    ),
  },
  { key: "county", header: "County", render: (p) => <span className="text-ink-muted">{p.county}</span> },
  { key: "system", header: "System", align: "right", render: (p) => kwp(p.systemKwp) },
  { key: "value", header: "Value", align: "right", render: (p) => <span className="font-medium">{euro(p.value)}</span> },
  { key: "stage", header: "Stage", render: (p) => <Badge tone={stageTone(p.stage)}>{p.stage}</Badge> },
  {
    key: "days",
    header: "Days in stage",
    align: "right",
    render: (p) => <span className={cn(p.rag === "red" && "text-danger", p.rag === "amber" && "text-warning")}>{p.daysInStage}</span>,
  },
  { key: "owner", header: "Owner", render: (p) => <span className="text-ink-muted">{p.owner}</span> },
  {
    key: "rag",
    header: "Flag",
    align: "center",
    render: (p) => <span className={cn("inline-block size-2.5 rounded-full", ragDot[p.rag])} aria-label={p.rag} />,
  },
];

const filters: FilterDef<Project>[] = [
  { key: "stage", label: "Stage", options: [...STAGES], value: (p) => p.stage },
  { key: "county", label: "County", options: COUNTIES, value: (p) => p.county },
  { key: "rag", label: "Flag", options: ["green", "amber", "red"], value: (p) => p.rag },
];

const sorts: SortDef<Project>[] = [
  { key: "value", label: "Value (high to low)", value: (p) => p.value, dir: "desc" },
  { key: "days", label: "Days in stage", value: (p) => p.daysInStage, dir: "desc" },
  { key: "customer", label: "Customer (A–Z)", value: (p) => p.customer, dir: "asc" },
];

export function ProjectsView() {
  const router = useRouter();
  const loading = useSimulatedLoad();
  const [view, setView] = useState<"board" | "table">("board");

  function open(p: Project) {
    router.push(`/projects/${p.id}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Project Command Centre"
        title="Projects"
        subtitle="Every job from first lead to grant paid, on one board. No more waiting on a person to move a project from HubSpot into Scoop."
        sources={["HubSpot", "Scoop", "SEAI", "Sage", "WhatsApp", "Aircall"]}
        actions={
          <ViewToggle
            options={[
              { key: "board", label: "Board" },
              { key: "table", label: "Table" },
            ]}
            value={view}
            onChange={setView}
          />
        }
      />

      {loading ? (
        <TableSkeleton rows={7} cols={7} />
      ) : view === "board" ? (
        <KanbanBoard
          columns={STAGES.map((s) => ({ key: s, label: s }))}
          items={PROJECTS}
          groupKey={(p) => p.stage}
          cardKey={(p) => p.id}
          onCardClick={open}
          renderCard={(p) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-medium leading-snug text-ink">{p.customer}</p>
                <span className={cn("mt-1 inline-block size-2 shrink-0 rounded-full", ragDot[p.rag])} />
              </div>
              <p className="text-[11.5px] text-ink-faint">{p.county}</p>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-ink-muted">{kwp(p.systemKwp)}</span>
                <span className="font-medium text-ink">{euro(p.value)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-soft pt-2 text-[11px] text-ink-faint">
                <span>{p.daysInStage}d in stage</span>
                <span>{p.owner.split(" ")[0]}</span>
              </div>
            </div>
          )}
        />
      ) : (
        <DataList
          rows={PROJECTS}
          columns={columns}
          rowKey={(p) => p.id}
          searchText={(p) => `${p.customer} ${p.ref} ${p.county} ${p.town}`}
          searchPlaceholder="Search customer, ref or county..."
          filters={filters}
          sorts={sorts}
          onRowClick={open}
        />
      )}

      <p className="text-[12px] text-ink-faint">
        <Kanban size={13} className="mr-1 inline align-[-2px]" />
        40 live projects · a project at Contract Signed still takes an admin 3.4 days to re-key into Scoop by hand.
      </p>
    </div>
  );
}
