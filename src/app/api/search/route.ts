import type { NextRequest } from "next/server";
import { CATEGORIES, type SearchResponse } from "@/lib/types";
import { interleave } from "@/lib/feed";
import { searchNews } from "@/lib/server/news";
import { searchMovies } from "@/lib/server/movies";
import { searchSocial } from "@/lib/server/social";

const MAX_QUERY_LENGTH = 100;

/** GET /api/search?q=... — searches news, movies and social posts at once. */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  if (query.length < 2) {
    return Response.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }
  const all = [...CATEGORIES];
  const [news, movies, social] = await Promise.all([
    searchNews(query, all),
    searchMovies(query, all),
    searchSocial(query, all),
  ]);
  const body: SearchResponse = {
    query,
    items: interleave({ news: news.items, movie: movies.items, social: social.items }),
    origins: { news: news.origin, movie: movies.origin, social: social.origin },
  };
  return Response.json(body);
}
