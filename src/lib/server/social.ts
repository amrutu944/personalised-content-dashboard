import type { Category } from "@/lib/types";
import { allMockSocial, matchesQuery, mockSocial } from "@/lib/mock/generators";
import type { SourceResult } from "./news";

/**
 * Social feed. Twitter/X and Instagram APIs are paid / review-gated, so this is
 * a mock API (explicitly allowed by the brief) that filters posts by hashtags
 * derived from the user's categories. It has the same async contract as the
 * real sources, so swapping in a real API later only touches this file.
 */

export async function getSocial(categories: Category[], page: number, perPage = 3): Promise<SourceResult> {
  return { ...mockSocial(categories, page, perPage), origin: "mock" };
}

export async function getTrendingSocial(categories: Category[]): Promise<SourceResult> {
  const items = [...allMockSocial(categories)].sort((a, b) => (b.meta?.likes ?? 0) - (a.meta?.likes ?? 0)).slice(0, 8);
  return { items, hasMore: false, origin: "mock" };
}

export async function searchSocial(query: string, categories: Category[]): Promise<SourceResult> {
  return { items: allMockSocial(categories).filter((p) => matchesQuery(p, query)), hasMore: false, origin: "mock" };
}
