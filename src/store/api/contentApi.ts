import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Category, FeedPage, SearchResponse, TrendingResponse } from "@/lib/types";

/**
 * RTK Query API slice. Handles caching, request de-duplication, loading/error
 * state and infinite pagination for every request to our Next.js API routes.
 */
export const contentApi = createApi({
  reducerPath: "contentApi",
  // fetch is resolved lazily so the module can load in non-browser environments (SSR, tests).
  baseQuery: fetchBaseQuery({ baseUrl: "/api", fetchFn: (...args) => fetch(...args) }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /** Infinite feed: each page holds a mix of news, movies and social posts. */
    getFeed: build.infiniteQuery<FeedPage, Category[], number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
      },
      query: ({ queryArg, pageParam }) => ({
        url: "feed",
        params: { categories: queryArg.join(","), page: pageParam },
      }),
    }),
    getTrending: build.query<TrendingResponse, Category[]>({
      query: (categories) => ({ url: "trending", params: { categories: categories.join(",") } }),
    }),
    search: build.query<SearchResponse, string>({
      query: (q) => ({ url: "search", params: { q } }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetFeedInfiniteQuery, useGetTrendingQuery, useSearchQuery } = contentApi;
