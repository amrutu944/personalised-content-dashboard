"use client";

import type { ReactNode } from "react";
import type { ContentItem } from "@/lib/types";
import { AnimatedCard, ContentCard } from "@/components/cards/ContentCard";
import { GRID_CLASS, SkeletonGrid } from "@/components/cards/CardSkeleton";
import { EmptyState, ErrorState } from "@/components/ui/StateViews";
import { SortableGrid } from "./SortableGrid";

interface ContentGridProps {
  items: ContentItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  empty: { title: string; description?: string; action?: ReactNode };
  /** When provided, cards become drag-and-drop sortable. */
  onReorder?: (ids: string[]) => void;
}

/**
 * Renders the right UI for every async state: loading skeletons, error with
 * retry, empty state, or the (optionally sortable) grid of cards.
 */
export function ContentGrid({ items, isLoading, isError, onRetry, empty, onReorder }: ContentGridProps) {
  if (isLoading && !items.length) return <SkeletonGrid />;
  if (isError && !items.length) return <ErrorState onRetry={onRetry} />;
  if (!items.length) return <EmptyState title={empty.title} description={empty.description} action={empty.action} />;

  if (onReorder) return <SortableGrid items={items} onReorder={onReorder} />;

  return (
    <ul className={GRID_CLASS}>
      {items.map((item, index) => (
        <li key={item.id}>
          <AnimatedCard index={index}>
            <ContentCard item={item} priority={index < 3} />
          </AnimatedCard>
        </li>
      ))}
    </ul>
  );
}
