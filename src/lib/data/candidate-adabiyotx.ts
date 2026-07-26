import "server-only";

import type {
  AdabiyotXContentType,
  CandidateAdabiyotXRelationship,
  PublicAdabiyotXItemMetadata,
  PublicCandidateAdabiyotXItem,
} from "@/lib/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function relationshipOrNull(
  value: unknown
): CandidateAdabiyotXRelationship | null {
  return value === "own_work" || value === "read_book" ? value : null;
}

function contentType(value: unknown): AdabiyotXContentType {
  return value === "book" ||
    value === "article" ||
    value === "poem" ||
    value === "scenario"
    ? value
    : "other";
}

/**
 * Keeps only metadata the card is allowed to present as a fact. Anything absent,
 * malformed or out of range is dropped so the UI never invents a badge.
 */
function normalizeMetadata(value: unknown): PublicAdabiyotXItemMetadata {
  if (!isRecord(value)) return {};

  const metadata: PublicAdabiyotXItemMetadata = {};
  if (typeof value.isFree === "boolean") metadata.isFree = value.isFree;
  if (
    typeof value.rating === "number" &&
    Number.isFinite(value.rating) &&
    value.rating > 0 &&
    value.rating <= 5
  ) {
    metadata.rating = value.rating;
  }
  const category = stringOrNull(value.category);
  if (category) metadata.category = category;

  return metadata;
}

function payloadItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
    return payload.data.items;
  }
  return [];
}

function normalizeItem(
  value: unknown,
  index: number
): PublicCandidateAdabiyotXItem | null {
  if (!isRecord(value)) return null;

  const title = stringOrNull(value.title);
  const relationshipType = relationshipOrNull(value.relationshipType);
  if (!title || !relationshipType) return null;

  const normalizedContentType = contentType(value.contentType);
  const rawSortOrder = value.sortOrder;
  const sortOrder =
    typeof rawSortOrder === "number" && Number.isFinite(rawSortOrder)
      ? rawSortOrder
      : index;
  const providedId = stringOrNull(value.id);
  const providedExternalId = stringOrNull(value.externalId);
  const fallbackId = `adabiyotx-${relationshipType}-${normalizedContentType}-${sortOrder}-${index}`;

  return {
    id: providedId ?? providedExternalId ?? fallbackId,
    externalId: providedExternalId ?? providedId ?? fallbackId,
    relationshipType,
    contentType: normalizedContentType,
    title,
    authorName: stringOrNull(value.authorName),
    description: stringOrNull(value.description),
    coverUrl: stringOrNull(value.coverUrl),
    externalUrl: stringOrNull(value.externalUrl) ?? "",
    publishedAt: stringOrNull(value.publishedAt),
    sortOrder,
    metadata: normalizeMetadata(value.metadata),
  };
}

/**
 * Fetches sanitized public card metadata from the separate Admin project.
 * The integration key is the only cross-project candidate identifier.
 */
export async function getCandidateAdabiyotXItems(
  integrationKey: string | null | undefined
): Promise<PublicCandidateAdabiyotXItem[]> {
  const baseUrl = process.env.LIDERLAR_ADMIN_API_BASE_URL?.trim();
  if (!baseUrl || !integrationKey || !UUID_PATTERN.test(integrationKey)) {
    return [];
  }

  try {
    const origin = new URL(baseUrl);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") return [];

    const url = new URL(
      `/api/public/candidates/${encodeURIComponent(integrationKey)}/adabiyotx-items`,
      origin
    );
    const optionalApiKey =
      process.env.LIDERLAR_PUBLIC_CONTENT_API_KEY?.trim();

    // No caching: a book linked in the Admin panel has to show up on the next
    // profile request, even though the rest of the page may be prerendered.
    const response = await fetch(url, {
      headers: optionalApiKey
        ? { "x-liderlar-api-key": optionalApiKey }
        : undefined,
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) return [];

    // An auth gate in front of the Admin API answers with an HTML login page
    // instead of JSON. Treat anything non-JSON as "no items" rather than
    // letting a parse error bubble into the profile page.
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return [];

    const payload: unknown = await response.json();
    return payloadItems(payload)
      .map(normalizeItem)
      .filter(
        (item): item is PublicCandidateAdabiyotXItem => item !== null
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}
