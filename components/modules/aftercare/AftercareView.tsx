"use client";

import { useState } from "react";
import { HeartStraight, Users, CheckCircle, Clock, Lightning } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { Tabs } from "@/components/module/Tabs";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Drawer } from "@/components/module/Drawer";
import { Timeline, type TimelineItem } from "@/components/module/Timeline";
import { KeyValueGrid } from "@/components/module/Detail";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import {
  AFTERCARE, OPPORTUNITIES, REFERRALS, JOURNEY_STEPS,
  COMPLETED_COUNT, PIPELINE_VALUE, REFERRALS_CONVERTED, type AftercareCustomer, type Referral,
} from "@/lib/data/aftercare";
import { euro } from "@/lib/data/format";

const TABS = [
  { key: "journey", label: "Post-install journey" },
  { key: "opps", label: "Next-measure opportunities" },
  { key: "referrals", label: "Referral tracker" },
];

export function AftercareView() {
  const loading = useSimulatedLoad();
  const [tab, setTab] = useState("journey");
  const [selected, setSelected] = useState<AftercareCustomer | null>(null);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Aftercare & Lifetime Value"
        title="Aftercare"
        subtitle="Once the job is done, the customer stops being forgotten. An automated journey keeps in touch and surfaces the next measure worth offering."
        sources={["HubSpot", "WhatsApp", "SEAI"]}
      />

      <StatRow
        stats={[
          { label: "Completed customers", value: COMPLETED_COUNT.toLocaleString("en-IE"), icon: CheckCircle },
          { label: "Contacted since handover", value: "0", tone: "danger", icon: Clock },
          { label: "Next-measure pipeline", value: euro(PIPELINE_VALUE), tone: "success", icon: Lightning },
          { label: "Referrals converted", value: String(REFERRALS_CONVERTED), icon: Users },
        ]}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} idPrefix="aftercare" />

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : tab === "journey" ? (
        <JourneyTable onSelect={setSelected} />
      ) : tab === "opps" ? (
        <OppsTable onSelect={setSelected} />
      ) : (
        <ReferralsTable rows={REFERRALS} />
      )}

      <p className="text-[12px] text-ink-faint">
        412 completed customers, none contacted since handover. That is an estimated {euro(PIPELINE_VALUE)} of next-measure
        work sitting untouched.
      </p>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={`${selected?.town}, ${selected?.county}`}
        title={selected?.name ?? ""}
        actions={selected?.opportunity && <Badge tone="success">{selected.opportunity}</Badge>}
      >
        {selected && (
          <div className="flex flex-col gap-6">
            <KeyValueGrid
              items={[
                { label: "Installed", value: selected.installed },
                { label: "BER", value: selected.ber },
                { label: "Journey stage", value: selected.journey },
                { label: "Opportunity score", value: `${selected.score}/100` },
                { label: "Next measure", value: selected.opportunity ?? "None flagged" },
                { label: "Est. value", value: selected.opportunityValue > 0 ? euro(selected.opportunityValue) : "—" },
              ]}
            />
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-ink">Automated journey</h3>
              <Timeline items={journeyTimeline(selected)} />
            </div>
            <Button variant="primary" size="sm" className="w-fit">Start journey now</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function JourneyTable({ onSelect }: { onSelect: (c: AftercareCustomer) => void }) {
  const columns: Column<AftercareCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-strong">{c.initials}</span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{c.name}</p>
            <p className="truncate text-[11.5px] text-ink-faint">{c.town}, {c.county}</p>
          </div>
        </div>
      ),
    },
    { key: "installed", header: "Installed", render: (c) => <span className="text-ink-muted">{c.installed}</span> },
    { key: "ber", header: "BER", render: (c) => c.ber },
    { key: "journey", header: "Journey stage", render: (c) => <Badge tone="accent">{c.journey}</Badge> },
    { key: "contacted", header: "Contacted", align: "center", render: () => <Badge tone="danger">Never</Badge> },
  ];
  const filters: FilterDef<AftercareCustomer>[] = [
    { key: "journey", label: "Stage", options: [...JOURNEY_STEPS], value: (c) => c.journey },
  ];
  const sorts: SortDef<AftercareCustomer>[] = [
    { key: "score", label: "Opportunity score", value: (c) => c.score, dir: "desc" },
    { key: "name", label: "Customer (A–Z)", value: (c) => c.name, dir: "asc" },
  ];
  return (
    <DataList
      rows={AFTERCARE}
      columns={columns}
      rowKey={(c) => c.id}
      searchText={(c) => `${c.name} ${c.town} ${c.county}`}
      searchPlaceholder="Search customer or county..."
      filters={filters}
      sorts={sorts}
      pageSize={15}
      onRowClick={onSelect}
    />
  );
}

