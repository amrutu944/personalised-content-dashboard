/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET as feedGET } from "@/app/api/feed/route";
import { GET as searchGET } from "@/app/api/search/route";
import { getNews, normalizeArticle } from "@/lib/server/news";
import { getMovies, normalizeMovie } from "@/lib/server/movies";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.NEWS_API_KEY;
  delete process.env.TMDB_API_KEY;
  jest.restoreAllMocks();
});

const article = (over: Record<string, unknown> = {}) => ({
  source: { name: "Wire" },
  title: "Big news - Wire",
  description: "desc",
  url: "https://news.example/a",
  urlToImage: null,
  publishedAt: "2026-01-01T00:00:00Z",
  ...over,
});

describe("normalizers", () => {
  it("strips the source suffix and drops removed articles", () => {
    expect(normalizeArticle(article(), "technology")?.title).toBe("Big news");
    expect(normalizeArticle(article({ title: "[Removed]" }), "technology")).toBeNull();
    expect(normalizeArticle(article({ title: null }), "technology")).toBeNull();
  });

  it("maps TMDB movies to cards with image and category", () => {
    const movie = normalizeMovie(
      { id: 1, title: "Dune", overview: "o", backdrop_path: "/b.jpg", poster_path: null, vote_average: 8.04, release_date: "2021-09-15", genre_ids: [878] },
      "sports",
    );
    expect(movie).toMatchObject({ id: "movie-1", image: "https://image.tmdb.org/t/p/w780/b.jpg", category: "technology", meta: { rating: 8 } });
  });
});

describe("news source", () => {
  it("uses demo data when no API key is configured (no network call)", async () => {
    global.fetch = jest.fn();
    const res = await getNews(["technology"], 1);
    expect(res.origin).toBe("mock");
    expect(res.items.length).toBeGreaterThan(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns live data when the API responds", async () => {
    process.env.NEWS_API_KEY = "test-key";
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", totalResults: 50, articles: [article()] }), { status: 200 }),
    );
    const res = await getNews(["technology"], 1);
    expect(res).toMatchObject({ origin: "live", hasMore: true });
    expect(res.items[0].title).toBe("Big news");
    // key is sent as a header, never in the URL
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("test-key");
    expect(init.headers["X-Api-Key"]).toBe("test-key");
  });

  it("falls back to demo data when the upstream API fails", async () => {
    process.env.NEWS_API_KEY = "test-key";
    jest.spyOn(console, "warn").mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue(new Response("rate limited", { status: 429 }));
    const res = await getNews(["sports"], 1);
    expect(res.origin).toBe("mock");
    expect(res.items.length).toBeGreaterThan(0);
  });
});

describe("movies source", () => {
  it("translates feed pages into TMDB page offsets", async () => {
    process.env.TMDB_API_KEY = "k";
    const results = Array.from({ length: 20 }, (_, i) => ({ id: i, title: `M${i}`, overview: "", backdrop_path: null, poster_path: null, vote_average: 7, release_date: "2020-01-01", genre_ids: [] }));
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ page: 1, total_pages: 5, results }), { status: 200 }));
    const page2 = await getMovies(["technology"], 2, 3);
    expect(page2.items.map((m) => m.title)).toEqual(["M3", "M4", "M5"]);
  });
});

describe("API routes", () => {
  it("GET /api/feed returns an interleaved, paginated page", async () => {
    const res = await feedGET(new NextRequest("http://localhost/api/feed?categories=technology,sports&page=1"));
    const body = await res.json();
    expect(body.page).toBe(1);
    expect(body.items.slice(0, 4).map((i: { type: string }) => i.type)).toEqual(["news", "news", "movie", "social"]);
    expect(body.origins).toEqual({ news: "mock", movie: "mock", social: "mock" });
  });

  it("GET /api/feed clamps invalid page numbers", async () => {
    const body = await (await feedGET(new NextRequest("http://localhost/api/feed?page=-5"))).json();
    expect(body.page).toBe(1);
  });

  it("GET /api/search validates the query length", async () => {
    const res = await searchGET(new NextRequest("http://localhost/api/search?q=a"));
    expect(res.status).toBe(400);
  });

  it("GET /api/search finds matches across content types", async () => {
    const body = await (await searchGET(new NextRequest("http://localhost/api/search?q=cricket"))).json();
    const types = new Set(body.items.map((i: { type: string }) => i.type));
    expect(types).toEqual(new Set(["news", "movie", "social"]));
  });
});
