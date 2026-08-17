import type { Icon } from "@phosphor-icons/react";
import {
  Sparkle,
  Kanban,
  FileText,
  SealCheck,
  CalendarBlank,
  Package,
  CurrencyEur,
  HeartStraight,
  HouseLine,
  ChartLineUp,
  Users,
  Gear,
} from "@phosphor-icons/react/dist/ssr";

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
  slug: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/", icon: Sparkle, slug: "home" },
  { label: "Projects", href: "/projects", icon: Kanban, slug: "projects" },
  { label: "Documents", href: "/documents", icon: FileText, slug: "documents" },
  { label: "Compliance", href: "/compliance", icon: SealCheck, slug: "compliance" },
  { label: "Schedule", href: "/schedule", icon: CalendarBlank, slug: "schedule" },
  { label: "Materials", href: "/materials", icon: Package, slug: "materials" },
  { label: "Payments", href: "/payments", icon: CurrencyEur, slug: "payments" },
  { label: "Aftercare", href: "/aftercare", icon: HeartStraight, slug: "aftercare" },
  { label: "Properties", href: "/properties", icon: HouseLine, slug: "properties" },
  { label: "Ops Health", href: "/ops", icon: ChartLineUp, slug: "ops" },
  { label: "Team", href: "/team", icon: Users, slug: "team" },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Gear, slug: "settings" },
];

export const allNav = [...primaryNav, ...secondaryNav];
