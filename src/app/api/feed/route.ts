import type { NextRequest } from "next/server";
import { parseCategories, type FeedPage } from "@/lib/types";
import { dedupe, interleave } from "@/lib/feed";
import { getNews } from "@/lib/server/news";
import { getMovies } from "@/lib/server/movies";
import { getSocial } from "@/lib/server/social";

/**
 * GET /api/feed?categories=technology,sports&page=1
 *
 * Backend-for-frontend endpoint: calls News, Movies and Social sources in
 * parallel on the server (API keys never reach the browser) and returns one
 * interleaved, paginated feed page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categories = parseCategories(searchParams.get("categories"));
  const page = clampPage(searchParams.get("page"));

  const [news, movies, social] = await Promise.all([
    getNews(categories, page),
    getMovies(categories, page),
    getSocial(categories, page),
  ]);

  const body: FeedPage = {
    page,
    items: dedupe(interleave({ news: news.items, movie: movies.items, social: social.items })),
    hasMore: news.hasMore || movies.hasMore || social.hasMore,
    origins: { news: news.origin, movie: movies.origin, social: social.origin },
  };
  return Response.json(body);
}

function clampPage(raw: string | null): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), 50) : 1;
}
