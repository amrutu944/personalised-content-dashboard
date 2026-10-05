"use client";

import { useSyncExternalStore } from "react";
import { useAppSelector } from "@/store/hooks";

const subscribe = () => () => {};

/**
 * True once persisted state is loaded AND this component is past hydration.
 *
 * During hydration React uses the server snapshot (`false`), so the first
 * client render always matches the server HTML, even for components inside
 * a Suspense boundary that hydrates after the store was already filled.
 */
export function useHydrated(): boolean {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const storeHydrated = useAppSelector((s) => s.ui.hydrated);
  return isClient && storeHydrated;
}
