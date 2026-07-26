import * as React from "react";
import { Inbox, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-soft bg-paper/65 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-liderlar-blue/8 text-liderlar-blue">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden />}
      </div>
      <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Nimadir xato ketdi",
  description = "Ma'lumotlarni yuklab bo'lmadi. Birozdan so'ng qayta urinib ko'ring.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-coral/30 bg-coral/5 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      {action}
    </div>
  );
}
