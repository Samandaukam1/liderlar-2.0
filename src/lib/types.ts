export type CandidateCardData = {
  id: string;
  slug: string;
  full_name: string;
  short_bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  total_score: number;
  position: number | null;
  previous_position: number | null;
  is_top100: boolean;
  top100_position: number | null;
  region: { name: string; slug: string } | null;
  category: { name: string; slug: string; color: string | null } | null;
};

export type RankingRow = {
  candidate_id: string;
  position: number | null;
  previous_position: number | null;
  total_score: number;
  candidate: CandidateCardData;
};

export type QuoteCardData = {
  id: string;
  text: string;
  author_name: string | null;
  accent: string | null;
  candidate: CandidateCardData | null;
};

export type PodcastCardData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  starts_at: string | null;
  location: string | null;
  online_url: string | null;
  status: string;
  registration_limit: number | null;
  host_name: string | null;
  media_url: string | null;
};

export type JournalCardData = {
  id: string;
  slug: string;
  issue_number: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  published_at: string | null;
};

export type ArticleCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  published_at: string | null;
  candidate: { slug: string; full_name: string } | null;
};

export type AdabiyotXContentType =
  | "book"
  | "article"
  | "poem"
  | "scenario"
  | "other";

export type CandidateAdabiyotXRelationship =
  | "own_work"
  | "read_book";

/**
 * Only the fields we are willing to surface as UI facts. Everything is optional
 * because the Admin API may omit `metadata` entirely — a missing value must never
 * be rendered as a default (no invented price, rating or "free" state).
 */
export interface PublicAdabiyotXItemMetadata {
  isFree?: boolean;
  rating?: number;
  category?: string;
}

export interface PublicCandidateAdabiyotXItem {
  id: string;
  externalId: string;
  relationshipType: CandidateAdabiyotXRelationship;
  contentType: AdabiyotXContentType;
  title: string;
  authorName: string | null;
  description: string | null;
  coverUrl: string | null;
  externalUrl: string;
  publishedAt: string | null;
  sortOrder: number;
  metadata: PublicAdabiyotXItemMetadata;
}

export type RankingBreakdownRow = {
  category: string;
  total_score: number;
  position: number | null;
  previous_position: number | null;
};
