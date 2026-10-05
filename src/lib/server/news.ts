import type { Category, ContentItem, DataOrigin } from "@/lib/types";
import { hashString } from "@/lib/random";
import { allMockNews, matchesQuery, mockNews } from "@/lib/mock/generators";
import { fetchJson } from "./http";

/**
 * NewsAPI integration (https://newsapi.org). The API key is read from the
 * server environment and never shipped to the browser.
 */

const BASE = "https://newsapi.org/v2";

interface NewsApiArticle {
  source: { name: string | null };
  title: string | null;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

interface NewsApiResponse {
  status: "ok" | "error";
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface SourceResult {
  items: ContentItem[];
  hasMore: boolean;
  origin: DataOrigin;
}

const apiKey = () => process.env.NEWS_API_KEY?.trim();

export function normalizeArticle(article: NewsApiArticle, category: Category): ContentItem | null {
  if (!article.title || article.title === "[Removed]" || !article.url) return null;
  return {
    id: `news-${hashString(article.url).toString(36)}`,
    type: "news",
    // NewsAPI appends " - Source Name" to headlines; strip it for cleaner cards.
    title: article.title.replace(/\s+-\s+[^-]+$/, ""),
    description: article.description ?? "",
    image: article.urlToImage,
    url: article.url,
    source: article.source?.name ?? "News",
    category,
    publishedAt: article.publishedAt,
  };
}

async function topHeadlines(category: Category, page: number, pageSize: number) {
  const params = new URLSearchParams({
    country: "us",
    category,
    page: String(page),
    pageSize: String(pageSize),
  });
  return fetchJson<NewsApiResponse>(`${BASE}/top-headlines?${params}`, {
    headers: { "X-Api-Key": apiKey()! },
  });
}

export async function getNews(categories: Category[], page: number, perPage = 6): Promise<SourceResult> {
  if (!apiKey()) return { ...mockNews(categories, page, perPage), origin: "mock" };
  try {
    const per = Math.max(2, Math.ceil(perPage / categories.length));
    const responses = await Promise.all(categories.map((c) => topHeadlines(c, page, per)));
    const items = responses
      .flatMap((res, i) => res.articles.map((a) => normalizeArticle(a, categories[i])))
      .filter((x): x is ContentItem => x !== null)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    const hasMore = responses.some((res) => res.totalResults > page * per);
    return { items, hasMore, origin: "live" };
  } catch (err) {
    console.warn("[news] falling back to mock data:", (err as Error).message);
    return { ...mockNews(categories, page, perPage), origin: "mock" };
  }
}

export async function getTrendingNews(categories: Category[]): Promise<SourceResult> {
  if (!apiKey()) return { items: allMockNews(categories).slice(0, 8), hasMore: false, origin: "mock" };
  try {
    const res = await fetchJson<NewsApiResponse>(`${BASE}/top-headlines?country=us&pageSize=8`, {
      headers: { "X-Api-Key": apiKey()! },
    });
    const items = res.articles
      .map((a) => normalizeArticle(a, categories[0] ?? "technology"))
      .filter((x): x is ContentItem => x !== null);
    return { items, hasMore: false, origin: "live" };
  } catch {
    return { items: allMockNews(categories).slice(0, 8), hasMore: false, origin: "mock" };
  }
}

export async function searchNews(query: string, fallbackCategories: Category[]): Promise<SourceResult> {
  const mock = () => ({
    items: allMockNews(fallbackCategories).filter((item) => matchesQuery(item, query)),
    hasMore: false,
    origin: "mock" as const,
  });
  if (!apiKey()) return mock();
  try {
    const params = new URLSearchParams({ q: query, pageSize: "12", sortBy: "publishedAt", language: "en" });
    const res = await fetchJson<NewsApiResponse>(`${BASE}/everything?${params}`, {
      headers: { "X-Api-Key": apiKey()! },
      revalidate: 300,
    });
    const items = res.articles
      .map((a) => normalizeArticle(a, "technology"))
      .filter((x): x is ContentItem => x !== null);
    return { items, hasMore: false, origin: "live" };
  } catch {
    return mock();
  }
}
