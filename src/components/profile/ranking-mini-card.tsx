import { Trophy } from "lucide-react";
import { RANKING_CATEGORY_LABELS } from "@/lib/constants";
import { RankDeltaBadge } from "@/components/ui/badge";
import { rankDelta } from "@/lib/utils";
import { RankingCategoryChart } from "@/components/profile/ranking-category-chart";

type Row = {
  category: string;
  total_score: number;
  position: number | null;
  previous_position: number | null;
};

/**
 * UMUMIY REYTING BLOKI.
 *
 * BALL HAR DOIM KO'RSATILADI — `0` ni "yo'q" deb yashirmaydi.
 * Yashirilsa, nomzod o'z sahifasida reyting borligini bilmasdi va
 * raqamning yo'qligi "tizim ishlamayapti" degan taassurot qoldirardi.
 *
 * O'RIN esa SHARTLI: ball 0 bo'lganda nollar orasidagi tartib
 * raqami hech narsani anglatmaydi, qator yo'q bo'lsa esa hisob hali
 * o'tmagan. Uchala holat o'z nomi bilan aytiladi (§22).
 */
export function RankingMiniCard({
  rows,
  totalScore,
  position,
  previousPosition,
  hasRow,
}: {
  rows: Row[];
  totalScore: number;
  position: number | null;
  previousPosition: number | null;
  hasRow: boolean;
}) {
  const others = rows.filter((r) => r.category !== "overall");

  return (
    <div className="rounded-xl border border-brand-soft bg-paper p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-blue text-white">
            <Trophy className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-navy">Umumiy reyting</span>
        </div>
        {position !== null && <RankDeltaBadge delta={rankDelta(position, previousPosition)} />}
      </div>

      <div className="flex items-end gap-2">
        <span className="font-display text-4xl font-bold text-navy">{totalScore.toFixed(1)}</span>
        <span className="pb-1 text-sm text-ink-soft">/ 100 ball</span>
      </div>

      {position !== null && totalScore > 0 ? (
        <p className="mt-1 text-sm text-ink-soft">
          <span className="font-semibold text-navy">#{position}</span> — umumiy reytingda
        </p>
      ) : (
        <p className="mt-1 text-sm text-ink-soft">
          {hasRow ? "O'rin hali shakllanmagan" : "Reyting hisoblanmoqda"}
        </p>
      )}

      {others.length > 0 && (
        <>
          <div className="mt-4 border-t border-brand-soft pt-4">
            <RankingCategoryChart rows={others} />
          </div>
          <div className="mt-2 space-y-2.5">
            {others.map((row) => (
              <div key={row.category} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{RANKING_CATEGORY_LABELS[row.category] ?? row.category}</span>
                <span className="flex items-center gap-2 font-semibold text-navy">
                  {row.total_score.toFixed(1)}
                  <RankDeltaBadge delta={rankDelta(row.position, row.previous_position)} />
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
