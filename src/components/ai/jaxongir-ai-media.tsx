"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin-configurable Jaxongir AI avatar. Renders whichever asset the "AI
 * Assistant" admin settings point at (image or video), falling back to the
 * bundled default clip and finally a static icon so the button never breaks
 * while assets are missing or fail to load.
 */
export function JaxongirAiMedia({
  avatarKind = "video",
  avatarImageUrl,
  avatarVideoUrl,
  breathing = true,
  className,
  iconClassName = "h-6 w-6",
}: {
  avatarKind?: "image" | "video";
  avatarImageUrl?: string | null;
  avatarVideoUrl?: string | null;
  breathing?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (avatarKind === "image" && avatarImageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded, arbitrary host
      <img
        src={avatarImageUrl}
        alt=""
        aria-hidden
        className={cn("h-full w-full object-cover", breathing && "animate-ai-breathe", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  if (!failed) {
    return (
      <video
        className={cn("h-full w-full object-cover", className)}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        onError={() => setFailed(true)}
      >
        {avatarVideoUrl && <source src={avatarVideoUrl} />}
        <source src="/media/jaxongir-ai-loop.webm" type="video/webm" />
        <source src="/media/jaxongir-ai-loop.mp4" type="video/mp4" />
      </video>
    );
  }

  return <Sparkles className={cn(iconClassName, breathing && "animate-ai-breathe")} aria-hidden />;
}
