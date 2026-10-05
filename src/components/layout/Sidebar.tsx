"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, LayoutDashboard, Search, Settings, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCategoryFilter } from "@/store/slices/feedSlice";
import { setSidebarOpen } from "@/store/slices/uiSlice";

interface NavItem {
  href: string;
  key: "feed" | "trending" | "favorites" | "search" | "settings";
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", key: "feed", icon: LayoutDashboard },
  { href: "/trending", key: "trending", icon: Flame },
  { href: "/favorites", key: "favorites", icon: Heart },
  { href: "/search", key: "search", icon: Search },
  { href: "/settings", key: "settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favoritesCount = useAppSelector((s) => s.favorites.items.length);
  const categories = useAppSelector((s) => s.preferences.categories);
  const activeCategory = useAppSelector((s) => s.feed.categoryFilter);

  const openCategory = (category: Category) => {
    dispatch(setCategoryFilter(category));
    router.push("/");
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <Link href="/" onClick={onNavigate} className="px-2" aria-label="Pulse home">
        <Logo />
      </Link>

      <nav aria-label={t("nav.main")}>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  data-testid={`nav-${key}`}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl border border-border bg-surface shadow-card"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <Icon className={cn("relative size-[18px]", active && "text-accent")} aria-hidden />
                  <span className="relative flex-1">{t(`nav.${key}`)}</span>
                  {key === "favorites" && favoritesCount > 0 && (
                    <span className="bg-gradient-brand relative rounded-full px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t("nav.topics")}</p>
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const { icon: Icon, color } = CATEGORY_META[category];
            const active = pathname === "/" && activeCategory === category;
            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => openCategory(category)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <span className="grid size-6 place-items-center rounded-lg" style={{ background: `${color}22`, color }}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  {t(`categories.${category}`)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="bg-gradient-brand -mx-4 -mt-4 mb-3 h-1" />
        <p className="font-display text-sm font-semibold">{t("brand.tagline")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t("feed.dragHint")}</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const pathname = usePathname();
  const close = () => dispatch(setSidebarOpen(false));

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    dispatch(setSidebarOpen(false));
  }, [pathname, dispatch]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dispatch(setSidebarOpen(false));
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dispatch]);

  return (
    <>
      {/* Desktop */}
      <aside className="glass sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-border lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label={t("header.closeMenu")}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.main")}
              className="absolute inset-y-0 left-0 w-[85%] max-w-xs border-r border-border bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <button
                type="button"
                onClick={close}
                aria-label={t("header.closeMenu")}
                className="absolute right-4 top-6 grid size-9 place-items-center rounded-full hover:bg-surface-2"
              >
                <X className="size-5" aria-hidden />
              </button>
              <SidebarContent onNavigate={close} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
