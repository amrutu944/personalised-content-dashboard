"use client";

import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/Logo";
import { useAppDispatch } from "@/store/hooks";
import { setSidebarOpen } from "@/store/slices/uiSlice";
import { LanguageSwitcher, LiveIndicator, ThemeToggle, UserMenu } from "./HeaderControls";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => dispatch(setSidebarOpen(true))}
          aria-label={t("header.openMenu")}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-surface lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <span className="hidden sm:block lg:hidden">
          <Logo showText={false} />
        </span>
        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LiveIndicator />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
