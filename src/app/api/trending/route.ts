import type { NextRequest } from "next/server";
import { parseCategories, type TrendingResponse } from "@/lib/types";
import { getTrendingNews } from "@/lib/server/news";
import { getTrendingMovies } from "@/lib/server/movies";
import { getTrendingSocial } from "@/lib/server/social";

/** GET /api/trending?categories=... — top items from each source. */
export async function GET(request: NextRequest) {
  const categories = parseCategories(request.nextUrl.searchParams.get("categories"));
  const [news, movies, social] = await Promise.all([
    getTrendingNews(categories),
    getTrendingMovies(categories),
    getTrendingSocial(categories),
  ]);
  const body: TrendingResponse = {
    news: news.items,
    movies: movies.items,
    social: social.items,
    origins: { news: news.origin, movie: movies.origin, social: social.origin },
  };
  return Response.json(body);
}
