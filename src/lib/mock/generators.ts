import { CATEGORIES, type Category, type ContentItem } from "@/lib/types";
import { pick, seededRandom } from "@/lib/random";
import {
  MOVIE_POOL,
  NEWS_POOL,
  NEWS_SOURCES,
  SOCIAL_AUTHORS,
  SOCIAL_POOL,
  placeholderImage,
} from "./pools";

export interface MockPage {
  items: ContentItem[];
  hasMore: boolean;
}

/** Floors "now" to 10 minutes so timestamps stay stable across paginated requests. */
function baseTime(): number {
  const tenMin = 10 * 60 * 1000;
  return Math.floor(Date.now() / tenMin) * tenMin;
}

/**
 * Interleaves per-category pools round-robin: [tech0, sports0, tech1, sports1, ...].
 * This gives a balanced, non-repeating list that we can then slice into pages.
 */
function roundRobin<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

function paginate<T>(all: T[], page: number, perPage: number): { slice: T[]; hasMore: boolean } {
  const start = (page - 1) * perPage;
  return { slice: all.slice(start, start + perPage), hasMore: start + perPage < all.length };
}

export function allMockNews(categories: readonly Category[]): ContentItem[] {
  const now = baseTime();
  const lists = categories.map((category) =>
    NEWS_POOL[category].map(([title, description], k): ContentItem => {
      const id = `mock-news-${category}-${k}`;
      const rand = seededRandom(id);
      return {
        id,
        type: "news",
        title,
        description,
        image: placeholderImage(id),
        url: null,
        source: pick(rand, NEWS_SOURCES),
        category,
        publishedAt: new Date(now - Math.floor(rand() * 36) * 60 * 60 * 1000 - k * 9e5).toISOString(),
      };
    }),
  );
  return roundRobin(lists);
}

export function allMockMovies(categories: readonly Category[]): ContentItem[] {
  const lists = categories.map((category) =>
    MOVIE_POOL[category].map(([title, description, rating, year], k): ContentItem => {
      const id = `mock-movie-${category}-${k}`;
      return {
        id,
        type: "movie",
        title,
        description,
        image: placeholderImage(id, 800, 500),
        url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`,
        source: "TMDB · Demo",
        category,
        publishedAt: new Date(Date.UTC(year, 0, 1)).toISOString(),
        meta: { rating },
      };
    }),
  );
  return roundRobin(lists);
}

export function allMockSocial(categories: readonly Category[]): ContentItem[] {
  const now = baseTime();
  const lists = categories.map((category) =>
    SOCIAL_POOL[category].map(({ text, tags }, k): ContentItem => buildSocialPost(`mock-social-${category}-${k}`, category, text, tags, now)),
  );
  return roundRobin(lists);
}

function buildSocialPost(id: string, category: Category, text: string, tags: string[], now: number): ContentItem {
  const rand = seededRandom(id);
  const [author, handle] = pick(rand, SOCIAL_AUTHORS);
  const withImage = rand() > 0.6;
  return {
    id,
    type: "social",
    title: `${author} @${handle}`,
    description: text,
    image: withImage ? placeholderImage(id, 800, 450) : null,
    url: null,
    source: "Pulse Social",
    category,
    publishedAt: new Date(now - Math.floor(rand() * 600) * 60 * 1000).toISOString(),
    meta: {
      author,
      handle,
      likes: Math.floor(rand() * 9000) + 40,
      reposts: Math.floor(rand() * 900) + 3,
      hashtags: tags,
    },
  };
}

export function mockNews(categories: readonly Category[], page: number, perPage = 6): MockPage {
  const { slice, hasMore } = paginate(allMockNews(categories), page, perPage);
  return { items: slice, hasMore };
}

export function mockMovies(categories: readonly Category[], page: number, perPage = 3): MockPage {
  const { slice, hasMore } = paginate(allMockMovies(categories), page, perPage);
  return { items: slice, hasMore };
}

export function mockSocial(categories: readonly Category[], page: number, perPage = 3): MockPage {
  const { slice, hasMore } = paginate(allMockSocial(categories), page, perPage);
  return { items: slice, hasMore };
}

/** A brand-new social post for the real-time stream (unique id per tick). */
export function liveSocialPost(categories: readonly Category[], tick: number): ContentItem {
  const pool = categories.length ? categories : CATEGORIES;
  const rand = seededRandom(`live-${tick}-${Date.now()}`);
  const category = pick(rand, pool);
  const { text, tags } = pick(rand, SOCIAL_POOL[category]);
  const post = buildSocialPost(`live-${Date.now()}-${tick}`, category, text, tags, Date.now());
  return { ...post, publishedAt: new Date().toISOString(), meta: { ...post.meta, likes: Math.floor(rand() * 40) } };
}

/** Case-insensitive match against title, description, source and hashtags. */
export function matchesQuery(item: ContentItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const haystack = [item.title, item.description, item.source, item.category, ...(item.meta?.hashtags ?? [])]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word.replace(/^#/, "")));
}
