// Shared formatting helpers — Irish conventions (€, DD/MM/YYYY, kWp).

// Fixed "today" so the demo is deterministic and internally consistent.
export const TODAY = new Date(2026, 7, 17); // 17/08/2026

export function euro(n: number): string {
  return "€" + Math.round(n).toLocaleString("en-IE");
}

export function kwp(n: number): string {
  return n.toFixed(1) + " kWp";
}

export function ddmmyyyy(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function daysAgo(days: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d;
}

export function daysFromNow(days: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d;
}

export function relativeDays(d: Date): number {
  return Math.round((TODAY.getTime() - d.getTime()) / 86_400_000);
}
