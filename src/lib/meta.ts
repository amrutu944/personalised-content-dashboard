import {
  Briefcase,
  Clapperboard,
  Cpu,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Newspaper,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Category, ContentType } from "@/lib/types";

/** Visual metadata (icon + accent) for categories and content types. */

export const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string }> = {
  technology: { icon: Cpu, color: "#7c6cff" },
  business: { icon: Briefcase, color: "#f59e0b" },
  sports: { icon: Trophy, color: "#10b981" },
  entertainment: { icon: Clapperboard, color: "#ec4899" },
  science: { icon: FlaskConical, color: "#06b6d4" },
  health: { icon: HeartPulse, color: "#ef4444" },
};

export const TYPE_META: Record<ContentType, { icon: LucideIcon; colorVar: string }> = {
  news: { icon: Newspaper, colorVar: "var(--news)" },
  movie: { icon: Clapperboard, colorVar: "var(--movie)" },
  social: { icon: MessageCircle, colorVar: "var(--social)" },
};

export const AVATAR_GRADIENTS: Record<string, string> = {
  violet: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  sky: "linear-gradient(135deg,#38bdf8,#2563eb)",
  emerald: "linear-gradient(135deg,#34d399,#059669)",
  amber: "linear-gradient(135deg,#fbbf24,#ea580c)",
  rose: "linear-gradient(135deg,#fb7185,#e11d48)",
  fuchsia: "linear-gradient(135deg,#e879f9,#a21caf)",
};

/** Deterministic gradient for avatars of social authors. */
export function gradientFor(seed: string): string {
  const keys = Object.keys(AVATAR_GRADIENTS);
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[keys[h % keys.length]];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
