import { CandidateAdabiyotXCardSkeleton } from "@/components/profile/candidate-adabiyotx-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Lider profili yuklanmoqda">
      <section className="bg-navy-dark">
        <div className="mx-auto flex min-h-[32rem] max-w-7xl items-end px-5 py-10 sm:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[13rem_1fr_21rem] lg:items-end">
            <div className="hidden space-y-3 lg:block">
              <Skeleton className="h-11 w-11 bg-white/10" />
              <Skeleton className="h-3 w-28 bg-white/10" />
            </div>
            <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[20rem] rounded-[1.75rem] bg-white/10" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-5/6 bg-white/10 lg:ml-auto" />
              <Skeleton className="h-px w-full bg-white/15" />
              <Skeleton className="h-4 w-1/2 bg-white/10 lg:ml-auto" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <main className="min-w-0 space-y-12">
          <section>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-6 h-7 w-4/5" />
            <Skeleton className="mt-3 h-7 w-2/3" />
            <div className="mt-8 space-y-3 border-t border-border-soft pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </section>

          <section>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-44" />
            <div className="no-scrollbar mt-4 flex gap-4 overflow-hidden pb-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <CandidateAdabiyotXCardSkeleton key={index} />
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden lg:block">
          <Skeleton className="h-72 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  );
}
