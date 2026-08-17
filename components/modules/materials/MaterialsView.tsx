"use client";

import { useState } from "react";
import { Truck, TrendUp } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { Tabs } from "@/components/module/Tabs";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { SKUS, VANS, REQUIREMENTS, FORWARD_DEMAND, skuCategoryTone, type Sku, type Requirement } from "@/lib/data/materials";
import { PROJECTS, STAGES, type Project } from "@/lib/data/projects";
import { kwp, ddmmyyyy } from "@/lib/data/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "bom", label: "Job BOM" },
  { key: "warehouse", label: "Warehouse stock" },
  { key: "vans", label: "Van stock" },
  { key: "purchase", label: "Purchase requirements" },
];

const CATEGORIES = ["Panels", "Inverters", "Batteries", "Mounting", "Cable", "Protection"];

export function MaterialsView() {
  const loading = useSimulatedLoad();
  const [tab, setTab] = useState("bom");
  const next = FORWARD_DEMAND[0];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Materials, BOM & Van Stock"
        title="Materials"
        subtitle="Every job's bill of materials comes straight off the quotation, and the incoming stock control system gets a home — warehouse, vans and forward demand in one view."
        sources={["Scoop", "HubSpot", "Stock Control"]}
      />

      <Card className="border-accent/30 bg-accent-soft/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-accent-ink">
              <TrendUp size={17} weight="fill" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">Next week: {next.installs} installs</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Requires {next.panels} panels, {next.inverters} inverters, {next.batteries} batteries. In stock: 240 panels.
                Shortfall: 44. Order by Thursday to avoid slipping 2 jobs.
              </p>
            </div>
          </div>
          <Badge tone="warning" className="shrink-0">Order by Thu</Badge>
        </div>
      </Card>

      <Tabs tabs={TABS} active={tab} onChange={setTab} idPrefix="materials" />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : tab === "bom" ? (
        <JobBomTable />
      ) : tab === "warehouse" ? (
        <WarehouseTable />
      ) : tab === "vans" ? (
        <VanGrid />
      ) : (
        <PurchaseTable rows={REQUIREMENTS} />
      )}
    </div>
  );
}

function JobBomTable() {
  const jobs = PROJECTS.filter((p) => p.stageIndex >= STAGES.indexOf("Contract Signed") && p.stageIndex <= STAGES.indexOf("Installed"));
  const columns: Column<Project>[] = [
    {
      key: "customer",
      header: "Job",
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{p.customer}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{p.county}</p>
        </div>
      ),
    },
    { key: "system", header: "System", align: "right", render: (p) => kwp(p.systemKwp) },
    { key: "panels", header: "Panels", align: "right", render: (p) => `${p.panelCount} × ${p.panelWatt}W` },
    { key: "inverter", header: "Inverter", render: (p) => p.inverter },
    { key: "battery", header: "Battery", render: (p) => (p.batteryKwh > 0 ? `${p.batteryKwh} kWh` : "—") },
    { key: "install", header: "Install", render: (p) => (p.installDate ? ddmmyyyy(p.installDate) : <span className="text-ink-faint">TBC</span>) },
  ];
  const filters: FilterDef<Project>[] = [
    { key: "inverter", label: "Inverter", options: ["SolarEdge", "Huawei", "GivEnergy", "Sungrow"], value: (p) => p.inverter },
  ];
  const sorts: SortDef<Project>[] = [
    { key: "panels", label: "Panels (most first)", value: (p) => p.panelCount, dir: "desc" },
    { key: "system", label: "System size", value: (p) => p.systemKwp, dir: "desc" },
  ];
  return (
    <DataList
      rows={jobs}
      columns={columns}
      rowKey={(p) => p.id}
      searchText={(p) => `${p.customer} ${p.county} ${p.inverter}`}
      searchPlaceholder="Search job, county or inverter..."
      filters={filters}
      sorts={sorts}
    />
  );
}

function WarehouseTable() {
  const columns: Column<Sku>[] = [
    {
      key: "name",
      header: "SKU",
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{s.name}</p>
          <p className="truncate font-mono text-[11px] text-ink-faint">{s.id}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (s) => <Badge tone={skuCategoryTone[s.category]}>{s.category}</Badge> },
    { key: "onHand", header: "On hand", align: "right", render: (s) => <span className="font-medium">{s.onHand.toLocaleString("en-IE")} {s.unit}</span> },
    { key: "reorder", header: "Reorder at", align: "right", render: (s) => s.reorderAt.toLocaleString("en-IE") },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (s) => <Badge tone={s.onHand <= s.reorderAt ? "danger" : "success"}>{s.onHand <= s.reorderAt ? "Reorder" : "OK"}</Badge>,
    },
  ];
  const filters: FilterDef<Sku>[] = [
    { key: "category", label: "Category", options: CATEGORIES, value: (s) => s.category },
  ];
  const sorts: SortDef<Sku>[] = [
    { key: "onHand", label: "On hand (low first)", value: (s) => s.onHand, dir: "asc" },
    { key: "name", label: "Name (A–Z)", value: (s) => s.name, dir: "asc" },
  ];
  return (
    <DataList
      rows={SKUS}
      columns={columns}
      rowKey={(s) => s.id}
      searchText={(s) => `${s.name} ${s.id} ${s.category}`}
      searchPlaceholder="Search SKU..."
      filters={filters}
      sorts={sorts}
      pageSize={25}
    />
  );
}

function VanGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {VANS.map((v) => (
        <Card key={v.crew} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                <Truck size={15} weight="fill" />
              </span>
              <p className="text-[13.5px] font-semibold text-ink">{v.crew}</p>
            </div>
            <span className="text-[11px] text-ink-faint">Loaded {v.lastLoaded}</span>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-[12.5px]">
            {[
              ["Panels", v.panels],
              ["Rail (m)", v.rail],
              ["Clamps", v.clamps],
              ["Isolators", v.isolators],
              ["Cable (m)", v.cableMetres],
            ].map(([k, val]) => (
              <div key={k} className="flex items-center justify-between pr-3">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="font-medium text-ink">{val}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  );
}

function PurchaseTable({ rows }: { rows: Requirement[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-border-soft">
            {["Item", "Required", "On hand", "Shortfall", ""].map((h, i) => (
              <th key={h} className={cn("px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint", i > 0 && i < 4 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sku} className="border-b border-border-soft last:border-0">
              <td className="px-5 py-3.5 text-[13px] font-medium text-ink">{r.name}</td>
              <td className="px-5 py-3.5 text-right text-[13px] text-ink-muted">{r.required}</td>
              <td className="px-5 py-3.5 text-right text-[13px] text-ink-muted">{r.onHand}</td>
              <td className={cn("px-5 py-3.5 text-right text-[13px] font-medium", r.shortfall > 0 ? "text-danger" : "text-ink")}>{r.shortfall}</td>
              <td className="px-5 py-3.5 text-right">
                <Badge tone={r.shortfall > 0 ? "danger" : "success"}>{r.shortfall > 0 ? "Order" : "Covered"}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
