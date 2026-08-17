import {
  mulberry32, pick, intBetween, initials, eircode, mprn,
  FIRST_NAMES, SURNAMES, TOWNS, STREETS, INVERTERS, PANEL_WATT,
  BATTERIES, ROOF_TYPES, BER_RATINGS, SALES_REPS,
} from "./pools";
import { TODAY, daysFromNow } from "./format";

export const STAGES = [
  "New Lead",
  "Quoted",
  "Contract Sent",
  "Contract Signed",
  "Deposit Paid",
  "Scheduled",
  "Installed",
  "Certs Issued",
  "Grant Submitted",
  "Grant Paid",
  "Closed",
] as const;
export type Stage = (typeof STAGES)[number];

export type Rag = "green" | "amber" | "red";

export type BomLine = {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type Project = {
  id: string;
  ref: string;
  customer: string;
  initials: string;
  town: string;
  county: string;
  address: string;
  eircode: string;
  mprn: string;
  mprnValid: boolean;
  ber: string;
  roofType: string;
  systemKwp: number;
  panelWatt: number;
  panelCount: number;
  inverter: string;
  batteryKwh: number;
  value: number;
  grantValue: number;
  stage: Stage;
  stageIndex: number;
  owner: string;
  daysInStage: number;
  rag: Rag;
  commercial: boolean;
  createdDaysAgo: number;
  installDate: Date | null;
  crew: string | null;
  depositPaid: boolean;
  balancePaid: boolean;
  bom: BomLine[];
};

const CREWS = ["Crew A", "Crew B", "Crew C", "Crew D", "Crew E", "Crew F"];

// Deliberate stage distribution across 40 projects so every column is populated
// and the pipeline looks like a genuinely busy installer.
const STAGE_PLAN: Stage[] = [
  "New Lead", "New Lead", "New Lead", "New Lead",
  "Quoted", "Quoted", "Quoted", "Quoted", "Quoted",
  "Contract Sent", "Contract Sent", "Contract Sent",
  "Contract Signed", "Contract Signed", "Contract Signed", "Contract Signed",
  "Deposit Paid", "Deposit Paid", "Deposit Paid",
  "Scheduled", "Scheduled", "Scheduled", "Scheduled",
  "Installed", "Installed", "Installed",
  "Certs Issued", "Certs Issued",
  "Grant Submitted", "Grant Submitted", "Grant Submitted",
  "Grant Paid", "Grant Paid", "Grant Paid",
  "Closed", "Closed", "Closed", "Closed", "Closed", "Closed",
];

// Indices (into the 40) that carry a malformed / missing MPRN — a named error risk.
const BAD_MPRN = new Set([6, 21, 33]);

function buildBom(
  rng: () => number,
  panelCount: number,
  panelWatt: number,
  inverter: string,
  batteryKwh: number,
  value: number,
): BomLine[] {
  const lines: BomLine[] = [];
  const panelUnit = panelWatt === 450 ? 165 : 148;
  lines.push({
    item: `Tier-1 ${panelWatt}W panel`,
    qty: panelCount,
    unit: "panel",
    unitPrice: panelUnit,
    total: panelCount * panelUnit,
  });
  const invUnit = intBetween(rng, 780, 1450);
  lines.push({ item: `${inverter} hybrid inverter`, qty: 1, unit: "unit", unitPrice: invUnit, total: invUnit });
  if (batteryKwh > 0) {
    const batUnit = batteryKwh === 10.4 ? 3400 : 1850;
    lines.push({ item: `${batteryKwh} kWh battery`, qty: 1, unit: "unit", unitPrice: batUnit, total: batUnit });
  }
  const mount = panelCount * 42;
  lines.push({ item: "Mounting rail & clamps", qty: panelCount, unit: "set", unitPrice: 42, total: mount });
  const protect = intBetween(rng, 240, 420);
  lines.push({ item: "DC/AC cabling & isolators", qty: 1, unit: "lot", unitPrice: protect, total: protect });
  const used = lines.reduce((s, l) => s + l.total, 0);
  const install = Math.max(900, value - used);
  lines.push({ item: "Installation & commissioning", qty: 1, unit: "job", unitPrice: install, total: install });
  return lines;
}

function makeProject(i: number): Project {
  const rng = mulberry32(1000 + i * 7);
  const stage = STAGE_PLAN[i];
  const stageIndex = STAGES.indexOf(stage);
  const commercial = i === 11 || i === 27; // a couple of commercial jobs
  const first = pick(rng, FIRST_NAMES);
  const last = pick(rng, SURNAMES);
  const customer = commercial
    ? pick(rng, ["Glenmore Retail Park", "Harbour View Medical Centre"])
    : `${first} ${last}`;
  const loc = TOWNS[i % TOWNS.length];
  const systemKwp = commercial
    ? intBetween(rng, 20, 50) + 0.0
    : Math.round((3 + rng() * 5) * 10) / 10;
  const panelWatt = pick(rng, PANEL_WATT);
  const panelCount = Math.ceil((systemKwp * 1000) / panelWatt);
  const inverter = pick(rng, INVERTERS);
  const batteryKwh = commercial ? 0 : pick(rng, BATTERIES);
  const value = commercial
    ? intBetween(rng, 40000, 120000)
    : Math.round((6500 + rng() * 11500) / 50) * 50;
  // VERIFY: SEAI grant rates. Solar PV rates step down annually — not authoritative.
  const grantValue = commercial ? 0 : Math.min(1800, 700 * Math.min(2, systemKwp) + 200 * Math.max(0, Math.min(2, systemKwp - 2)));
  const badMprn = BAD_MPRN.has(i);
  const daysInStage = intBetween(rng, 1, stage === "Closed" ? 40 : 9);
  const rag: Rag = daysInStage > 6 && stageIndex < 10 ? (daysInStage > 8 ? "red" : "amber") : "green";
  const scheduledPlus = stageIndex >= STAGES.indexOf("Scheduled");
  const installedPlus = stageIndex >= STAGES.indexOf("Installed");
  const installOffset = installedPlus ? -intBetween(rng, 2, 30) : intBetween(rng, 1, 18);
  const num = String(101 + i);

  return {
    id: `PRJ-${1000 + i}`,
    ref: `TS-26-${num}`,
    customer,
    initials: initials(customer),
    town: loc.town,
    county: loc.county,
    address: `${intBetween(rng, 1, 84)} ${pick(rng, STREETS)}, ${loc.town}`,
    eircode: eircode(rng, loc.key),
    mprn: mprn(rng, badMprn),
    mprnValid: !badMprn,
    ber: commercial ? "C1" : pick(rng, BER_RATINGS),
    roofType: commercial ? "Flat felt" : pick(rng, ROOF_TYPES),
    systemKwp: Math.round(systemKwp * 10) / 10,
    panelWatt,
    panelCount,
    inverter,
    batteryKwh,
    value,
    grantValue: Math.round(grantValue),
    stage,
    stageIndex,
    owner: pick(rng, SALES_REPS),
    daysInStage,
    rag,
    commercial,
    createdDaysAgo: intBetween(rng, 6, 120),
    installDate: scheduledPlus ? daysFromNow(installOffset) : null,
    crew: scheduledPlus ? CREWS[i % CREWS.length] : null,
    depositPaid: stageIndex >= STAGES.indexOf("Deposit Paid"),
    balancePaid: stageIndex >= STAGES.indexOf("Grant Paid"),
    bom: buildBom(mulberry32(2000 + i * 3), panelCount, panelWatt, inverter, batteryKwh, value),
  };
}

export const PROJECTS: Project[] = Array.from({ length: 40 }, (_, i) => makeProject(i));

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export const ragTone: Record<Rag, "success" | "warning" | "danger"> = {
  green: "success",
  amber: "warning",
  red: "danger",
};

// Static class strings so Tailwind's JIT can see them (never build class names
// from template literals — they won't be generated).
export const ragDot: Record<Rag, string> = {
  green: "bg-success",
  amber: "bg-warning",
  red: "bg-danger",
};

export const ragLabel: Record<Rag, string> = {
  green: "On track",
  amber: "Watch",
  red: "At risk",
};

export const stageTone = (stage: Stage): "neutral" | "accent" | "success" => {
  if (stage === "Closed" || stage === "Grant Paid") return "success";
  if (stage === "New Lead") return "neutral";
  return "accent";
};

export { TODAY };
