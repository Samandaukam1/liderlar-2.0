import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CandidateAdabiyotXCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-[9.75rem] shrink-0 overflow-hidden rounded-[1.35rem] border border-brand-soft bg-paper shadow-card sm:w-48 lg:w-[13.25rem]",
        className
      )}
    >
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-5 h-3 w-4/5" />
      </div>
    </div>
  );
}
