"use client";

import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { reorderSubset } from "@/lib/feed";
import { ContentGrid } from "@/components/feed/ContentGrid";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearFavorites, setFavoritesOrder } from "@/store/slices/favoritesSlice";
import type { TypeFilter } from "@/store/slices/feedSlice";
import { PageHeader } from "./PageHeader";

export function FavoritesView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((s) => s.favorites.items);
  const [filter, setFilter] = useState<TypeFilter>("all");

  const visible = useMemo(() => (filter === "all" ? favorites : favorites.filter((f) => f.type === filter)), [favorites, filter]);

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2 text-sm font-medium text-rose-500">
            <Heart className="size-4" fill="currentColor" aria-hidden /> {t("favorites.count", { count: favorites.length })}
          </span>
        }
        title={t("favorites.title")}
        subtitle={t("favorites.subtitle")}
        actions={
          favorites.length > 0 && (
            <button
              type="button"
              onClick={() => window.confirm(t("favorites.confirmClear")) && dispatch(clearFavorites())}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-red-500 shadow-card transition hover:border-red-500"
            >
              <Trash2 className="size-4" aria-hidden /> {t("favorites.clear")}
            </button>
          )
        }
      />

      {favorites.length > 0 && (
        <SegmentedTabs
          className="mb-6"
          label={t("feed.filterType")}
          layoutId="favorites-tabs"
          value={filter}
          onChange={setFilter}
          options={(["all", "news", "movie", "social"] as TypeFilter[]).map((value) => ({
            value,
            label: t(`types.${value}`),
            count: value === "all" ? favorites.length : favorites.filter((f) => f.type === value).length,
          }))}
        />
      )}

      <ContentGrid
        items={visible}
        empty={{
          title: t("favorites.emptyTitle"),
          description: t("favorites.emptyBody"),
          action: (
            <Link href="/" className="bg-gradient-brand inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
              {t("favorites.explore")}
            </Link>
          ),
        }}
        onReorder={(ids) => dispatch(setFavoritesOrder(reorderSubset(favorites.map((f) => f.id), ids)))}
      />
    </div>
  );
}
