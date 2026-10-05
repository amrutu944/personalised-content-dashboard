"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Languages, LogOut, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { LANGUAGES, setLanguage, setTheme, type Language } from "@/store/slices/preferencesSlice";

export const LANGUAGE_LABELS: Record<Language, string> = { en: "English", hi: "हिन्दी", es: "Español" };

const iconButton =
  "relative grid size-11 place-items-center rounded-full border border-border bg-surface text-text shadow-card transition hover:border-accent hover:text-accent";

const DARK_QUERY = "(prefers-color-scheme: dark)";
function subscribeColorScheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const getSystemDark = () => window.matchMedia(DARK_QUERY).matches;

export function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.preferences.theme);
  const systemDark = useSyncExternalStore(subscribeColorScheme, getSystemDark, () => true);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={() => dispatch(setTheme(isDark ? "light" : "dark"))}
      aria-label={t("header.toggleTheme")}
      aria-pressed={isDark}
      title={t("header.toggleTheme")}
      className={cn(iconButton, "overflow-hidden")}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 18, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -18, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Moon className="size-[18px]" aria-hidden /> : <Sun className="size-[18px]" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.preferences.language);
  return (
    <label className={cn(iconButton, "hidden w-auto gap-1.5 px-3 sm:flex")}>
      <Languages className="size-[18px]" aria-hidden />
      <span className="sr-only">{t("header.language")}</span>
      <select
        value={language}
        data-testid="language-select"
        onChange={(e) => dispatch(setLanguage(e.target.value as Language))}
        className="cursor-pointer bg-transparent text-sm font-medium outline-none"
      >
        {LANGUAGES.map((lng) => (
          <option key={lng} value={lng} className="bg-surface text-text">
            {lng.toUpperCase()} · {LANGUAGE_LABELS[lng]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LiveIndicator() {
  const { t } = useTranslation();
  const status = useAppSelector((s) => s.ui.liveStatus);
  const live = status === "live";
  return (
    <span
      className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold shadow-card md:inline-flex"
      title={live ? t("header.live") : t("header.offline")}
    >
      <span className="relative flex size-2.5">
        {live && <span className="animate-pulse-ring absolute inset-0 rounded-full bg-emerald-500" />}
        <span className={cn("relative size-2.5 rounded-full", live ? "bg-emerald-500" : "bg-muted")} />
      </span>
      {live ? t("header.live") : t("header.offline")}
    </span>
  );
}

export function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("header.account")}
        data-testid="user-menu"
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-1 shadow-card transition hover:border-accent sm:pr-3"
      >
        <Avatar name={user.name} color={user.avatarColor} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">{user.name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-14 z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-2xl"
          >
            <div className="flex items-center gap-3 rounded-xl p-3">
              <Avatar name={user.name} color={user.avatarColor} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              role="menuitem"
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-2"
            >
              <Settings className="size-4" aria-hidden /> {t("nav.settings")}
            </Link>
            <button
              role="menuitem"
              type="button"
              data-testid="logout"
              onClick={() => {
                dispatch(logout());
                router.replace("/login");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-surface-2"
            >
              <LogOut className="size-4" aria-hidden /> {t("header.signOut")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
