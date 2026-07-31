/**
 * liderlar-admin and liderlar-web are separate repos with no shared package,
 * so this marker list is duplicated from liderlar-admin/src/lib/candidates/markers.ts
 * and must be kept in sync with it. Structured candidate fields are stored
 * marker-free already; this is defense-in-depth so a stray marker can never
 * leak onto the public profile.
 */
const CANDIDATE_MARKERS = ["!!!", "&&&", "+++", "***", "$$$", "(((", ")))", "%%%", "^^^"] as const;

export function stripCandidateMarkers(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => {
      const marker = CANDIDATE_MARKERS.find((m) => line.startsWith(m));
      return marker ? line.slice(marker.length).replace(/^\s+/, "") : line;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Splits a `"A | B | A "` string into trimmed, de-duplicated, marker-free items. */
export function splitPipeValues(value: string | string[] | null | undefined): string[] {
  const parts = Array.isArray(value) ? value : typeof value === "string" ? value.split("|") : [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of parts) {
    const item = stripCandidateMarkers(String(raw));
    const key = item.toLocaleLowerCase("uz");
    if (!item || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
