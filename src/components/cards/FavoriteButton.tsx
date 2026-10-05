"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";

export function FavoriteButton({ item, className }: { item: ContentItem; className?: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.favorites.items.some((f) => f.id === item.id));

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={() => dispatch(toggleFavorite(item))}
      aria-pressed={active}
      aria-label={active ? t("card.unfavorite") : t("card.favorite")}
      title={active ? t("card.unfavorite") : t("card.favorite")}
      className={cn(
        "relative grid size-9 place-items-center rounded-full border transition-colors",
        active
          ? "border-transparent bg-rose-500 text-white shadow-[0_8px_20px_-6px_rgb(244_63_94/0.7)]"
          : "glass border-white/20 text-text hover:text-rose-500",
        className,
      )}
    >
      <Heart className="size-4" fill={active ? "currentColor" : "none"} aria-hidden />
      <AnimatePresence>
        {active && (
          <motion.span
            key="burst"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-rose-400"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
