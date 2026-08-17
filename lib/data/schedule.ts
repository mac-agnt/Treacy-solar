import { PROJECTS, STAGES } from "./projects";
import { STAFF, CREW_NAMES } from "./team";
import { mulberry32, intBetween } from "./pools";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export type CrewRow = { crew: string; discipline: "Electrical" | "Roofing"; label: string };

export const CREW_ROWS: CrewRow[] = CREW_NAMES.flatMap((crew) => [
  { crew, discipline: "Electrical" as const, label: `${crew} — Electrical` },
  { crew, discipline: "Roofing" as const, label: `${crew} — Roofing` },
]);

export type Job = {
  id: string;
  projectId: string;
  customer: string;
  county: string;
  kwp: number;
  crew: string;
  discipline: "Electrical" | "Roofing";
  week: number; // 0..2
  day: number; // 0..4
  lead: string;
  materialsReady: boolean;
  travelMins: number;
};

function crewLead(crew: string, discipline: "Electrical" | "Roofing"): string {
  const role = discipline === "Electrical" ? "Lead electrician" : "Lead roofer";
  return STAFF.find((s) => s.crew === crew && s.role === role)?.name ?? "Unassigned";
}

function build(): Job[] {
  const scheduled = PROJECTS.filter(
    (p) => p.stageIndex >= STAGES.indexOf("Scheduled") && p.stageIndex <= STAGES.indexOf("Installed"),
  );
  const jobs: Job[] = [];
  scheduled.forEach((p, i) => {
    const rng = mulberry32(15000 + i * 9);
    const crew = p.crew ?? CREW_NAMES[i % CREW_NAMES.length];
    const week = i % 3;
    const day = intBetween(rng, 0, 4);
    (["Electrical", "Roofing"] as const).forEach((discipline) => {
      jobs.push({
        id: `JOB-${p.id}-${discipline[0]}`,
        projectId: p.id,
        customer: p.customer,
        county: p.county,
        kwp: p.systemKwp,
        crew,
        discipline,
        week,
        day,
        lead: crewLead(crew, discipline),
        materialsReady: rng() > 0.25,
        travelMins: intBetween(rng, 12, 65),
      });
    });
  });
  return jobs;
}

export const JOBS: Job[] = build();

export type Standby = {
  projectId: string;
  customer: string;
  county: string;
  kwp: number;
  bomMatch: number; // % match to a typical cancelled job's BOM
  note: string;
};

export const STANDBY: Standby[] = PROJECTS.filter(
  (p) =>
    p.stageIndex >= STAGES.indexOf("Contract Signed") &&
    p.stageIndex < STAGES.indexOf("Scheduled") &&
    !p.commercial,
)
  .slice(0, 8)
  .map((p, i) => {
    const rng = mulberry32(16000 + i * 5);
    const match = intBetween(rng, 72, 99);
    return {
      projectId: p.id,
      customer: p.customer,
      county: p.county,
      kwp: p.systemKwp,
      bomMatch: match,
      note: match >= 90 ? "Same BOM — materials already in the van" : "Close BOM match — minor pick change",
    };
  });

export function jobsFor(week: number, row: CrewRow): Job[] {
  return JOBS.filter((j) => j.week === week && j.crew === row.crew && j.discipline === row.discipline);
}
