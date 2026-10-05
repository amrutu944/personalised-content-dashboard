"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { MotionConfig } from "framer-motion";
import i18n from "@/i18n";
import { makeStore, type AppStore } from "@/store";
import { hydrate } from "@/store/actions";
import { useAppSelector } from "@/store/hooks";
import { loadPersistedState } from "@/store/persistence";

/**
 * Client-side providers. `"use client"` is required because Redux, i18n and
 * Framer Motion rely on React context and browser APIs.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Lazy initializer: one store per browser tab, created exactly once.
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(hydrate(loadPersistedState()));
  }, [store]);

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        {/* Respects the OS "reduce motion" setting for accessibility */}
        <MotionConfig reducedMotion="user">
          <PreferenceEffects />
          {children}
        </MotionConfig>
      </I18nextProvider>
    </Provider>
  );
}

/** Syncs theme + language preferences from Redux to the DOM and i18next. */
function PreferenceEffects() {
  const theme = useAppSelector((s) => s.preferences.theme);
  const language = useAppSelector((s) => s.preferences.language);
  const hydrated = useAppSelector((s) => s.ui.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language, hydrated]);

  return null;
}
