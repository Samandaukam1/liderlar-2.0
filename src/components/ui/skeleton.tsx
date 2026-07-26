import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} aria-hidden />;
}

export function LeaderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-soft bg-paper shadow-card">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-soft bg-paper p-6 shadow-card">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}