function OppsTable({ onSelect }: { onSelect: (c: AftercareCustomer) => void }) {
  const columns: Column<AftercareCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{c.name}</p>
          <p className="truncate text-[11.5px] text-ink-faint">{c.town}, {c.county} · BER {c.ber}</p>
        </div>
      ),
    },
    { key: "measure", header: "Next measure", render: (c) => <Badge tone="success">{c.opportunity}</Badge> },
    { key: "grant", header: "Grant", align: "right", render: (c) => euro(c.opportunityGrant) },
    { key: "value", header: "Est. value", align: "right", render: (c) => <span className="font-medium">{euro(c.opportunityValue)}</span> },
    { key: "score", header: "Score", align: "right", render: (c) => `${c.score}` },
  ];
  const filters: FilterDef<AftercareCustomer>[] = [
    { key: "measure", label: "Measure", options: ["Heat Pump", "Attic Insulation", "Cavity Wall Insulation", "Windows & Doors", "Floor Insulation"], value: (c) => c.opportunity ?? "" },
  ];
  const sorts: SortDef<AftercareCustomer>[] = [
    { key: "value", label: "Est. value (high first)", value: (c) => c.opportunityValue, dir: "desc" },
    { key: "score", label: "Score", value: (c) => c.score, dir: "desc" },
  ];
  return (
    <DataList
      rows={OPPORTUNITIES}
      columns={columns}
      rowKey={(c) => c.id}
      searchText={(c) => `${c.name} ${c.county} ${c.opportunity}`}
      searchPlaceholder="Search customer or measure..."
      filters={filters}
      sorts={sorts}
      pageSize={15}
      onRowClick={onSelect}
    />
  );
}

function ReferralsTable({ rows }: { rows: Referral[] }) {
  const tone = { Asked: "neutral", Referred: "warning", Converted: "success" } as const;
  const columns: Column<Referral>[] = [
    { key: "advocate", header: "Advocate", render: (r) => <span className="font-medium text-ink">{r.advocate}</span> },
    { key: "referred", header: "Referred", render: (r) => <span className="text-ink-muted">{r.referred}</span> },
    { key: "county", header: "County", render: (r) => <span className="text-ink-muted">{r.county}</span> },
    { key: "status", header: "Status", render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge> },
  ];
  const filters: FilterDef<Referral>[] = [
    { key: "status", label: "Status", options: ["Asked", "Referred", "Converted"], value: (r) => r.status },
  ];
  return (
    <DataList
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.advocate} ${r.referred} ${r.county}`}
      searchPlaceholder="Search advocate or referred..."
      filters={filters}
    />
  );
}

function journeyTimeline(c: AftercareCustomer): TimelineItem[] {
  const currentIdx = JOURNEY_STEPS.indexOf(c.journey);
  return JOURNEY_STEPS.map((step, i) => ({
    id: `${c.id}-${i}`,
    icon: i <= currentIdx ? Clock : HeartStraight,
    tone: i < currentIdx ? "neutral" : i === currentIdx ? "warning" : "neutral",
    title: step,
    meta: i < currentIdx ? "Would have fired" : i === currentIdx ? "Due now — nobody actioned it" : "Scheduled",
  }));
}
