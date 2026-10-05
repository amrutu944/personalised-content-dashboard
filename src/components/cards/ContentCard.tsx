"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GripVertical, Heart, Play, Repeat2, Star } from "lucide-react";
import { memo, useState, type HTMLAttributes, type Ref } from "react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/lib/types";
import { compactNumber, timeAgo } from "@/lib/feed";
import { TYPE_META } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { SmartImage } from "@/components/ui/SmartImage";
import { FavoriteButton } from "./FavoriteButton";
import { PreviewModal } from "./PreviewModal";

/** Props a drag-and-drop wrapper passes down to render the drag handle. */
export interface DragHandleProps {
  ref: Ref<HTMLButtonElement>;
  attributes: HTMLAttributes<HTMLButtonElement>;
  listeners?: Record<string, unknown>;
}

interface ContentCardProps {
  item: ContentItem;
  dragHandle?: DragHandleProps;
  isDragging?: boolean;
  priority?: boolean;
}

function ContentCardBase({ item, dragHandle, isDragging, priority }: ContentCardProps) {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const { icon: TypeIcon, colorVar } = TYPE_META[item.type];
  const isSocial = item.type === "social";

  const ctaLabel = item.type === "movie" ? t("card.playNow") : isSocial ? t("card.viewPost") : t("card.readMore");
  const CtaIcon = item.type === "movie" ? Play : ArrowUpRight;
  const ctaClass =
    "group/cta inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all";

  return (
    <article
      data-testid={isDragging ? "drag-overlay" : "content-card"}
      data-id={item.id}
      aria-label={isSocial ? `${item.meta?.author}: ${item.description}` : item.title}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300",
        "hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] hover:shadow-glow",
        isDragging && "rotate-[1.5deg] scale-[1.02] shadow-glow ring-2 ring-accent",
      )}
    >
      {/* Accent line in the content type's colour */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 opacity-80" style={{ background: colorVar }} />

      {isSocial ? (
        <header className="flex items-center gap-3 px-5 pt-5">
          <Avatar name={item.meta?.author ?? "?"} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">{item.meta?.author}</p>
            <p className="truncate text-sm text-muted">
              @{item.meta?.handle} · <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
            </p>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-surface-2" title={t(`types.${item.type}`)}>
            <TypeIcon className="size-4" style={{ color: colorVar }} aria-hidden />
            <span className="sr-only">{t(`types.${item.type}`)}</span>
          </span>
          {dragHandle && <DragHandle {...dragHandle} label={t("card.drag")} />}
          <FavoriteButton item={item} className="border-border" />
        </header>
      ) : null}

      {item.image || !isSocial ? (
        <div className={cn("relative overflow-hidden", isSocial ? "mx-5 mt-4 aspect-[16/9] rounded-2xl" : "aspect-[16/10]")}>
          <SmartImage
            src={item.image}
            alt=""
            type={item.type}
            priority={priority}
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {!isSocial && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />
              <div className="absolute left-4 top-4">
                <TypeBadge type={item.type} label={t(`types.${item.type}`)} />
              </div>
              {item.meta?.rating !== undefined && (
                <span
                  className="glass absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1 text-xs font-bold"
                  aria-label={t("card.rating", { value: item.meta.rating.toFixed(1) })}
                >
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  {item.meta.rating.toFixed(1)}
                </span>
              )}
            </>
          )}
        </div>
      ) : null}

      {/* Floating actions over the image */}
      {!isSocial && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          {dragHandle && <DragHandle {...dragHandle} label={t("card.drag")} />}
          <FavoriteButton item={item} />
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {!isSocial && (
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
            <span className="truncate">{item.source}</span>
            <span aria-hidden>•</span>
            <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt)}</time>
          </p>
        )}
        {!isSocial && <h3 className="font-display line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{item.title}</h3>}
        <p className={cn("text-sm leading-relaxed", isSocial ? "line-clamp-5 text-[15px]" : "mt-2 line-clamp-3 text-muted")}>
          {item.description}
        </p>
        {isSocial && item.meta?.hashtags && (
          <p className="mt-2 flex flex-wrap gap-x-2 text-sm font-medium text-accent">
            {item.meta.hashtags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          {isSocial ? (
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5" title={t("card.likes")}>
                <Heart className="size-4" aria-hidden /> {compactNumber(item.meta?.likes ?? 0)}
                <span className="sr-only">{t("card.likes")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5" title={t("card.reposts")}>
                <Repeat2 className="size-4" aria-hidden /> {compactNumber(item.meta?.reposts ?? 0)}
                <span className="sr-only">{t("card.reposts")}</span>
              </span>
            </div>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
              <TypeIcon className="size-3.5 shrink-0" style={{ color: colorVar }} aria-hidden />
              <span className="truncate">{t(`categories.${item.category}`)}</span>
            </span>
          )}

          {item.url && !isSocial ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ctaClass, "bg-text text-bg hover:gap-2.5")}
              aria-label={`${ctaLabel}: ${item.title}`}
            >
              {ctaLabel} <CtaIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className={cn(ctaClass, isSocial ? "bg-surface-2 text-text hover:bg-border" : "bg-text text-bg hover:gap-2.5")}
              aria-label={`${ctaLabel}: ${isSocial ? item.meta?.author : item.title}`}
            >
              {ctaLabel} <CtaIcon className="size-4" aria-hidden />
            </button>
          )}
        </div>

      </div>

      <PreviewModal item={item} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </article>
  );
}

function TypeBadge({ type, label }: { type: ContentItem["type"]; label: string }) {
  const { icon: Icon, colorVar } = TYPE_META[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] backdrop-blur-md font-bold uppercase tracking-wider text-white">
      <Icon className="size-3.5" style={{ color: colorVar }} aria-hidden />
      {label}
    </span>
  );
}

function DragHandle({ ref, attributes, listeners, label }: DragHandleProps & { label: string }) {
  return (
    <button
      ref={ref}
      type="button"
      {...attributes}
      {...(listeners as HTMLAttributes<HTMLButtonElement>)}
      aria-label={label}
      title={label}
      data-testid="drag-handle"
      className="glass grid size-9 cursor-grab touch-none place-items-center rounded-full border border-white/20 text-text opacity-100 transition-opacity active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );
}

export const ContentCard = memo(ContentCardBase);

/** Entrance animation wrapper used by grids. */
export function AnimatedCard({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index % 12, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
