import { cn } from "@/lib/cn";

export function KeyValueGrid({
  items,
  cols = 2,
}: {
  items: { label: string; value: React.ReactNode; tone?: "default" | "danger" }[];
  cols?: 2 | 3;
}) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4", cols === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-[11.5px] font-medium uppercase tracking-[0.05em] text-ink-faint">{it.label}</dt>
          <dd
            className={cn(
              "mt-1 text-[13.5px] font-medium break-words",
              it.tone === "danger" ? "text-danger" : "text-ink",
            )}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
