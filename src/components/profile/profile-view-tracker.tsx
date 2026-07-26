"use client";

import * as React from "react";

/** Fire-and-forget: records a de-duplicated profile view (see 0008 migration). */
export function ProfileViewTracker({ candidateSlug }: { candidateSlug: string }) {
  React.useEffect(() => {
    fetch("/api/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateSlug }),
      keepalive: true,
    }).catch(() => {
      // best-effort — a failed view ping should never break the page
    });
  }, [candidateSlug]);

  return null;
}
