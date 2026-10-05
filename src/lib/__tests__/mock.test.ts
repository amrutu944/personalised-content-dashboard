import { parseCategories } from "@/lib/types";
import { allMockNews, liveSocialPost, matchesQuery, mockMovies, mockNews, mockSocial } from "@/lib/mock/generators";
import { NEWS_POOL } from "@/lib/mock/pools";
import { makeItem } from "@/test/utils";

describe("parseCategories", () => {
  it("parses, lowercases, dedupes and drops unknown values", () => {
    expect(parseCategories("Technology, sports,unknown,sports")).toEqual(["technology", "sports"]);
  });

  it("falls back to technology for empty or invalid input", () => {
    expect(parseCategories(null)).toEqual(["technology"]);
    expect(parseCategories("<script>")).toEqual(["technology"]);
  });
});

describe("mock generators", () => {
  it("are deterministic for the same input (stable ids for favorites)", () => {
    expect(mockNews(["technology"], 1).items.map((i) => i.id)).toEqual(mockNews(["technology"], 1).items.map((i) => i.id));
  });

  it("balance categories round-robin", () => {
    const cats = mockNews(["technology", "sports"], 1).items.map((i) => i.category);
    expect(cats.slice(0, 4)).toEqual(["technology", "sports", "technology", "sports"]);
  });

  it("paginate without repeating items and report hasMore correctly", () => {
    const total = NEWS_POOL.technology.length;
    const pages = [1, 2].map((p) => mockNews(["technology"], p, 6));
    const ids = pages.flatMap((p) => p.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(total);
    expect(pages[0].hasMore).toBe(true);
    expect(pages[1].hasMore).toBe(false);
  });

  it("returns an empty page past the end", () => {
    expect(mockMovies(["health"], 99)).toEqual({ items: [], hasMore: false });
  });

  it("produce well-formed social posts", () => {
    const post = mockSocial(["sports"], 1).items[0];
    expect(post.type).toBe("social");
    expect(post.meta?.handle).toBeTruthy();
    expect(post.meta?.hashtags?.length).toBeGreaterThan(0);
  });

  it("creates unique live posts for the realtime stream", () => {
    expect(liveSocialPost(["technology"], 1).id).not.toBe(liveSocialPost(["technology"], 2).id);
  });

  it("covers every item in allMockNews", () => {
    expect(allMockNews(["science", "health"])).toHaveLength(NEWS_POOL.science.length + NEWS_POOL.health.length);
  });
});

describe("matchesQuery", () => {
  const item = makeItem({ title: "India win the Cricket series", description: "A thriller", meta: { hashtags: ["TeamIndia"] } });

  it("matches case-insensitively across fields", () => {
    expect(matchesQuery(item, "cricket")).toBe(true);
    expect(matchesQuery(item, "THRILLER")).toBe(true);
  });

  it("matches hashtags with or without #", () => {
    expect(matchesQuery(item, "#teamindia")).toBe(true);
  });

  it("requires every word to match", () => {
    expect(matchesQuery(item, "cricket football")).toBe(false);
  });

  it("never matches an empty query", () => {
    expect(matchesQuery(item, "   ")).toBe(false);
  });
});
