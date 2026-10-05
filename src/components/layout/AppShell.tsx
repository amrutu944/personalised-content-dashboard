"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLiveFeed } from "@/hooks/useLiveFeed";
import { useHydrated } from "@/hooks/useHydrated";
import { useAppSelector } from "@/store/hooks";
import { Aurora } from "./Aurora";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Splash } from "./Splash";

/**
 * Dashboard chrome: sidebar + sticky header + main content.
 * Also acts as a client-side auth guard (mock auth lives in Redux/localStorage).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const user = useAppSelector((s) => s.auth.user);

  useLiveFeed();

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, router, pathname]);

  if (!hydrated || !user) return <Splash />;

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="bg-gradient-brand fixed left-4 top-4 z-[100] -translate-y-24 rounded-full px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
      >
        {t("nav.skip")}
      </a>
      <Aurora />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
