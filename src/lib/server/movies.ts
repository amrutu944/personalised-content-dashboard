import type { Category, ContentItem } from "@/lib/types";
import { allMockMovies, matchesQuery, mockMovies } from "@/lib/mock/generators";
import { fetchJson } from "./http";
import type { SourceResult } from "./news";

/**
 * TMDB integration (https://developer.themoviedb.org). Supports either a v3
 * API key (TMDB_API_KEY) or a v4 read access token (TMDB_READ_TOKEN).
 */

const BASE = "https://api.themoviedb.org/3";
const TMDB_PAGE_SIZE = 20;

/** TMDB has no "technology" genre, so each preference maps to its closest genre. */
export const GENRE_FOR_CATEGORY: Record<Category, number> = {
  technology: 878, // Science Fiction
  business: 18, // Drama
  sports: 28, // Action
  entertainment: 35, // Comedy
  science: 99, // Documentary
  health: 10751, // Family
};

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface TmdbList {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
}

function auth(): { query: string; headers: HeadersInit } | null {
  const token = process.env.TMDB_READ_TOKEN?.trim();
  if (token) return { query: "", headers: { Authorization: `Bearer ${token}` } };
  const key = process.env.TMDB_API_KEY?.trim();
  if (key) return { query: `api_key=${key}`, headers: {} };
  return null;
}

function categoryFor(genreIds: number[], fallback: Category): Category {
  const match = (Object.entries(GENRE_FOR_CATEGORY) as [Category, number][]).find(([, g]) => genreIds.includes(g));
  return match?.[0] ?? fallback;
}

export function normalizeMovie(movie: TmdbMovie, fallback: Category): ContentItem {
  const path = movie.backdrop_path ?? movie.poster_path;
  return {
    id: `movie-${movie.id}`,
    type: "movie",
    title: movie.title,
    description: movie.overview,
    image: path ? `https://image.tmdb.org/t/p/w780${path}` : null,
    url: `https://www.themoviedb.org/movie/${movie.id}`,
    source: "TMDB",
    category: categoryFor(movie.genre_ids ?? [], fallback),
    publishedAt: movie.release_date ? new Date(movie.release_date).toISOString() : new Date().toISOString(),
    meta: { rating: Math.round(movie.vote_average * 10) / 10 },
  };
}

async function tmdb(path: string, params: Record<string, string>, revalidate = 3600): Promise<TmdbList> {
  const a = auth()!;
  const qs = new URLSearchParams(params).toString();
  return fetchJson<TmdbList>(`${BASE}${path}?${[qs, a.query].filter(Boolean).join("&")}`, {
    headers: a.headers,
    revalidate,
  });
}

export async function getMovies(categories: Category[], page: number, perPage = 3): Promise<SourceResult> {
  if (!auth()) return { ...mockMovies(categories, page, perPage), origin: "mock" };
  try {
    // Our feed pages are smaller than TMDB pages, so translate the offset.
    const start = (page - 1) * perPage;
    const tmdbPage = Math.floor(start / TMDB_PAGE_SIZE) + 1;
    const offset = start % TMDB_PAGE_SIZE;
    const params = {
      with_genres: categories.map((c) => GENRE_FOR_CATEGORY[c]).join("|"),
      sort_by: "popularity.desc",
      include_adult: "false",
      page: String(tmdbPage),
    };
    const list = await tmdb("/discover/movie", params);
    let results = list.results.slice(offset, offset + perPage);
    if (results.length < perPage && tmdbPage < list.total_pages) {
      const next = await tmdb("/discover/movie", { ...params, page: String(tmdbPage + 1) });
      results = results.concat(next.results.slice(0, perPage - results.length));
    }
    return {
      items: results.map((m) => normalizeMovie(m, categories[0])),
      hasMore: tmdbPage < list.total_pages || offset + perPage < list.results.length,
      origin: "live",
    };
  } catch (err) {
    console.warn("[movies] falling back to mock data:", (err as Error).message);
    return { ...mockMovies(categories, page, perPage), origin: "mock" };
  }
}

export async function getTrendingMovies(categories: Category[]): Promise<SourceResult> {
  const mock = (): SourceResult => ({
    items: [...allMockMovies(categories)].sort((a, b) => (b.meta?.rating ?? 0) - (a.meta?.rating ?? 0)).slice(0, 8),
    hasMore: false,
    origin: "mock",
  });
  if (!auth()) return mock();
  try {
    const list = await tmdb("/trending/movie/week", {});
    return { items: list.results.slice(0, 8).map((m) => normalizeMovie(m, categories[0])), hasMore: false, origin: "live" };
  } catch {
    return mock();
  }
}

export async function searchMovies(query: string, fallbackCategories: Category[]): Promise<SourceResult> {
  const mock = (): SourceResult => ({
    items: allMockMovies(fallbackCategories).filter((m) => matchesQuery(m, query)),
    hasMore: false,
    origin: "mock",
  });
  if (!auth()) return mock();
  try {
    const list = await tmdb("/search/movie", { query, include_adult: "false" }, 300);
    return { items: list.results.slice(0, 12).map((m) => normalizeMovie(m, "entertainment")), hasMore: false, origin: "live" };
  } catch {
    return mock();
  }
}
