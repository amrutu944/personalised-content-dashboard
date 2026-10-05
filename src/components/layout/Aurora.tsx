/** Soft animated gradient blobs behind the app — purely decorative. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-float absolute -left-40 -top-40 size-[34rem] rounded-full bg-[var(--accent)] opacity-[0.10] blur-[120px] dark:opacity-[0.16]" />
      <div className="animate-float absolute -right-40 top-1/3 size-[30rem] rounded-full bg-[var(--accent-2)] opacity-[0.08] blur-[120px] [animation-delay:-5s] dark:opacity-[0.12]" />
      <div className="animate-float absolute bottom-[-12rem] left-1/3 size-[28rem] rounded-full bg-[var(--accent-3)] opacity-[0.06] blur-[120px] [animation-delay:-9s] dark:opacity-[0.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
    </div>
  );
}
