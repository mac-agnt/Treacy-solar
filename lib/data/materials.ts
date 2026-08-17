import { mulberry32, intBetween } from "./pools";
import { CREW_NAMES } from "./team";
import { ddmmyyyy, daysAgo } from "./format";

export type SkuCategory =
  | "Panels"
  | "Inverters"
  | "Batteries"
  | "Mounting"
  | "Cable"
  | "Protection";

export type Sku = {
  id: string;
  name: string;
  category: SkuCategory;
  unit: string;
  onHand: number;
  reorderAt: number;
};

export const SKUS: Sku[] = [
  { id: "PAN-440", name: "Tier-1 440W mono panel", category: "Panels", unit: "panel", onHand: 240, reorderAt: 120 },
  { id: "PAN-450", name: "Tier-1 450W mono panel", category: "Panels", unit: "panel", onHand: 96, reorderAt: 100 },
  { id: "INV-SE368", name: "SolarEdge 3.68kW inverter", category: "Inverters", unit: "unit", onHand: 5, reorderAt: 4 },
  { id: "INV-SE5", name: "SolarEdge 5kW inverter", category: "Inverters", unit: "unit", onHand: 3, reorderAt: 4 },
  { id: "INV-HW4", name: "Huawei 4kW inverter", category: "Inverters", unit: "unit", onHand: 6, reorderAt: 3 },
  { id: "INV-HW6", name: "Huawei 6kW inverter", category: "Inverters", unit: "unit", onHand: 2, reorderAt: 3 },
  { id: "INV-GE5", name: "GivEnergy 5kW hybrid", category: "Inverters", unit: "unit", onHand: 4, reorderAt: 3 },
  { id: "INV-SG5", name: "Sungrow 5kW hybrid", category: "Inverters", unit: "unit", onHand: 3, reorderAt: 3 },
  { id: "BAT-52", name: "5.2 kWh battery module", category: "Batteries", unit: "unit", onHand: 7, reorderAt: 4 },
  { id: "BAT-104", name: "10.4 kWh battery module", category: "Batteries", unit: "unit", onHand: 2, reorderAt: 3 },
  { id: "BAT-GE95", name: "GivEnergy 9.5 kWh battery", category: "Batteries", unit: "unit", onHand: 3, reorderAt: 2 },
  { id: "MNT-RAIL", name: "Mounting rail 4.2m", category: "Mounting", unit: "length", onHand: 420, reorderAt: 200 },
  { id: "MNT-MID", name: "Mid clamp", category: "Mounting", unit: "each", onHand: 1180, reorderAt: 400 },
  { id: "MNT-END", name: "End clamp", category: "Mounting", unit: "each", onHand: 540, reorderAt: 200 },
  { id: "MNT-HOOK", name: "Slate roof hook", category: "Mounting", unit: "each", onHand: 860, reorderAt: 300 },
  { id: "MNT-AFR", name: "Flat-roof A-frame", category: "Mounting", unit: "each", onHand: 74, reorderAt: 60 },
  { id: "CAB-DCR", name: "DC cable 6mm red", category: "Cable", unit: "metre", onHand: 1900, reorderAt: 800 },
  { id: "CAB-DCB", name: "DC cable 6mm black", category: "Cable", unit: "metre", onHand: 1740, reorderAt: 800 },
  { id: "CAB-AC", name: "AC cable 3-core 6mm", category: "Cable", unit: "metre", onHand: 620, reorderAt: 500 },
  { id: "CAB-EARTH", name: "Earth cable 16mm", category: "Cable", unit: "metre", onHand: 410, reorderAt: 300 },
  { id: "PRO-DCISO", name: "DC isolator", category: "Protection", unit: "each", onHand: 62, reorderAt: 40 },
  { id: "PRO-ACISO", name: "AC isolator", category: "Protection", unit: "each", onHand: 58, reorderAt: 40 },
  { id: "PRO-SPD", name: "Surge protection device", category: "Protection", unit: "each", onHand: 33, reorderAt: 30 },
  { id: "PRO-MCB", name: "Generation MCB", category: "Protection", unit: "each", onHand: 140, reorderAt: 60 },
  { id: "PRO-METER", name: "Generation meter", category: "Protection", unit: "each", onHand: 26, reorderAt: 20 },
];

export type Van = {
  crew: string;
  lastLoaded: string;
  panels: number;
  rail: number;
  clamps: number;
  isolators: number;
  cableMetres: number;
};

export const VANS: Van[] = CREW_NAMES.map((crew, i) => {
  const rng = mulberry32(17000 + i * 7);
  return {
    crew,
    lastLoaded: ddmmyyyy(daysAgo(intBetween(rng, 0, 4))),
    panels: intBetween(rng, 8, 26),
    rail: intBetween(rng, 10, 40),
    clamps: intBetween(rng, 40, 120),
    isolators: intBetween(rng, 2, 8),
    cableMetres: intBetween(rng, 60, 200),
  };
});

// Forward demand for the next three committed weeks (installs and key kit).
export type WeekDemand = {
  week: string;
  installs: number;
  panels: number;
  inverters: number;
  batteries: number;
};

export const FORWARD_DEMAND: WeekDemand[] = [
  { week: "Next week", installs: 11, panels: 284, inverters: 9, batteries: 4 },
  { week: "Week 2", installs: 9, panels: 232, inverters: 8, batteries: 3 },
  { week: "Week 3", installs: 12, panels: 306, inverters: 11, batteries: 5 },
];

// Purchase requirements = committed next-week demand vs total on hand.
export type Requirement = {
  sku: string;
  name: string;
  required: number;
  onHand: number;
  shortfall: number;
};

export const REQUIREMENTS: Requirement[] = [
  { sku: "PAN-440", name: "Tier-1 440W panel", required: 284, onHand: 240, shortfall: 44 },
  { sku: "INV-SE5", name: "SolarEdge 5kW inverter", required: 9, onHand: 3, shortfall: 6 },
  { sku: "BAT-104", name: "10.4 kWh battery", required: 4, onHand: 2, shortfall: 2 },
  { sku: "MNT-AFR", name: "Flat-roof A-frame", required: 68, onHand: 74, shortfall: 0 },
  { sku: "PRO-METER", name: "Generation meter", required: 11, onHand: 26, shortfall: 0 },
];

export const skuCategoryTone: Record<SkuCategory, "neutral" | "accent"> = {
  Panels: "accent",
  Inverters: "accent",
  Batteries: "accent",
  Mounting: "neutral",
  Cable: "neutral",
  Protection: "neutral",
};
