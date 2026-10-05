import { Logo } from "@/components/ui/Logo";

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading Pulse">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <span className="animate-pulse-ring absolute inset-0 rounded-xl bg-[var(--accent)] opacity-60" />
          <Logo showText={false} />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-2">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    </div>
  );
}
