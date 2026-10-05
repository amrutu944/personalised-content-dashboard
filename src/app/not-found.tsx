import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <Logo className="mb-8" />
        <p className="text-gradient font-display text-8xl font-bold">404</p>
        <p className="mt-4 text-muted">This page drifted out of your feed.</p>
        <Link href="/" className="bg-gradient-brand mt-8 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
