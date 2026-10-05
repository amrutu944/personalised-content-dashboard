"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CATEGORIES } from "@/lib/types";
import { AVATAR_GRADIENTS, CATEGORY_META } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { resetApp } from "@/store/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AVATAR_COLORS, updateProfile, type AvatarColor } from "@/store/slices/authSlice";
import {
  LANGUAGES,
  setLanguage,
  setLiveUpdates,
  setTheme,
  toggleCategory,
  type ThemePreference,
} from "@/store/slices/preferencesSlice";
import { LANGUAGE_LABELS } from "@/components/layout/HeaderControls";
import { PageHeader } from "./PageHeader";

export function SettingsView() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="space-y-6">
        <ProfileSection />
        <ContentSection />
        <AppearanceSection />
        <DataSection />
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8"
      aria-labelledby={`section-${title}`}
    >
      <h2 id={`section-${title}`} className="font-display text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-[color-mix(in_oklab,var(--accent)_18%,transparent)]";

function ProfileSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [color, setColor] = useState<AvatarColor>(user.avatarColor);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile({ name, bio, avatarColor: color }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Section title={t("settings.profile")}>
      <form onSubmit={save} className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <Avatar name={name || user.name} color={color} size="xl" />
          <fieldset>
            <legend className="sr-only">{t("settings.avatarColor")}</legend>
            <div className="flex gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="avatar-color" value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                  <span
                    className="block size-6 rounded-full ring-offset-2 ring-offset-surface transition peer-checked:ring-2 peer-checked:ring-text peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
                    style={{ background: AVATAR_GRADIENTS[c] }}
                    title={c}
                  />
                  <span className="sr-only">{c}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t("settings.name")}</span>
            <input className={inputClass} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t("settings.email")}</span>
            <input className={cn(inputClass, "text-muted")} value={user.email} readOnly aria-readonly />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">{t("settings.bio")}</span>
            <textarea
              className={cn(inputClass, "min-h-20 resize-y")}
              value={bio}
              maxLength={160}
              placeholder={t("settings.bioPlaceholder")}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" className="bg-gradient-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
              {t("settings.save")}
            </button>
            <AnimatePresence>
              {saved && (
                <motion.span
                  role="status"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-500"
                >
                  <Check className="size-4" aria-hidden /> {t("settings.saved")}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </Section>
  );
}

function ContentSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.preferences.categories);

  return (
    <Section title={t("settings.content")} description={t("settings.contentHint")}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label={t("settings.content")}>
        {CATEGORIES.map((category) => {
          const { icon: Icon, color } = CATEGORY_META[category];
          const active = selected.includes(category);
          const locked = active && selected.length === 1;
          return (
            <motion.button
              key={category}
              type="button"
              whileTap={{ scale: 0.97 }}
              aria-pressed={active}
              aria-disabled={locked}
              data-testid={`category-${category}`}
              onClick={() => dispatch(toggleCategory(category))}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl border p-4 text-left transition",
                active ? "border-transparent shadow-card" : "border-border hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]",
                locked && "cursor-not-allowed",
              )}
              style={active ? { background: `color-mix(in oklab, ${color} 14%, var(--surface))`, boxShadow: `inset 0 0 0 1.5px ${color}` } : undefined}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color }}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold leading-tight">{t(`categories.${category}`)}</span>
              {active && (
                <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full text-white" style={{ background: color }}>
                  <Check className="size-3" aria-hidden />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </Section>
  );
}

function AppearanceSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { theme, language, liveUpdates } = useAppSelector((s) => s.preferences);
  const themes: { value: ThemePreference; icon: typeof Sun }[] = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  return (
    <Section title={t("settings.appearance")}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3" role="group" aria-label={t("settings.appearance")}>
          {themes.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => dispatch(setTheme(value))}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition",
                theme === value ? "border-accent bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-accent" : "border-border text-muted hover:text-text",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {t(`settings.theme.${value}`)}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium">{t("settings.language")}</span>
          <select value={language} onChange={(e) => dispatch(setLanguage(e.target.value as typeof language))} className={cn(inputClass, "sm:w-56")}>
            {LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {LANGUAGE_LABELS[lng]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p id="live-label" className="text-sm font-medium">
              {t("settings.live")}
            </p>
            <p className="text-sm text-muted">{t("settings.liveHint")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={liveUpdates}
            aria-labelledby="live-label"
            onClick={() => dispatch(setLiveUpdates(!liveUpdates))}
            className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", liveUpdates ? "bg-gradient-brand" : "bg-surface-2 ring-1 ring-border")}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={cn("absolute top-1 size-5 rounded-full bg-white shadow", liveUpdates ? "right-1" : "left-1")}
            />
          </button>
        </div>
      </div>
    </Section>
  );
}

function DataSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  return (
    <Section title={t("settings.data")} description={t("settings.dataHint")}>
      <button
        type="button"
        onClick={() => {
          if (!window.confirm(t("settings.confirmReset"))) return;
          dispatch(resetApp());
          router.replace("/login");
        }}
        className="rounded-full border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
      >
        {t("settings.reset")}
      </button>
    </Section>
  );
}
