import type { ContentItem, ContentType } from "@/lib/types";

/**
 * Pure feed helpers shared by the server (aggregation) and client (ordering).
 * Kept framework-free so they are trivial to unit test.
 */

/**
 * Mixes sources into one feed using a repeating pattern, e.g. weights
 * { news: 2, movie: 1, social: 1 } => N N M S N N M S ...
 */
export function interleave(
  sources: Partial<Record<ContentType, ContentItem[]>>,
  weights: Record<ContentType, number> = { news: 2, movie: 1, social: 1 },
): ContentItem[] {
  const queues = (Object.keys(weights) as ContentType[]).map((type) => ({
    type,
    items: [...(sources[type] ?? [])],
  }));
  const out: ContentItem[] = [];
  while (queues.some((q) => q.items.length)) {
    for (const q of queues) out.push(...q.items.splice(0, weights[q.type]));
  }
  return out;
}

/** Removes duplicates (same id) keeping the first occurrence. */
export function dedupe(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

/**
 * Applies a user-defined order (from drag-and-drop) to a list of items.
 * Items in `order` come first in that order; unknown items keep their
 * natural position at the end, so newly loaded pages still append.
 */
export function applyOrder(items: ContentItem[], order: string[]): ContentItem[] {
  if (!order.length) return items;
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = order.map((id) => byId.get(id)).filter((x): x is ContentItem => Boolean(x));
  const orderedIds = new Set(ordered.map((i) => i.id));
  return [...ordered, ...items.filter((item) => !orderedIds.has(item.id))];
}

/** Moves an element of an array from one index to another (immutable). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const y = new Date(iso).getFullYear();
  return d < 365 ? `${Math.floor(d / 30)}mo` : String(y);
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/**
 * Reorders a filtered subset inside the full list. When the user drags within
 * a filtered view (e.g. only "News"), the hidden items keep their positions and
 * the visible ones are written back into the slots they occupied.
 */
export function reorderSubset(fullIds: string[], reorderedSubset: string[]): string[] {
  const subset = new Set(reorderedSubset);
  const result = [...fullIds];
  let cursor = 0;
  for (let i = 0; i < result.length; i++) {
    if (subset.has(result[i])) result[i] = reorderedSubset[cursor++];
  }
  return result;
}
