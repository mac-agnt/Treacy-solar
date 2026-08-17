import { PROJECTS, STAGES, type Project } from "./projects";
import { mulberry32, intBetween } from "./pools";
import { daysAgo, ddmmyyyy } from "./format";

export const GRANT_STAGES = [
  "Application Prepared",
  "Submitted to SEAI",
  "Approved",
  "BER Assessment",
  "Claim Submitted",
  "Paid",
] as const;
export type GrantStage = (typeof GRANT_STAGES)[number];

export type GrantRecord = {
  projectId: string;
  ref: string;
  customer: string;
  county: string;
  grantValue: number;
  stage: GrantStage;
};

// Map a project's overall stage onto the grant sub-pipeline.
function grantStageFor(p: Project): GrantStage | null {
  if (p.commercial) return null;
  const s = (n: (typeof STAGES)[number]) => STAGES.indexOf(n);
  if (p.stageIndex < s("Deposit Paid")) return null;
  if (p.stageIndex < s("Scheduled")) return "Application Prepared";
  if (p.stageIndex < s("Installed")) return "Submitted to SEAI";
  if (p.stageIndex < s("Certs Issued")) return "Approved";
  if (p.stageIndex < s("Grant Submitted")) return "BER Assessment";
  if (p.stageIndex < s("Grant Paid")) return "Claim Submitted";
  return "Paid";
}

export const GRANTS: GrantRecord[] = PROJECTS.map((p) => {
  const stage = grantStageFor(p);
  if (!stage) return null;
  return {
    projectId: p.id,
    ref: p.ref,
    customer: p.customer,
    county: p.county,
    grantValue: p.grantValue,
    stage,
  };
}).filter((g): g is GrantRecord => g !== null);

// Projects the simulated SEAI remittance report would reconcile to Paid — any
// grant that is installed and claimed but not yet marked paid.
const CLAIMABLE: GrantStage[] = ["Approved", "BER Assessment", "Claim Submitted"];
export const REMITTANCE_MATCHES = GRANTS.filter((g) => CLAIMABLE.includes(g.stage));
export const REMITTANCE_TOTAL = REMITTANCE_MATCHES.reduce((s, g) => s + g.grantValue, 0);
export const REMITTANCE_IDS = new Set(REMITTANCE_MATCHES.map((g) => g.projectId));

export type DsbRecord = {
  projectId: string;
  ref: string;
  customer: string;
  permitRef: string;
  submitted: string | null;
  status: "Not submitted" | "Pending" | "Registered";
  daysPending: number;
};

export const DSB_REGISTER: DsbRecord[] = PROJECTS.filter(
  (p) => p.stageIndex >= STAGES.indexOf("Installed"),
).map((p, i) => {
  const rng = mulberry32(7000 + i * 5);
  const registered = p.stageIndex >= STAGES.indexOf("Grant Submitted");
  const days = registered ? 0 : intBetween(rng, 2, 21);
  return {
    projectId: p.id,
    ref: p.ref,
    customer: p.customer,
    permitRef: `DSB-${intBetween(rng, 200000, 299999)}`,
    submitted: ddmmyyyy(daysAgo(days + intBetween(rng, 1, 4))),
    status: registered ? "Registered" : "Pending",
    daysPending: days,
  };
});

export type MprnRecord = {
  projectId: string;
  ref: string;
  customer: string;
  mprn: string;
  valid: boolean;
  reason: string;
};

export const MPRN_REGISTER: MprnRecord[] = PROJECTS.map((p) => ({
  projectId: p.id,
  ref: p.ref,
  customer: p.customer,
  mprn: p.mprn,
  valid: p.mprnValid && /^\d{11}$/.test(p.mprn),
  reason: p.mprnValid && /^\d{11}$/.test(p.mprn) ? "11-digit format OK" : `${p.mprn.length} digits — expected 11`,
}));

export const MPRN_ERRORS = MPRN_REGISTER.filter((m) => !m.valid);
export const GRANT_IN_FLIGHT = GRANTS.filter((g) => g.stage !== "Paid").reduce((s, g) => s + g.grantValue, 0);
