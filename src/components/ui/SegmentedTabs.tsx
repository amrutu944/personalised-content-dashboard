"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Unique id so multiple tab groups don't share the animated pill. */
  layoutId: string;
  className?: string;
}

/** Accessible segmented control with a sliding Framer Motion indicator. */
export function SegmentedTabs<T extends string>({ options, value, onChange, label, layoutId, className }: SegmentedTabsProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 shadow-card [scrollbar-width:none]", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-3.5",
              active ? "text-white" : "text-muted hover:text-text",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="bg-gradient-brand absolute inset-0 rounded-full shadow-glow"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {opt.label}
              {opt.count !== undefined && (
                <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-white/25" : "bg-surface-2")}>{opt.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
