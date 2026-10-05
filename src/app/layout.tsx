import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers/Providers";
import { STORAGE_KEY } from "@/store/persistence";
import "./globals.css";

// next/font self-hosts fonts at build time: no layout shift, no Google request at runtime.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Pulse — Personalized Content Dashboard", template: "%s · Pulse" },
  description: "News, movies and social posts in one beautiful, personalized dashboard.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07080f" },
  ],
};

/**
 * Runs before first paint to apply the saved theme, preventing a light/dark
 * flash (see Next.js guide "Preventing flash before hydration").
 */
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||"{}");var t=(s.preferences&&s.preferences.theme)||"dark";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";if(s.preferences&&s.preferences.language)e.lang=s.preferences.language;}catch(_){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${jakarta.variable} ${space.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
