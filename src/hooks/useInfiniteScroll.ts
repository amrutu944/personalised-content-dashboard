"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `onLoadMore` when the returned sentinel element scrolls into view.
 * `rootMargin` starts loading slightly before the user reaches the bottom.
 */
export function useInfiniteScroll<T extends Element>({
  enabled,
  onLoadMore,
  rootMargin = "600px",
}: {
  enabled: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}) {
  const ref = useRef<T | null>(null);
  const callback = useRef(onLoadMore);
  // Keep the latest callback without re-creating the observer on every render.
  useEffect(() => {
    callback.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) callback.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return ref;
}
