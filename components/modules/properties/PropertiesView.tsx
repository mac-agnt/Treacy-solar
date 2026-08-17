"use client";

import { useRouter } from "next/navigation";
import { HouseLine } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { DataList, type Column, type FilterDef, type SortDef } from "@/components/module/DataList";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Badge } from "@/components/ui/Badge";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import { PROPERTIES, MULTI_MEASURE_COUNT, TOTAL_GRANT_DRAWN, TOTAL_LTV, type Property } from "@/lib/data/properties";
import { euro } from "@/lib/data/format";

const COUNTIES = Array.from(new Set(PROPERTIES.map((p) => p.county))).sort();

export function PropertiesView() {
  const router = useRouter();
  const loading = useSimulatedLoad();

  const columns: Column<Property>[] = [
    {
      key: "owner",
      header: "Property",
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-strong">{p.initials}</span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{p.owner}</p>
            <p className="truncate text-[11.5px] text-ink-faint">{p.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: "measures",
      header: "Measures",
      render: (p) => (
        <div className="flex flex-wrap items-center gap-1">
          <Badge tone={p.multiMeasure ? "accent" : "neutral"}>{p.installed.length} installed</Badge>
          {p.multiMeasure && <span className="text-[11px] text-ink-faint">multi-measure</span>}
        </div>
      ),
    },
    { key: "ber", header: "BER", render: (p) => <span className="text-ink-muted">{p.berBefore} → {p.berAfter}</span> },
    { key: "grant", header: "Grant drawn", align: "right", render: (p) => euro(p.grantDrawn) },
    { key: "ltv", header: "Lifetime value", align: "right", render: (p) => <span className="font-medium">{euro(p.ltv)}</span> },
  ];

  const filters: FilterDef<Property>[] = [
    { key: "county", label: "County", options: COUNTIES, value: (p) => p.county },
    { key: "multi", label: "Type", options: ["Multi-measure", "Single measure"], value: (p) => (p.multiMeasure ? "Multi-measure" : "Single measure") },
  ];
  const sorts: SortDef<Property>[] = [
    { key: "ltv", label: "Lifetime value", value: (p) => p.ltv, dir: "desc" },
    { key: "measures", label: "Measures installed", value: (p) => p.installed.length, dir: "desc" },
    { key: "owner", label: "Owner (A–Z)", value: (p) => p.owner, dir: "asc" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Property Record & Multi-Measure"
        title="Properties"
        subtitle="One address, many measures across time. This is the record that lets the business become a one-stop shop without rebuilding the platform."
        sources={["Scoop", "SEAI", "HubSpot"]}
      />

      <StatRow
        stats={[
          { label: "Properties", value: String(PROPERTIES.length), icon: HouseLine },
          { label: "Multi-measure homes", value: String(MULTI_MEASURE_COUNT) },
          { label: "Grant drawn to date", value: euro(TOTAL_GRANT_DRAWN), tone: "success" },
          { label: "Total lifetime value", value: euro(TOTAL_LTV) },
        ]}
      />

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <DataList
          rows={PROPERTIES}
          columns={columns}
          rowKey={(p) => p.id}
          searchText={(p) => `${p.owner} ${p.address} ${p.county}`}
          searchPlaceholder="Search owner, address or county..."
          filters={filters}
          sorts={sorts}
          onRowClick={(p) => router.push(`/properties/${p.id}`)}
        />
      )}
    </div>
  );
}
