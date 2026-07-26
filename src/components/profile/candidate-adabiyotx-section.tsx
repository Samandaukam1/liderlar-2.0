import { useId } from "react";
import type { PublicCandidateAdabiyotXItem } from "@/lib/types";
import { CandidateAdabiyotXRow } from "@/components/profile/candidate-adabiyotx-row";

export function CandidateAdabiyotXSection({
  title,
  items,
}: {
  title: string;
  items: PublicCandidateAdabiyotXItem[];
}) {
  const headingId = useId();
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 max-w-full overflow-hidden"
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-liderlar-blue">
            AdabiyotX
          </p>
          <h2
            id={headingId}
            className="mt-1 font-display text-2xl font-bold leading-none text-navy"
          >
            {title}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-brand-soft bg-paper px-2.5 py-1 text-[0.65rem] font-bold tabular-nums text-ink-soft">
          {items.length} ta
        </span>
      </div>
      <CandidateAdabiyotXRow
        items={items}
        ariaLabel={`${title}: ${items.length} ta AdabiyotX materiali`}
      />
    </section>
  );
}
