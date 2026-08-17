import {
  mulberry32, pick, intBetween, initials,
  FIRST_NAMES, SURNAMES, TOWNS, BER_RATINGS,
} from "./pools";
import { MEASURES, type MeasureName } from "./measures";
import { ddmmyyyy, daysAgo } from "./format";

export const JOURNEY_STEPS = [
  "Day 7 check-in",
  "Day 30 performance check",
  "Month 6 service reminder",
  "Year 1 warranty review",
  "Year 2 next-measure offer",
] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

// Measures we would upsell into an existing solar customer.
const UPSELL: MeasureName[] = [
  "Heat Pump",
  "Attic Insulation",
  "Cavity Wall Insulation",
  "Windows & Doors",
  "Floor Insulation",
];

export type AftercareCustomer = {
  id: string;
  name: string;
  initials: string;
  town: string;
  county: string;
  installed: string;
  ber: string;
  journey: JourneyStep;
  contacted: boolean;
  opportunity: MeasureName | null;
  opportunityGrant: number;
  opportunityValue: number;
  score: number;
};

function build(): AftercareCustomer[] {
  const out: AftercareCustomer[] = [];
  for (let i = 0; i < 412; i++) {
    const rng = mulberry32(20000 + i * 3);
    const name = `${pick(rng, FIRST_NAMES)} ${pick(rng, SURNAMES)}`;
    const loc = TOWNS[i % TOWNS.length];
    const ber = pick(rng, BER_RATINGS);
    const monthsSince = intBetween(rng, 1, 26);
    const journey = JOURNEY_STEPS[Math.min(JOURNEY_STEPS.length - 1, Math.floor(monthsSince / 5))];
    // Lower BER + older property -> stronger next-measure case.
    const berRank = "ABCDEFG".indexOf(ber[0]);
    const hasOpp = rng() < 0.44;
    const measureName = hasOpp ? UPSELL[Math.floor(rng() * UPSELL.length)] : null;
    const m = measureName ? MEASURES.find((x) => x.name === measureName)! : null;
    out.push({
      id: `AC-${4000 + i}`,
      name,
      initials: initials(name),
      town: loc.town,
      county: loc.county,
      installed: ddmmyyyy(daysAgo(monthsSince * 30 + intBetween(rng, 0, 25))),
      ber,
      journey,
      contacted: false, // "0 contacted since handover" — the whole point
      opportunity: measureName,
      opportunityGrant: m?.grant ?? 0,
      opportunityValue: m?.typicalSpend ?? 0,
      score: Math.min(99, 40 + berRank * 8 + (m ? 10 : 0) + intBetween(rng, 0, 12)),
    });
  }
  return out;
}

export const AFTERCARE: AftercareCustomer[] = build();
export const COMPLETED_COUNT = AFTERCARE.length;
export const OPPORTUNITIES = AFTERCARE.filter((c) => c.opportunity);
export const PIPELINE_VALUE = OPPORTUNITIES.reduce((s, c) => s + c.opportunityValue, 0);

export type Referral = {
  id: string;
  advocate: string;
  referred: string;
  status: "Asked" | "Referred" | "Converted";
  county: string;
};

export const REFERRALS: Referral[] = Array.from({ length: 12 }, (_, i) => {
  const rng = mulberry32(21000 + i * 5);
  const status = (["Asked", "Asked", "Referred", "Referred", "Converted"] as const)[intBetween(rng, 0, 4)];
  return {
    id: `REF-${500 + i}`,
    advocate: `${pick(rng, FIRST_NAMES)} ${pick(rng, SURNAMES)}`,
    referred: `${pick(rng, FIRST_NAMES)} ${pick(rng, SURNAMES)}`,
    status,
    county: TOWNS[i % TOWNS.length].county,
  };
});

export const REFERRALS_CONVERTED = REFERRALS.filter((r) => r.status === "Converted").length;
