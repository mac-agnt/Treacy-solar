import { mulberry32, intBetween, initials } from "./pools";
import { TODAY, ddmmyyyy, daysFromNow, daysAgo } from "./format";

export type Role =
  | "Ops manager"
  | "Sub-manager (Electrical)"
  | "Sub-manager (Roofing)"
  | "Lead electrician"
  | "Electrician"
  | "Apprentice"
  | "Lead roofer"
  | "Roofer";

export type Staff = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  crew: string | null;
  phone: string;
};

export type CertType = "Safe Electric" | "Heights training" | "Manual handling" | "Driving licence";
export type CertState = "valid" | "expiring" | "expired";

export type Cert = {
  staffId: string;
  staffName: string;
  type: CertType;
  expires: string;
  state: CertState;
  daysToExpiry: number;
};

const NAMES: { name: string; role: Role; crew: string | null }[] = [
  { name: "Jeff Treacy", role: "Ops manager", crew: null },
  { name: "Kieron Bolt", role: "Ops manager", crew: null },
  { name: "Declan Fitzgerald", role: "Sub-manager (Electrical)", crew: null },
  { name: "Órla Sheehan", role: "Sub-manager (Roofing)", crew: null },
  // Crew A
  { name: "Liam Doherty", role: "Lead electrician", crew: "Crew A" },
  { name: "Cian Brennan", role: "Electrician", crew: "Crew A" },
  { name: "Fionn Whelan", role: "Apprentice", crew: "Crew A" },
  { name: "Pádraig Molloy", role: "Lead roofer", crew: "Crew A" },
  { name: "Darragh Boyle", role: "Roofer", crew: "Crew A" },
  // Crew B
  { name: "Eoin Gallagher", role: "Lead electrician", crew: "Crew B" },
  { name: "Ruairí Nolan", role: "Electrician", crew: "Crew B" },
  { name: "Oisín Healy", role: "Apprentice", crew: "Crew B" },
  { name: "Cormac Dunne", role: "Lead roofer", crew: "Crew B" },
  { name: "Tadhg Lynch", role: "Roofer", crew: "Crew B" },
  // Crew C
  { name: "Colm Maguire", role: "Lead electrician", crew: "Crew C" },
  { name: "Killian Ryan", role: "Electrician", crew: "Crew C" },
  { name: "Lorcan Clarke", role: "Apprentice", crew: "Crew C" },
  { name: "Fiachra Kennedy", role: "Lead roofer", crew: "Crew C" },
  { name: "Cathal Doyle", role: "Roofer", crew: "Crew C" },
  // Crew D
  { name: "Niall Kavanagh", role: "Lead electrician", crew: "Crew D" },
  { name: "Shane Quinn", role: "Electrician", crew: "Crew D" },
  { name: "Aaron Byrne", role: "Apprentice", crew: "Crew D" },
  { name: "Gearóid Walsh", role: "Lead roofer", crew: "Crew D" },
  { name: "Barry Flynn", role: "Roofer", crew: "Crew D" },
  // Crew E
  { name: "Seán McCarthy", role: "Lead electrician", crew: "Crew E" },
  { name: "Dara O'Connor", role: "Electrician", crew: "Crew E" },
  { name: "Rónán Kelly", role: "Lead roofer", crew: "Crew E" },
  { name: "Peadar Murphy", role: "Roofer", crew: "Crew E" },
  // Crew F
  { name: "Gavin O'Reilly", role: "Lead electrician", crew: "Crew F" },
  { name: "Marcus Redmond", role: "Electrician", crew: "Crew F" },
  { name: "Evan Sheridan", role: "Lead roofer", crew: "Crew F" },
];

export const STAFF: Staff[] = NAMES.map((n, i) => {
  const rng = mulberry32(11000 + i * 3);
  return {
    id: `STF-${300 + i}`,
    name: n.name,
    initials: initials(n.name),
    role: n.role,
    crew: n.crew,
    phone: `08${intBetween(rng, 3, 9)} ${intBetween(rng, 100, 999)} ${intBetween(rng, 1000, 9999)}`,
  };
});

const CERT_TYPES: CertType[] = ["Safe Electric", "Heights training", "Manual handling", "Driving licence"];

function stateFor(days: number): CertState {
  if (days < 0) return "expired";
  if (days <= 60) return "expiring";
  return "valid";
}

// Hand-placed warning/expired cases so the demo reads clearly.
const OVERRIDES: Record<string, number> = {
  "Liam Doherty|Safe Electric": -11, // expired 11 days ago, scheduled next week
  "Cian Brennan|Heights training": 34,
  "Rónán Kelly|Manual handling": 52,
  "Shane Quinn|Driving licence": 19,
};

export const CERTS: Cert[] = STAFF.filter((s) => s.crew).flatMap((s, si) =>
  CERT_TYPES.map((type, ti) => {
    const rng = mulberry32(13000 + si * 11 + ti);
    const key = `${s.name}|${type}`;
    const days = key in OVERRIDES ? OVERRIDES[key] : intBetween(rng, 120, 3300);
    const expiry = days < 0 ? daysAgo(-days) : daysFromNow(days);
    return {
      staffId: s.id,
      staffName: s.name,
      type,
      expires: ddmmyyyy(expiry),
      state: stateFor(days),
      daysToExpiry: days,
    };
  }),
);

export const CERT_ALERTS = CERTS.filter((c) => c.state !== "valid");

export const COMPANY_REGISTRATIONS = [
  { label: "SEAI registration", detail: "Registered installer — TS-INST-4471", status: "valid" as CertState, renews: ddmmyyyy(daysFromNow(214)) },
  { label: "Company insurance", detail: "Public & employer liability — annual SEAI requirement", status: "expiring" as CertState, renews: ddmmyyyy(daysFromNow(41)) },
  { label: "DSB registration", detail: "Registered electrical contractor", status: "valid" as CertState, renews: ddmmyyyy(daysFromNow(302)) },
  { label: "Safe Electric membership", detail: "Company certification body", status: "valid" as CertState, renews: ddmmyyyy(daysFromNow(158)) },
];

export const certTone: Record<CertState, "success" | "warning" | "danger"> = {
  valid: "success",
  expiring: "warning",
  expired: "danger",
};

export const CREW_NAMES = ["Crew A", "Crew B", "Crew C", "Crew D", "Crew E", "Crew F"];
export { TODAY };
