import { cn } from "@/lib/utils";
import { formatDateUz } from "@/lib/utils";

export type TimelineEntry = {
  id: string;
  date: string | null;
  title: string;
  description?: string | null;
  tone?: "blue" | "coral" | "mint" | "violet";
};

const DOT_TONE: Record<string, string> = {
  blue: "bg-gradient-blue",
  coral: "bg-gradient-coral",
  mint: "bg-gradient-mint",
  violet: "bg-gradient-violet",
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="relative space-y-6 border-l-2 border-brand-soft pl-6">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className={cn(
              "absolute -left-[1.66rem] top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow",
              DOT_TONE[entry.tone ?? "blue"]
            )}
          />
          {entry.date && <p className="text-xs font-semibold uppercase tracking-wide text-liderlar-blue">{formatDateUz(entry.date)}</p>}
          <p className="mt-0.5 font-display text-base font-bold text-navy">{entry.title}</p>
          {entry.description && <p className="mt-1 text-sm text-ink-soft">{entry.description}</p>}
        </li>
      ))}
    </ol>
  );
}
