import { LeaderCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-10 w-64 animate-pulse rounded-md bg-navy/10" />
      <div className="mb-8 h-24 animate-pulse rounded-lg bg-navy/5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <LeaderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
