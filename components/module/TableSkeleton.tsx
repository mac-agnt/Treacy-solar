export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-4 border-b border-border-soft px-5 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-3 flex-1 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border-soft px-5 py-4 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-3.5 flex-1 rounded-full" style={{ opacity: 1 - r * 0.09 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
