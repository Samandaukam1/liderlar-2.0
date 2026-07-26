"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RANKING_CATEGORY_LABELS } from "@/lib/constants";

type Row = { category: string; total_score: number };

const COLORS: Record<string, string> = {
  achievements: "#087EA4",
  monthly_activity: "#A998F5",
  active_leadership: "#74DDC1",
};

export function RankingCategoryChart({ rows }: { rows: Row[] }) {
  const data = rows
    .filter((r) => r.category !== "overall")
    .map((r) => ({
      name: RANKING_CATEGORY_LABELS[r.category]?.replace(" bo'yicha", "") ?? r.category,
      score: Number(r.total_score.toFixed(1)),
      color: COLORS[r.category] ?? "#087EA4",
    }));

  if (data.length === 0) return null;

  return (
    <div className="h-40 w-full" role="img" aria-label="Kategoriyalar bo'yicha ball taqsimoti">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 11, fill: "#526579" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(8,126,164,0.06)" }}
            contentStyle={{ borderRadius: 10, borderColor: "rgba(8,126,164,0.18)", fontSize: 12 }}
            formatter={(value) => [`${value}`, "Ball"]}
          />
          <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={16}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
