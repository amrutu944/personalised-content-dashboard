"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Heart, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "@/lib/types";
import { applyOrder, dedupe, reorderSubset } from "@/lib/feed";
import { CATEGORY_META } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { SkeletonGrid } from "@/components/cards/CardSkeleton";
import { ContentGrid } from "@/components/feed/ContentGrid";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { Spinner } from "@/components/ui/Spinner";
import { useGetFeedInfiniteQuery } from "@/store/api/contentApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetFeedOrder,
  revealLive,
  setCategoryFilter,
  setFeedOrder,
  setTypeFilter,
  type TypeFilter,
} from "@/store/slices/feedSlice";
import { DataBadge } from "./DataBadge";
import { PageHeader } from "./PageHeader";

function useGreetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? "greeting.morning" : hour < 18 ? "greeting.afternoon" : "greeting.evening";
}

export function FeedView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const greetingKey = useGreetingKey();
  const user = useAppSelector((s) => s.auth.user);
  const categories = useAppSelector((s) => s.preferences.categories);
  const favoritesCount = useAppSelector((s) => s.favorites.items.length);
  const { order, live, pendingLive, typeFilter, categoryFilter } = useAppSelector((s) => s.feed);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useGetFeedInfiniteQuery(categories);

  // live posts on top -> all fetched pages -> user's drag-and-drop order
  const allItems = useMemo(
    () => applyOrder(dedupe([...live, ...(data?.pages.flatMap((p) => p.items) ?? [])]), order),
    [live, data, order],
  );
  const visible = useMemo(
    () =>
      allItems.filter(
        (i) => (typeFilter === "all" || i.type === typeFilter) && (categoryFilter === "all" || i.category === categoryFilter),
      ),
    [allItems, typeFilter, categoryFilter],
  );

  const onReorder = useCallback(
    (ids: string[]) => dispatch(setFeedOrder(reorderSubset(allItems.map((i) => i.id), ids))),
    [dispatch, allItems],
  );

  const canLoadMore = Boolean(hasNextPage) && !isFetchingNextPage && !isFetchNextPageError;
  const sentinelRef = useInfiniteScroll<HTMLDivElement>({ enabled: canLoadMore, onLoadMore: () => void fetchNextPage() });

  const typeOptions = (["all", "news", "movie", "social"] as TypeFilter[]).map((value) => ({
    value,
    label: t(`types.${value}`),
    count: value === "all" ? allItems.length : allItems.filter((i) => i.type === value).length,
  }));

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2 text-sm font-medium text-muted">
            <Sparkles className="size-4 text-accent-3" aria-hidden />
            {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
          </span>
        }
        title={
          <>
            {t(greetingKey)}, <span className="text-gradient">{user?.name.split(" ")[0]}</span>
          </>
        }
        subtitle={t("feed.subtitle", { count: categories.length })}
        actions={
          <>
            <DataBadge origins={data?.pages[0]?.origins} />
            <Link
              href="/favorites"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-card hover:text-text"
            >
              <Heart className="size-3.5 text-rose-500" aria-hidden /> {favoritesCount}
            </Link>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SegmentedTabs
          label={t("feed.filterType")}
          layoutId="feed-type-tabs"
          options={typeOptions}
          value={typeFilter}
          onChange={(v) => dispatch(setTypeFilter(v))}
        />
        <div role="group" aria-label={t("feed.filterCategory")} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <CategoryChip active={categoryFilter === "all"} onClick={() => dispatch(setCategoryFilter("all"))} label={t("feed.all")} />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              category={c}
              active={categoryFilter === c}
              onClick={() => dispatch(setCategoryFilter(categoryFilter === c ? "all" : c))}
              label={t(`categories.${c}`)}
            />
          ))}
          {order.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(resetFeedOrder())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-text"
            >
              <RotateCcw className="size-3.5" aria-hidden /> {t("feed.resetOrder")}
            </button>
          )}
        </div>
      </div>

      {/* Real-time: new posts pill */}
      <div aria-live="polite" className="pointer-events-none sticky top-[88px] z-30 flex h-0 justify-center">
        <AnimatePresence>
          {pendingLive.length > 0 && (
            <motion.button
              type="button"
              data-testid="new-posts"
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9 }}
              onClick={() => {
                dispatch(revealLive());
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-gradient-brand pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow"
            >
              <ArrowUp className="size-4" aria-hidden />
              {t("feed.newPosts", { count: pendingLive.length })}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ContentGrid
        items={visible}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        empty={{ title: t("states.emptyTitle"), description: t("states.emptyFeed") }}
        onReorder={onReorder}
      />

      {/* Infinite scroll */}
      {allItems.length > 0 && (
        <div className="mt-10">
          {isFetchingNextPage && <SkeletonGrid count={3} />}
          <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-8" data-testid="feed-end">
            {isFetchingNextPage ? (
              <Spinner label={t("states.loading")} />
            ) : hasNextPage ? (
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold shadow-card transition hover:border-accent"
              >
                {isFetchNextPageError ? t("states.retry") : t("feed.loadMore")}
              </button>
            ) : (
              <p className="text-sm text-muted">{t("feed.end")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ category, active, onClick, label }: { category?: Category; active: boolean; onClick: () => void; label: string }) {
  const meta = category ? CATEGORY_META[category] : null;
  const Icon = meta?.icon;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active ? "border-transparent bg-text text-bg" : "border-border bg-surface text-muted hover:text-text",
      )}
    >
      {Icon && <Icon className="size-3.5" style={{ color: active ? undefined : meta?.color }} aria-hidden />}
      {label}
    </button>
  );
}
