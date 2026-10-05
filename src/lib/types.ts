/**
 * Shared domain types. Every source (NewsAPI, TMDB, mock social) is normalized
 * into a single `ContentItem` shape so the UI never needs to know where data came from.
 */

export const CATEGORIES = [
  "technology",
  "business",
  "sports",
  "entertainment",
  "science",
  "health",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ContentType = "news" | "movie" | "social";

export type DataOrigin = "live" | "mock";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  image?: string | null;
  url?: string | null;
  source: string;
  category: Category;
  publishedAt: string; // ISO date
  meta?: {
    rating?: number; // movies: 0-10
    author?: string; // social: display name
    handle?: string; // social: @handle
    likes?: number;
    reposts?: number;
    hashtags?: string[];
  };
}

export interface FeedPage {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
  origins: Record<ContentType, DataOrigin>;
}

export interface TrendingResponse {
  news: ContentItem[];
  movies: ContentItem[];
  social: ContentItem[];
  origins: Record<ContentType, DataOrigin>;
}

export interface SearchResponse {
  query: string;
  items: ContentItem[];
  origins: Record<ContentType, DataOrigin>;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** Parses a comma separated `?categories=` param, dropping unknown values. */
export function parseCategories(raw: string | null | undefined): Category[] {
  const parsed = (raw ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(isCategory);
  return parsed.length ? Array.from(new Set(parsed)) : ["technology"];
}
