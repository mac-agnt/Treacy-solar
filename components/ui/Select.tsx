import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "h-9 appearance-none rounded-[10px] border border-border bg-bg pl-3 pr-8 text-[13px] text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
          className,
        )}
      />
      <CaretDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}
