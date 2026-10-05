"use client";

import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/useDebounce";
import { ContentGrid } from "@/components/feed/ContentGrid";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { EmptyState } from "@/components/ui/StateViews";
import { Spinner } from "@/components/ui/Spinner";
import { useSearchQuery } from "@/store/api/contentApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { TypeFilter } from "@/store/slices/feedSlice";
import { setSearchQuery } from "@/store/slices/uiSlice";
import { DataBadge } from "./DataBadge";
import { PageHeader } from "./PageHeader";

const SUGGESTIONS = ["AI", "cricket", "Interstellar", "#webdev", "markets", "space"];
export const SEARCH_DEBOUNCE_MS = 400;

export function SearchView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useAppSelector((s) => s.ui.searchQuery);
  const [filter, setFilter] = useState<TypeFilter>("all");

  // Deep links: /search?q=cricket fills the search box on first load.
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const q = searchParams.get("q");
    if (q && !query) dispatch(setSearchQuery(q));
  }, [searchParams, query, dispatch]);

  // Debounce: only the settled value triggers an API request.
  const debounced = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const skip = debounced.length < 2;
  const { data, isFetching, isError, refetch } = useSearchQuery(debounced, { skip });

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    router.replace(debounced ? `${pathname}?q=${encodeURIComponent(debounced)}` : pathname, { scroll: false });
  }, [debounced, pathname, router]);

  const items = useMemo(() => (skip ? [] : (data?.items ?? [])), [data, skip]);
  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);
  const typing = query.trim() !== debounced;

  return (
    <div>
      <PageHeader
        title={debounced && !skip ? t("search.resultsFor", { query: debounced }) : t("search.title")}
        subtitle={t("search.shortcut")}
        actions={
          <>
            {(isFetching || typing) && query.trim().length >= 2 && <Spinner label={t("states.loading")} />}
            {!skip && <DataBadge origins={data?.origins} />}
          </>
        }
      />

      {skip ? (
        <EmptyState
          icon={SearchIcon}
          title={query.trim().length === 1 ? t("search.minChars") : t("search.idleTitle")}
          description={t("search.idleBody")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <span className="py-1.5 text-sm text-muted">{t("search.tryThis")}:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => dispatch(setSearchQuery(s))}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium shadow-card transition hover:border-accent hover:text-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          }
        />
      ) : (
        <>
          {items.length > 0 && (
            <SegmentedTabs
              className="mb-6"
              label={t("feed.filterType")}
              layoutId="search-tabs"
              value={filter}
              onChange={setFilter}
              options={(["all", "news", "movie", "social"] as TypeFilter[]).map((value) => ({
                value,
                label: t(`types.${value}`),
                count: value === "all" ? items.length : items.filter((i) => i.type === value).length,
              }))}
            />
          )}
          <div data-testid="search-results" aria-busy={isFetching}>
            <ContentGrid
              items={visible}
              isLoading={isFetching && !data}
              isError={isError}
              onRetry={() => void refetch()}
              empty={{ title: t("search.noResults", { query: debounced }), description: t("search.noResultsBody") }}
            />
          </div>
        </>
      )}
    </div>
  );
}
