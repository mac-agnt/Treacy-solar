import { PROJECTS, STAGES } from "./projects";
import { mulberry32, intBetween, pick } from "./pools";

export const DOC_TYPES = [
  "Quotation",
  "Contract",
  "Deposit invoice",
  "SEAI grant declaration",
  "MPRN confirmation",
  "Electrical certificate",
  "DSB permit form",
  "Handover pack",
  "Warranty certificate",
  "Final invoice",
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_STATUSES = ["Draft", "Sent", "Viewed", "Signed", "Overdue"] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

export type ChannelKey = "WhatsApp" | "email";

export type DocRecord = {
  id: string;
  projectId: string;
  ref: string;
  customer: string;
  type: DocType;
  status: DocStatus;
  channel: ChannelKey;
  owner: string;
  daysOutstanding: number;
  chasesSent: number;
  nextChase: string | null;
  sentDaysAgo: number | null;
};

export const docStatusTone: Record<DocStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  Draft: "neutral",
  Sent: "accent",
  Viewed: "warning",
  Signed: "success",
  Overdue: "danger",
};

// Which doc types are live at a given stage index.
function docsForStage(stageIndex: number): DocType[] {
  const s = (name: (typeof STAGES)[number]) => STAGES.indexOf(name);
  const out: DocType[] = [];
  if (stageIndex >= s("Quoted")) out.push("Quotation");
  if (stageIndex >= s("Contract Sent")) out.push("Contract");
  if (stageIndex >= s("Deposit Paid")) out.push("Deposit invoice");
  if (stageIndex >= s("Scheduled")) out.push("MPRN confirmation", "SEAI grant declaration");
  if (stageIndex >= s("Installed")) out.push("DSB permit form");
  if (stageIndex >= s("Certs Issued")) out.push("Electrical certificate", "Handover pack");
  if (stageIndex >= s("Grant Paid")) out.push("Warranty certificate", "Final invoice");
  return out;
}

function build(): DocRecord[] {
  const out: DocRecord[] = [];
  let n = 0;
  for (let pi = 0; pi < PROJECTS.length && out.length < 60; pi++) {
    const p = PROJECTS[pi];
    const rng = mulberry32(5000 + pi * 11);
    const types = docsForStage(p.stageIndex);
    for (const type of types) {
      if (out.length >= 60) break;
      const roll = rng();
      let status: DocStatus;
      // Latest doc for a stage tends to still be in flight; older ones signed.
      if (type === "Quotation" && p.stageIndex >= STAGES.indexOf("Contract Signed")) status = "Signed";
      else if (roll < 0.16) status = "Overdue";
      else if (roll < 0.34) status = "Sent";
      else if (roll < 0.5) status = "Viewed";
      else if (roll < 0.68) status = "Draft";
      else status = "Signed";

      const overdue = status === "Overdue";
      const settled = status === "Signed";
      const daysOutstanding = settled ? 0 : overdue ? intBetween(rng, 10, 24) : intBetween(rng, 1, 8);
      const chasesSent = overdue ? intBetween(rng, 1, 3) : status === "Draft" ? 0 : intBetween(rng, 0, 1);
      const nextChaseDay = pick(rng, [2, 5, 9]);
      out.push({
        id: `DOC-${2000 + n}`,
        projectId: p.id,
        ref: p.ref,
        customer: p.customer,
        type,
        status,
        channel: rng() > 0.5 ? "WhatsApp" : "email",
        owner: p.owner,
        daysOutstanding,
        chasesSent,
        nextChase: settled ? null : `Day ${nextChaseDay}`,
        sentDaysAgo: status === "Draft" ? null : daysOutstanding,
      });
      n++;
    }
  }
  return out;
}

export const DOCUMENTS: DocRecord[] = build();

export const OUTSTANDING = DOCUMENTS.filter((d) => d.status !== "Signed").length;
export const OVERDUE = DOCUMENTS.filter((d) => d.status === "Overdue").length;
