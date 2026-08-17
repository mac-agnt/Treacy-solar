// Retrofit measure catalogue — the spine of the one-stop-shop expansion.
// Each measure carries its grant scheme, the trade that delivers it, and a
// typical duration. Adding a measure here makes it available to every module
// that reasons about measures — the platform grows without a rebuild.

export type MeasureName =
  | "Solar PV"
  | "Heat Pump"
  | "Attic Insulation"
  | "Cavity Wall Insulation"
  | "External Wall Insulation"
  | "Floor Insulation"
  | "Windows & Doors";

export type Measure = {
  name: MeasureName;
  scheme: string;
  trade: string;
  // VERIFY: SEAI grant rates. Indicative per-measure figures, step down annually.
  grant: number;
  typicalSpend: number;
  durationDays: number;
};

export const MEASURES: Measure[] = [
  { name: "Solar PV", scheme: "SEAI Solar PV Grant", trade: "Electrical + Roofing", grant: 1800, typicalSpend: 9500, durationDays: 1 },
  { name: "Heat Pump", scheme: "SEAI Heat Pump Grant", trade: "Plumbing + Electrical", grant: 6500, typicalSpend: 13500, durationDays: 3 },
  { name: "Attic Insulation", scheme: "SEAI Better Energy Homes", trade: "Insulation", grant: 1500, typicalSpend: 2200, durationDays: 1 },
  { name: "Cavity Wall Insulation", scheme: "SEAI Better Energy Homes", trade: "Insulation", grant: 1700, typicalSpend: 2600, durationDays: 1 },
  { name: "External Wall Insulation", scheme: "SEAI Better Energy Homes", trade: "Insulation + Rendering", grant: 8000, typicalSpend: 24000, durationDays: 8 },
  { name: "Floor Insulation", scheme: "SEAI Better Energy Homes", trade: "Insulation", grant: 3500, typicalSpend: 5200, durationDays: 2 },
  { name: "Windows & Doors", scheme: "SEAI Better Energy Homes", trade: "Glazing", grant: 4000, typicalSpend: 9800, durationDays: 3 },
];

export function measure(name: MeasureName): Measure {
  return MEASURES.find((m) => m.name === name)!;
}
