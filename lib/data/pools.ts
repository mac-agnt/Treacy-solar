// Deterministic pseudo-random source + Irish data pools.
// Seeded so the dataset is stable across builds and identical on every render —
// no Math.random at import time.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function initials(name: string): string {
  return name
    .replace(/^(Ní|O'|Mc|Mac)/, "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const FIRST_NAMES = [
  "Aoife", "Cormac", "Sinéad", "Pádraig", "Niamh", "Declan", "Órla", "Eoin",
  "Ciarán", "Aisling", "Fionn", "Saoirse", "Ruairí", "Méabh", "Darragh",
  "Clíodhna", "Oisín", "Gráinne", "Tadhg", "Róisín", "Cian", "Aoibhinn",
  "Fiachra", "Nuala", "Lorcan", "Sadhbh", "Colm", "Deirdre", "Killian", "Bríd",
];

export const SURNAMES = [
  "Ní Bhriain", "Dunne", "Kavanagh", "Molloy", "Byrne", "Fitzgerald", "Sheehan",
  "Gallagher", "O'Sullivan", "Doherty", "McCarthy", "Nolan", "Brennan", "Kelly",
  "Murphy", "Walsh", "Ryan", "O'Connor", "Lynch", "Boyle", "Maguire", "Healy",
  "Clarke", "Flynn", "Quinn", "Doyle", "Kennedy", "Whelan",
];

// town, county, eircode routing key
export const TOWNS: { town: string; county: string; key: string }[] = [
  { town: "Naas", county: "Co. Kildare", key: "W91" },
  { town: "Clonakilty", county: "Co. Cork", key: "P85" },
  { town: "Oranmore", county: "Co. Galway", key: "H91" },
  { town: "Ashbourne", county: "Co. Meath", key: "A84" },
  { town: "Greystones", county: "Co. Wicklow", key: "A63" },
  { town: "Nenagh", county: "Co. Tipperary", key: "E45" },
  { town: "Malahide", county: "Co. Dublin", key: "K36" },
  { town: "Tramore", county: "Co. Waterford", key: "X91" },
  { town: "Midleton", county: "Co. Cork", key: "T45" },
  { town: "Portlaoise", county: "Co. Laois", key: "R32" },
  { town: "Mullingar", county: "Co. Westmeath", key: "N91" },
  { town: "Ennis", county: "Co. Clare", key: "V95" },
  { town: "Carrigaline", county: "Co. Cork", key: "T12" },
  { town: "Swords", county: "Co. Dublin", key: "K67" },
  { town: "Bray", county: "Co. Wicklow", key: "A98" },
  { town: "Athlone", county: "Co. Westmeath", key: "N37" },
  { town: "Tullamore", county: "Co. Offaly", key: "R35" },
  { town: "Gorey", county: "Co. Wexford", key: "Y25" },
  { town: "Skerries", county: "Co. Dublin", key: "K34" },
  { town: "Ballina", county: "Co. Mayo", key: "F26" },
  { town: "Letterkenny", county: "Co. Donegal", key: "F92" },
  { town: "Kilkenny", county: "Co. Kilkenny", key: "R95" },
  { town: "Navan", county: "Co. Meath", key: "C15" },
  { town: "Maynooth", county: "Co. Kildare", key: "W23" },
  { town: "Wexford", county: "Co. Wexford", key: "Y35" },
];

export const STREETS = [
  "Oaklawn", "Beechwood Close", "The Paddocks", "Riverside Walk", "Hillcrest",
  "Sea View Terrace", "Woodbine Avenue", "Meadow Court", "Chapel Lane",
  "Ard na Gréine", "Rathmore Park", "Glensilva", "The Grove", "Priory Grove",
  "Castle Heights", "Fern Hill", "Ashfield Drive", "Rockfield", "Cois Abhann",
];

const EIRCODE_CHARS = "ACDEFHKNPRTVWXY0123456789";

export function eircode(rng: () => number, key: string): string {
  let tail = "";
  for (let i = 0; i < 4; i++) tail += EIRCODE_CHARS[Math.floor(rng() * EIRCODE_CHARS.length)];
  return `${key} ${tail}`;
}

export function mprn(rng: () => number, malformed = false): string {
  // 11-digit MPRN starting with 10. A malformed one is deliberately short/long.
  let s = "10";
  const len = malformed ? (rng() > 0.5 ? 10 : 12) : 11;
  while (s.length < len) s += Math.floor(rng() * 10);
  return s;
}

export const INVERTERS = ["SolarEdge", "Huawei", "GivEnergy", "Sungrow"];
export const PANEL_WATT = [440, 450];
export const BATTERIES = [0, 5.2, 10.4]; // 0 = no battery
export const ROOF_TYPES = ["Slate", "Concrete tile", "Flat felt", "Standing seam"];
export const BER_RATINGS = [
  "A2", "A3", "B1", "B2", "B3", "C1", "C1", "C2", "C2", "C3", "C3",
  "D1", "D1", "D2", "D2", "E1", "E2", "F", "G",
]; // weighted toward C/D

export const SALES_REPS = [
  "Aoife Ní Bhriain",
  "Cormac Dunne",
  "Sinéad Kavanagh",
  "Pádraig Molloy",
];
