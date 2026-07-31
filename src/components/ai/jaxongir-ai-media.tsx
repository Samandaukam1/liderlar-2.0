"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Looping 1:1 clip for the Jaxongir AI avatar (web + mobile share this same
 * component). Falls back to the Sparkles icon if the clip hasn't been added
 * at /public/media/jaxongir-ai-loop.(webm|mp4) yet, or fails to load, so the
 * button never breaks while waiting for the asset.
 */
export function JaxongirAiMedia({
  videoClassName,
  iconClassName = "h-6 w-6",
}: {
  videoClassName?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed) return <Sparkles className={iconClassName} aria-hidden />;

  return (
    <video
      className={cn("h-full w-full object-cover", videoClassName)}
      autoPlay
      loop
      muted
      playsInline
      aria-hidden
      onError={() => setFailed(true)}
    >
      <source src="/media/jaxongir-ai-loop.webm" type="video/webm" />
      <source src="/media/jaxongir-ai-loop.mp4" type="video/mp4" />
    </video>
  );
}
