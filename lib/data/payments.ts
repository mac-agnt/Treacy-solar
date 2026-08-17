import { PROJECTS, STAGES, type Project } from "./projects";
import { mulberry32, intBetween } from "./pools";
import { ddmmyyyy, daysAgo } from "./format";

export const PAY_STAGES = [
  "Deposit Due",
  "Deposit Paid",
  "Balance Due",
  "Balance Paid",
  "Overdue",
] as const;
export type PayStage = (typeof PAY_STAGES)[number];

export type SageStatus = "Synced" | "Pending" | "Error";

export type Payment = {
  projectId: string;
  ref: string;
  customer: string;
  county: string;
  value: number;
  deposit: number;
  balance: number;
  grantOffset: number;
  stage: PayStage;
  raised: string;
  daysOverdue: number;
  sage: SageStatus;
};

function payStageFor(p: Project, overdue: boolean): PayStage {
  const s = (n: (typeof STAGES)[number]) => STAGES.indexOf(n);
  if (p.balancePaid) return "Balance Paid";
  if (overdue) return "Overdue";
  if (p.stageIndex >= s("Installed")) return "Balance Due";
  if (p.depositPaid) return "Deposit Paid";
  return "Deposit Due";
}

export const PAYMENTS: Payment[] = PROJECTS.filter(
  (p) => p.stageIndex >= STAGES.indexOf("Contract Signed"),
).map((p, i) => {
  const rng = mulberry32(9000 + i * 13);
  const deposit = Math.round(p.value * 0.5);
  const balance = p.value - deposit;
  const grantOffset = p.grantValue;
  const balanceDueStage = p.stageIndex >= STAGES.indexOf("Installed") && !p.balancePaid;
  const overdue = balanceDueStage && rng() < 0.3;
  const daysOverdue = overdue ? intBetween(rng, 8, 46) : 0;
  const sage: SageStatus =
    p.balancePaid ? "Synced" : rng() < 0.12 ? "Error" : rng() < 0.3 ? "Pending" : "Synced";
  return {
    projectId: p.id,
    ref: p.ref,
    customer: p.customer,
    county: p.county,
    value: p.value,
    deposit,
    balance,
    grantOffset,
    stage: payStageFor(p, overdue),
    raised: ddmmyyyy(daysAgo(intBetween(rng, 3, 60))),
    daysOverdue,
    sage,
  };
});

export const payStageTone: Record<PayStage, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  "Deposit Due": "neutral",
  "Deposit Paid": "accent",
  "Balance Due": "warning",
  "Balance Paid": "success",
  Overdue: "danger",
};

export const sageTone: Record<SageStatus, "success" | "warning" | "danger"> = {
  Synced: "success",
  Pending: "warning",
  Error: "danger",
};

export const TOTAL_OUTSTANDING = PAYMENTS.filter(
  (p) => p.stage !== "Balance Paid",
).reduce((s, p) => s + (p.stage === "Deposit Due" ? p.deposit : p.balance), 0);

export const OVERDUE_30 = PAYMENTS.filter((p) => p.daysOverdue >= 30).reduce(
  (s, p) => s + p.balance,
  0,
);

export const COLLECTED_THIS_MONTH = PAYMENTS.filter((p) => p.stage === "Balance Paid").reduce(
  (s, p) => s + p.value * 0.5,
  0,
);
