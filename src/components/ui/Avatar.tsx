import { AVATAR_GRADIENTS, gradientFor, initials } from "@/lib/meta";
import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-12 text-base", xl: "size-20 text-2xl" };

/** Initials avatar — no external image requests, always on-brand. */
export function Avatar({ name, color, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-surface", SIZES[size], className)}
      style={{ background: (color && AVATAR_GRADIENTS[color]) || gradientFor(name) }}
    >
      {initials(name) || "?"}
    </span>
  );
}
