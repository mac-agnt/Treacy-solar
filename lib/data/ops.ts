import { PROJECTS, STAGES, type Stage } from "./projects";
import { mulberry32, intBetween } from "./pools";

export const WIP_BY_STAGE: { stage: Stage; count: number }[] = STAGES.map((stage) => ({
  stage,
  count: PROJECTS.filter((p) => p.stage === stage).length,
}));

// Average days a project sits in each stage. The handoff after Contract Signed
// is the deliberate bottleneck — that gap is 100% manual re-keying into Scoop.
export const AVG_DAYS_IN_STAGE: { stage: string; days: number; bottleneck: boolean }[] = [
  { stage: "New Lead → Quoted", days: 1.8, bottleneck: false },
  { stage: "Quoted → Contract Sent", days: 2.4, bottleneck: false },
  { stage: "Contract Sent → Signed", days: 3.0, bottleneck: false },
  { stage: "Contract Signed → Project Created", days: 3.4, bottleneck: true },
  { stage: "Scheduled → Installed", days: 2.1, bottleneck: false },
  { stage: "Installed → Certs Issued", days: 2.7, bottleneck: false },
  { stage: "Certs → Grant Submitted", days: 1.9, bottleneck: false },
  { stage: "Grant Submitted → Paid", days: 2.5, bottleneck: false },
];

export const BOTTLENECK = AVG_DAYS_IN_STAGE.find((s) => s.bottleneck)!;

export type WeekThroughput = { week: string; installs: number };

export const THROUGHPUT: WeekThroughput[] = Array.from({ length: 12 }, (_, i) => {
  const rng = mulberry32(40000 + i * 7);
  // Trailing 12 weeks, trending up ("very, very busy for 9 months").
  const base = 6 + Math.floor(i * 0.6);
  return { week: `W${i + 1}`, installs: base + intBetween(rng, -1, 3) };
});

export type CapacityWeek = { week: string; capacity: number; committed: number };

export const CAPACITY: CapacityWeek[] = [
  { week: "Next week", capacity: 12, committed: 11 },
  { week: "Week 2", capacity: 12, committed: 9 },
  { week: "Week 3", capacity: 12, committed: 12 },
  { week: "Week 4", capacity: 12, committed: 7 },
];

// Human re-keying events the platform has removed (cumulative demo figure).
export const HANDOFFS_REMOVED = 148;
export const HANDOFF_HOURS_SAVED = Math.round(HANDOFFS_REMOVED * 3.4 * 8) / 10; // ~ per-event admin cost
