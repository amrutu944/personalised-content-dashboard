"use client";

import { Database, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentType, DataOrigin } from "@/lib/types";

/** Tells the viewer honestly whether they're seeing live API data or demo data. */
export function DataBadge({ origins }: { origins?: Record<ContentType, DataOrigin> }) {
  const { t } = useTranslation();
  if (!origins) return null;
  const live = origins.news === "live" || origins.movie === "live";
  return (
    <span
      title={live ? undefined : t("feed.demoDataHint")}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-card"
    >
      {live ? <Zap className="size-3.5 text-emerald-500" aria-hidden /> : <Database className="size-3.5 text-amber-500" aria-hidden />}
      {live ? t("feed.liveData") : t("feed.demoData")}
      {!live && <span className="sr-only">: {t("feed.demoDataHint")}</span>}
    </span>
  );
}
