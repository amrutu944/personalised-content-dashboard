"use client";

import { motion } from "framer-motion";
import { Flame, Star, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/lib/types";
import { compactNumber, timeAgo } from "@/lib/feed";
import { TYPE_META } from "@/lib/meta";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import { PreviewModal } from "@/components/cards/PreviewModal";
import { SmartImage } from "@/components/ui/SmartImage";
import { ErrorState } from "@/components/ui/StateViews";
import { useGetTrendingQuery } from "@/store/api/contentApi";
import { useAppSelector } from "@/store/hooks";
import { DataBadge } from "./DataBadge";
import { PageHeader } from "./PageHeader";

export function TrendingView() {
  const { t } = useTranslation();
  const categories = useAppSelector((s) => s.preferences.categories);
  const { data, isLoading, isError, refetch } = useGetTrendingQuery(categories);

  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  const [top, ...restNews] = data?.news ?? [];

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2 text-sm font-medium text-orange-500">
            <Flame className="size-4" aria-hidden /> {t("nav.trending")}
          </span>
        }
        title={t("trending.title")}
        subtitle={t("trending.subtitle")}
        actions={<DataBadge origins={data?.origins} />}
      />

      {isLoading || !data ? (
        <TrendingSkeleton />
      ) : (
        <div className="space-y-10">
          {top && <HeroStory item={top} label={t("trending.top")} />}
          <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            <RankedList title={t("trending.news")} icon={TYPE_META.news.icon} color="var(--news)" items={restNews} />
            <RankedList title={t("trending.movies")} icon={TYPE_META.movie.icon} color="var(--movie)" items={data.movies} />
            <RankedList title={t("trending.social")} icon={TYPE_META.social.icon} color="var(--social)" items={data.social} />
          </div>
        </div>
      )}
    </div>
  );
}

function HeroStory({ item, label }: { item: ContentItem; label: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[2rem] border border-border shadow-glow"
    >
      <div className="relative aspect-[16/10] sm:aspect-[21/9]">
        <SmartImage src={item.image} alt="" type={item.type} priority sizes="100vw" className="transition-transform duration-[1.5s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
        <span className="bg-gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
          <Flame className="size-3.5" aria-hidden /> {label}
        </span>
        <h2 className="font-display mt-4 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">{item.title}</h2>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-base">{item.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
              {t("card.readMore")}
            </a>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
              {t("card.readMore")}
            </button>
          )}
          <FavoriteButton item={item} />
          <span className="text-sm text-white/70">
            {item.source} · {timeAgo(item.publishedAt)}
          </span>
        </div>
      </div>
      <PreviewModal item={item} open={open} onClose={() => setOpen(false)} />
    </motion.article>
  );
}

function RankedList({ title, icon: Icon, color, items }: { title: string; icon: LucideIcon; color: string; items: ContentItem[] }) {
  return (
    <section aria-label={title} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg font-semibold">
        <span className="grid size-8 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
          <Icon className="size-4" aria-hidden />
        </span>
        {title}
      </h2>
      <ol className="space-y-1">
        {items.slice(0, 6).map((item, i) => (
          <RankedRow key={item.id} item={item} rank={i + 1} />
        ))}
      </ol>
    </section>
  );
}

function RankedRow({ item, rank }: { item: ContentItem; rank: number }) {
  const [open, setOpen] = useState(false);
  const isSocial = item.type === "social";
  const title = isSocial ? item.description : item.title;
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-surface-2"
    >
      <span className="text-gradient font-display w-9 shrink-0 text-3xl font-bold tabular-nums">{String(rank).padStart(2, "0")}</span>
      {!isSocial && (
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
          <SmartImage src={item.image} alt="" type={item.type} sizes="56px" />
        </span>
      )}
      <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
        <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent">{title}</span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          {item.type === "movie" && (
            <>
              <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden /> {item.meta?.rating?.toFixed(1)} ·
            </>
          )}
          {isSocial ? `@${item.meta?.handle} · ♥ ${compactNumber(item.meta?.likes ?? 0)}` : item.source}
        </span>
      </button>
      <PreviewModal item={item} open={open} onClose={() => setOpen(false)} />
    </motion.li>
  );
}

function TrendingSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <div className="skeleton aspect-[16/10] rounded-[2rem] sm:aspect-[21/9]" />
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-3xl border border-border bg-surface p-5">
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="skeleton h-14 rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
