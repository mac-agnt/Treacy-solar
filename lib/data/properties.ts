import {
  mulberry32, pick, intBetween, initials, eircode, mprn,
  FIRST_NAMES, SURNAMES, TOWNS, STREETS, BER_RATINGS,
} from "./pools";
import { MEASURES, type MeasureName } from "./measures";
import { ddmmyyyy, daysAgo } from "./format";

export type InstalledMeasure = {
  name: MeasureName;
  date: string;
  grant: number;
  spend: number;
};

export type Property = {
  id: string;
  owner: string;
  initials: string;
  address: string;
  town: string;
  county: string;
  eircode: string;
  mprn: string;
  berBefore: string;
  berAfter: string;
  installed: InstalledMeasure[];
  eligible: MeasureName[];
  grantDrawn: number;
  totalSpend: number;
  ltv: number;
  multiMeasure: boolean;
};

const ALL_MEASURE_NAMES = MEASURES.map((m) => m.name);

function berImprove(before: string, steps: number): string {
  const order = ["G", "F", "E2", "E1", "D2", "D1", "C3", "C2", "C1", "B3", "B2", "B1", "A3", "A2", "A1"];
  const idx = order.indexOf(before);
  return order[Math.min(order.length - 1, (idx < 0 ? 4 : idx) + steps)];
}

function build(): Property[] {
  const out: Property[] = [];
  for (let i = 0; i < 120; i++) {
    const rng = mulberry32(30000 + i * 3);
    const owner = `${pick(rng, FIRST_NAMES)} ${pick(rng, SURNAMES)}`;
    const loc = TOWNS[i % TOWNS.length];
    // ~35 carry more than one measure.
    const multi = i % 120 < 35 ? rng() < 0.85 : rng() < 0.08;
    const count = multi ? intBetween(rng, 2, 4) : 1;
    // Always include Solar PV as the anchor measure, then add others.
    const names: MeasureName[] = ["Solar PV"];
    while (names.length < count) {
      const cand = pick(rng, ALL_MEASURE_NAMES);
      if (!names.includes(cand)) names.push(cand);
    }
    const installed: InstalledMeasure[] = names.map((name, k) => {
      const m = MEASURES.find((x) => x.name === name)!;
      return {
        name,
        date: ddmmyyyy(daysAgo(intBetween(rng, 30, 900) - k * 40)),
        grant: m.grant,
        spend: m.typicalSpend,
      };
    });
    const eligible = ALL_MEASURE_NAMES.filter((n) => !names.includes(n));
    const grantDrawn = installed.reduce((s, m) => s + m.grant, 0);
    const totalSpend = installed.reduce((s, m) => s + m.spend, 0);
    const berBefore = pick(rng, BER_RATINGS);
    out.push({
      id: `PROP-${6000 + i}`,
      owner,
      initials: initials(owner),
      address: `${intBetween(rng, 1, 84)} ${pick(rng, STREETS)}, ${loc.town}`,
      town: loc.town,
      county: loc.county,
      eircode: eircode(rng, loc.key),
      mprn: mprn(rng),
      berBefore,
      berAfter: berImprove(berBefore, installed.length + 1),
      installed,
      eligible,
      grantDrawn,
      totalSpend,
      ltv: totalSpend,
      multiMeasure: installed.length > 1,
    });
  }
  return out;
}

export const PROPERTIES: Property[] = build();
export const MULTI_MEASURE_COUNT = PROPERTIES.filter((p) => p.multiMeasure).length;
export const TOTAL_GRANT_DRAWN = PROPERTIES.reduce((s, p) => s + p.grantDrawn, 0);
export const TOTAL_LTV = PROPERTIES.reduce((s, p) => s + p.ltv, 0);

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}
