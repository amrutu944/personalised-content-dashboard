"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clapperboard, GripVertical, Newspaper, Radio, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Aurora } from "@/components/layout/Aurora";
import { Splash } from "@/components/layout/Splash";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout/HeaderControls";
import { Logo } from "@/components/ui/Logo";
import { useHydrated } from "@/hooks/useHydrated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, loginAsGuest } from "@/store/slices/authSlice";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function validateLogin(values: { name: string; email: string; password: string }): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "auth.errors.name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "auth.errors.email";
  if (values.password.length < 6) errors.password = "auth.errors.password";
  return errors;
}

/** Only allow same-origin relative redirects (prevents open-redirect attacks). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const user = useAppSelector((s) => s.auth.user);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, router, next]);

  if (!hydrated || user) return <Splash />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    dispatch(login({ name: values.name, email: values.email }));
  };

  const field = (key: keyof typeof values, type: string, autoComplete: string) => (
    <div>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium">
        {t(`auth.${key}`)}
      </label>
      <input
        id={key}
        name={key}
        type={type}
        autoComplete={autoComplete}
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-surface px-4 text-sm outline-none transition focus:ring-4",
          errors[key]
            ? "border-red-500 focus:ring-red-500/20"
            : "border-border focus:border-accent focus:ring-[color-mix(in_oklab,var(--accent)_18%,transparent)]",
        )}
      />
      {errors[key] && (
        <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-500">
          {t(errors[key]!)}
        </p>
      )}
    </div>
  );

  const features = [
    { icon: Newspaper, text: t("auth.features.one") },
    { icon: GripVertical, text: t("auth.features.two") },
    { icon: Radio, text: t("auth.features.three") },
  ];

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <Aurora />
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-gradient-brand absolute inset-0 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative text-white">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 12h4l2.5-6 5 12L17 12h4" />
              </svg>
            </span>
            <span className="font-display text-xl font-bold">Pulse</span>
          </span>
        </div>
        <div className="relative max-w-lg text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight"
          >
            {t("brand.tagline")}
          </motion.h2>
          <ul className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-4 text-lg"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="size-5" aria-hidden />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </div>
        {/* Floating preview cards */}
        <div className="relative flex gap-4">
          {[
            { icon: Newspaper, label: "Tech", w: "w-44" },
            { icon: Clapperboard, label: "8.4 ★", w: "w-36" },
          ].map(({ icon: Icon, label, w }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ delay: 0.3 + i * 0.15, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" } }}
              className={cn("rounded-2xl border border-white/25 bg-white/15 p-4 text-white backdrop-blur-md", w)}
            >
              <Icon className="mb-6 size-5" aria-hidden />
              <div className="h-2 w-3/4 rounded-full bg-white/50" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-white/30" />
              <p className="mt-3 text-xs font-semibold">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form */}
      <main className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <span className="lg:invisible">
            <Logo />
          </span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto my-auto w-full max-w-sm py-12"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("auth.welcome")}</h1>
          <p className="mt-2 text-muted">{t("auth.subtitle")}</p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4" data-testid="login-form">
            {field("name", "text", "name")}
            {field("email", "email", "email")}
            {field("password", "password", "current-password")}
            <button
              type="submit"
              className="bg-gradient-brand group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              {t("auth.signIn")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-border" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            data-testid="guest-login"
            onClick={() => dispatch(loginAsGuest())}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold shadow-card transition hover:border-accent"
          >
            <UserRound className="size-4" aria-hidden /> {t("auth.guest")}
          </button>
          <p className="mt-6 text-center text-xs text-muted">{t("auth.demoNote")}</p>
        </motion.div>
      </main>
    </div>
  );
}
