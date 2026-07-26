import * as React from "react";
import { BadgeCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "bg-liderlar-blue/8 text-liderlar-blue",
        blue: "bg-gradient-blue text-white",
        coral: "bg-coral/15 text-coral",
        mint: "bg-mint/20 text-[#1e7a63]",
        violet: "bg-violet/20 text-[#5b3fb8]",
        outline: "border border-brand-soft text-ink-soft",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-blue px-2.5 py-1 text-[0.7rem] font-semibold text-white",
        className
      )}
      title="Tasdiqlangan profil"
    >
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      Tasdiqlangan
    </span>
  );
}

const STATUS_LABELS: Record<string, { label: string; tone: BadgeProps["tone"] }> = {
  draft: { label: "Qoralama", tone: "outline" },
  pending: { label: "Kutilmoqda", tone: "neutral" },
  published: { label: "Nashr etilgan", tone: "mint" },
  archived: { label: "Arxivlangan", tone: "outline" },
  rejected: { label: "Rad etilgan", tone: "coral" },
  rejected_lc: { label: "Rad etilgan", tone: "coral" },
  in_review: { label: "Ko'rib chiqilmoqda", tone: "violet" },
  approved: { label: "Tasdiqlangan", tone: "mint" },
  rejansplanned: { label: "Rejalashtirilgan", tone: "neutral" },
  rejalashtirilgan: { label: "Rejalashtirilgan", tone: "neutral" },
  royxat_ochiq: { label: "Ro'yxat ochiq", tone: "mint" },
  tolgan: { label: "To'lgan", tone: "coral" },
  yakunlangan: { label: "Yakunlangan", tone: "outline" },
  bekor_qilingan: { label: "Bekor qilingan", tone: "coral" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_LABELS[status] ?? { label: status, tone: "neutral" as const };
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}

export function RankingBadge({ position, className }: { position: number; className?: string }) {
  const isTop3 = position <= 3;
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold font-display",
        isTop3 ? "bg-gradient-blue text-white shadow-[0_8px_20px_rgba(0,151,190,0.35)]" : "bg-navy/5 text-navy",
        className
      )}
    >
      {position}
    </span>
  );
}

export function RankDeltaBadge({ delta, className }: { delta: number; className?: string }) {
  if (delta > 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold text-[#1e9c66]", className)}>
        <TrendingUp className="h-3.5 w-3.5" aria-hidden /> {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold text-coral", className)}>
        <TrendingDown className="h-3.5 w-3.5" aria-hidden /> {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium text-ink-soft", className)}>
      <Minus className="h-3.5 w-3.5" aria-hidden /> 0
    </span>
  );
}
