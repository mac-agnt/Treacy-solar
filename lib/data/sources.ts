// Source chips — where each field would flow from in the real stack.
// Rendered with the existing Badge component (neutral tone) so they read as
// quiet system-of-origin tags, not decoration.

export type SourceKey =
  | "HubSpot"
  | "Scoop"
  | "Sage"
  | "SEAI"
  | "DSB"
  | "WhatsApp"
  | "Aircall"
  | "Safe Electric"
  | "Stock Control";

export const ALL_SOURCES: SourceKey[] = [
  "HubSpot",
  "Scoop",
  "Sage",
  "SEAI",
  "DSB",
  "WhatsApp",
  "Aircall",
  "Safe Electric",
  "Stock Control",
];
