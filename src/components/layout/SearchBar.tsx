"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchQuery } from "@/store/slices/uiSlice";

/**
 * Global search input. It updates Redux on every keystroke (instant UI), while
 * the Search page debounces that value before calling the API.
 * Press "/" anywhere to focus it.
 */
export function SearchBar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const query = useAppSelector((s) => s.ui.searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onChange = (value: string) => {
    dispatch(setSearchQuery(value));
    if (pathname !== "/search" && value.trim()) router.push("/search");
  };

  return (
    <form role="search" className="relative w-full max-w-xl" onSubmit={(e) => (e.preventDefault(), router.push("/search"))}>
      <label htmlFor="global-search" className="sr-only">
        {t("header.searchLabel")}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        ref={inputRef}
        id="global-search"
        data-testid="search-input"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("header.searchPlaceholder")}
        className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-20 text-sm shadow-card outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-[color-mix(in_oklab,var(--accent)_18%,transparent)] [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            dispatch(setSearchQuery(""));
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-muted sm:block">
          /
        </kbd>
      )}
    </form>
  );
}
