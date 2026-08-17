"use client";

import { useState } from "react";
import { Warning, Users, IdentificationCard, Certificate } from "@phosphor-icons/react";
import { ModuleHeader } from "@/components/module/ModuleHeader";
import { Tabs } from "@/components/module/Tabs";
import { StatRow } from "@/components/module/StatTile";
import { TableSkeleton } from "@/components/module/TableSkeleton";
import { Drawer } from "@/components/module/Drawer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { KeyValueGrid } from "@/components/module/Detail";
import { useSimulatedLoad } from "@/lib/useSimulatedLoad";
import {
  STAFF, CERTS, CERT_ALERTS, COMPANY_REGISTRATIONS, CREW_NAMES, certTone,
  type Staff, type CertType,
} from "@/lib/data/team";

const CERT_TYPES: CertType[] = ["Safe Electric", "Heights training", "Manual handling", "Driving licence"];
const TABS = [
  { key: "roster", label: "Roster" },
  { key: "certs", label: "Certification matrix" },
  { key: "registrations", label: "Company registrations" },
];

export function TeamView() {
  const loading = useSimulatedLoad();
  const [tab, setTab] = useState("roster");
  const [selected, setSelected] = useState<Staff | null>(null);

  const expiring = CERT_ALERTS.filter((c) => c.state === "expiring").length;
  const expired = CERT_ALERTS.filter((c) => c.state === "expired").length;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ModuleHeader
        eyebrow="Team & Certifications"
        title="Team"
        subtitle="The roster, every certification and the company registrations that keep the business insured and SEAI-registered — tracked before anything lapses."
        sources={["Safe Electric", "SEAI", "DSB"]}
      />

      <StatRow
        stats={[
          { label: "Staff", value: String(STAFF.length), icon: Users },
          { label: "Crews", value: String(CREW_NAMES.length) },
          { label: "Certs expiring < 60 days", value: String(expiring), tone: "warning", icon: Certificate },
          { label: "Certs expired", value: String(expired), tone: "danger", icon: Warning },
        ]}
      />

      <Card className="border-danger/30 bg-danger/[0.05]">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-danger/15 text-danger">
            <Warning size={17} weight="fill" />
          </span>
          <p className="text-[13px] text-ink">
            <span className="font-semibold">{expiring} certifications expiring within 60 days. {expired} expired.</span>{" "}
            Liam Doherty&apos;s Safe Electric cert expired 11 days ago, and he is scheduled on 4 installs next week.
          </p>
        </div>
      </Card>

      <Tabs tabs={TABS} active={tab} onChange={setTab} idPrefix="team" />

      {loading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : tab === "roster" ? (
        <Roster onSelect={setSelected} />
      ) : tab === "certs" ? (
        <CertMatrix onSelect={setSelected} />
      ) : (
        <Registrations />
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={selected?.role}
        title={selected?.name ?? ""}
        actions={selected?.crew && <Badge tone="accent">{selected.crew}</Badge>}
      >
        {selected && (
          <div className="flex flex-col gap-6">
            <KeyValueGrid
              items={[
                { label: "Role", value: selected.role },
                { label: "Crew", value: selected.crew ?? "Management" },
                { label: "Phone", value: selected.phone },
              ]}
            />
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-ink">Certifications</h3>
              <div className="flex flex-col divide-y divide-border-soft">
                {CERTS.filter((c) => c.staffId === selected.id).map((c) => (
                  <div key={c.type} className="flex items-center justify-between py-2.5 first:pt-0">
                    <span className="text-[13px] text-ink">{c.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-ink-faint">{c.expires}</span>
                      <Badge tone={certTone[c.state]}>{c.state === "valid" ? "Valid" : c.state === "expiring" ? "Expiring" : "Expired"}</Badge>
                    </div>
                  </div>
                ))}
                {CERTS.filter((c) => c.staffId === selected.id).length === 0 && (
                  <p className="py-2 text-[13px] text-ink-muted">No certifications tracked for this role.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Roster({ onSelect }: { onSelect: (s: Staff) => void }) {
  const management = STAFF.filter((s) => !s.crew);
  const groups = [
    { label: "Management", members: management },
    ...CREW_NAMES.map((crew) => ({ label: crew, members: STAFF.filter((s) => s.crew === crew) })),
  ].filter((g) => g.members.length > 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <Card key={g.label} className="p-0">
          <div className="border-b border-border-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-ink">{g.label}</p>
            <p className="text-[11.5px] text-ink-faint">{g.members.length} people</p>
          </div>
          <div className="flex flex-col divide-y divide-border-soft">
            {g.members.map((s) => (
              <button key={s.id} onClick={() => onSelect(s)} className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-border-soft/50">
                <Avatar initials={s.initials} size={30} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-ink">{s.name}</p>
                  <p className="truncate text-[11px] text-ink-faint">{s.role}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function CertMatrix({ onSelect }: { onSelect: (s: Staff) => void }) {
  const crewStaff = STAFF.filter((s) => s.crew);
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-border-soft">
            <th className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint">Staff</th>
            {CERT_TYPES.map((t) => (
              <th key={t} className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.05em] text-ink-faint">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {crewStaff.map((s) => (
            <tr key={s.id} onClick={() => onSelect(s)} className="cursor-pointer border-b border-border-soft last:border-0 transition-colors hover:bg-border-soft/50">
              <td className="px-5 py-3">
                <p className="text-[13px] font-medium text-ink">{s.name}</p>
                <p className="text-[11px] text-ink-faint">{s.crew} · {s.role}</p>
              </td>
              {CERT_TYPES.map((t) => {
                const c = CERTS.find((x) => x.staffId === s.id && x.type === t);
                return (
                  <td key={t} className="px-4 py-3">
                    {c ? (
                      <div className="flex flex-col gap-1">
                        <Badge tone={certTone[c.state]}>{c.state === "valid" ? "Valid" : c.state === "expiring" ? "Expiring" : "Expired"}</Badge>
                        <span className="text-[10.5px] text-ink-faint">{c.expires}</span>
                      </div>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Registrations() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {COMPANY_REGISTRATIONS.map((r) => (
        <Card key={r.label} className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
              <IdentificationCard size={16} weight="fill" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">{r.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{r.detail}</p>
              <p className="mt-1 text-[11.5px] text-ink-faint">Renews {r.renews}</p>
            </div>
          </div>
          <Badge tone={certTone[r.status]}>{r.status === "valid" ? "Active" : r.status === "expiring" ? "Renew soon" : "Expired"}</Badge>
        </Card>
      ))}
    </div>
  );
}
