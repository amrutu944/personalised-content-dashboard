import { cn } from "@/lib/cn";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="bg-gradient-brand relative grid size-9 place-items-center rounded-xl shadow-glow">
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12h4l2.5-6 5 12L17 12h4" />
        </svg>
      </span>
      {showText && <span className="font-display text-xl font-bold tracking-tight">Pulse</span>}
    </span>
  );
}
