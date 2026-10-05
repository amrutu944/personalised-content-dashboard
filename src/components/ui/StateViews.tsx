"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Inbox, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface StateViewProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}

/** Shared illustration-style layout for empty and error states. */
export function StateView({ icon: Icon = Inbox, title, description, action, tone = "neutral" }: StateViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <div
          className="absolute inset-0 -z-10 scale-150 rounded-full opacity-40 blur-2xl"
          style={{ background: tone === "danger" ? "#ef4444" : "var(--accent)" }}
        />
        <div className="grid size-16 place-items-center rounded-2xl border border-border bg-surface shadow-card">
          <Icon className={tone === "danger" ? "size-7 text-red-500" : "size-7 text-accent"} aria-hidden />
        </div>
      </div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function EmptyState(props: Omit<StateViewProps, "tone">) {
  return <StateView {...props} />;
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <div role="alert">
      <StateView
        tone="danger"
        icon={AlertTriangle}
        title={t("states.errorTitle")}
        description={message ?? t("states.errorBody")}
        action={
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
            >
              <RefreshCw className="size-4" aria-hidden /> {t("states.retry")}
            </button>
          )
        }
      />
    </div>
  );
}
