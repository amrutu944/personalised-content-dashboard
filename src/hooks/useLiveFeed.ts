"use client";

import { useEffect } from "react";
import type { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { liveItemReceived } from "@/store/slices/feedSlice";
import { setLiveStatus } from "@/store/slices/uiSlice";

/**
 * Subscribes to the Server-Sent Events stream at /api/stream and pushes new
 * posts into Redux. EventSource reconnects automatically if the connection drops.
 */
export function useLiveFeed() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((s) => s.preferences.liveUpdates && Boolean(s.auth.user));
  const categories = useAppSelector((s) => s.preferences.categories);
  const key = categories.join(",");

  useEffect(() => {
    if (!enabled || typeof EventSource === "undefined") {
      dispatch(setLiveStatus("off"));
      return;
    }
    dispatch(setLiveStatus("connecting"));
    const source = new EventSource(`/api/stream?categories=${encodeURIComponent(key)}`);
    source.onopen = () => dispatch(setLiveStatus("live"));
    source.onerror = () => dispatch(setLiveStatus(source.readyState === EventSource.CLOSED ? "error" : "connecting"));
    source.addEventListener("post", (event) => {
      try {
        dispatch(liveItemReceived(JSON.parse((event as MessageEvent<string>).data) as ContentItem));
      } catch {
        /* ignore malformed event */
      }
    });
    return () => source.close();
  }, [enabled, key, dispatch]);
}
