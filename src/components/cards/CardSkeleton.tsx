export function CardSkeleton() {
  return (
    <div data-testid="card-skeleton" aria-hidden className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
      <div className="skeleton aspect-[16/10]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-5 w-11/12 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="flex items-center justify-between pt-3">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export const GRID_CLASS = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} role="status" aria-live="polite">
      <span className="sr-only">Loading content</span>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
