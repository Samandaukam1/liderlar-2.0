import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type PatternBackgroundProps = {
  color?: string;
  gradient?: string;
  opacity?: number;
  size?: string;
  position?: string;
  className?: string;
};

type PatternBackgroundStyle = CSSProperties & {
  "--pattern-fill": string;
  "--pattern-opacity": number;
  "--pattern-size": string;
  "--pattern-position": string;
};

export function PatternBackground({
  color = "#087EA4",
  gradient,
  opacity = 0.1,
  size = "620px 620px",
  position = "top center",
  className,
}: PatternBackgroundProps) {
  const fill = gradient?.trim() || color;
  const normalizedOpacity = Math.min(1, Math.max(0, opacity));
  const style: PatternBackgroundStyle = {
    "--pattern-fill": fill,
    "--pattern-opacity": normalizedOpacity,
    "--pattern-size": size,
    "--pattern-position": position,
  };

  return (
    <div
      aria-hidden="true"
      className={cn("pattern-background", className)}
      style={style}
    />
  );
}
