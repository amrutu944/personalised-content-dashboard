"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/lib/types";
import { timeAgo } from "@/lib/feed";
import { TYPE_META } from "@/lib/meta";
import { SmartImage } from "@/components/ui/SmartImage";
import { FavoriteButton } from "./FavoriteButton";

/**
 * Accessible detail dialog used for items without an external URL (e.g. demo
 * data and social posts). Closes on Escape / backdrop click and restores focus.
 */
export function PreviewModal({ item, open, onClose }: { item: ContentItem; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const { icon: Icon, colorVar } = TYPE_META[item.type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label={t("card.close")} tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`dialog-${item.id}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
          >
            {item.image && (
              <div className="relative aspect-[16/9]">
                <SmartImage src={item.image} alt="" type={item.type} sizes="600px" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: colorVar }}>
                <Icon className="size-4" aria-hidden /> {t(`types.${item.type}`)} · {t(`categories.${item.category}`)}
              </div>
              <h2 id={`dialog-${item.id}`} className="font-display text-2xl font-bold leading-tight">
                {item.type === "social" ? item.meta?.author : item.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {item.type === "social" ? `@${item.meta?.handle}` : item.source} · {timeAgo(item.publishedAt)}
              </p>
              <p className="mt-4 leading-relaxed">{item.description}</p>
              {item.meta?.hashtags && (
                <p className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-accent">
                  {item.meta.hashtags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between gap-3">
                <FavoriteButton item={item} className="border-border" />
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-gradient-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
                    {t("card.openSource")} <ExternalLink className="size-4" aria-hidden />
                  </a>
                )}
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t("card.close")}
              className="glass absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/20"
            >
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
