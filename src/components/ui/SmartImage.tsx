"use client";

import Image from "next/image";
import { useState } from "react";
import type { ContentType } from "@/lib/types";
import { TYPE_META } from "@/lib/meta";
import { cn } from "@/lib/cn";

/** Hosts configured in next.config.ts for Next.js image optimization. */
const OPTIMIZED_HOSTS = ["picsum.photos", "fastly.picsum.photos", "image.tmdb.org"];

function isOptimizable(src: string) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

interface SmartImageProps {
  src?: string | null;
  alt: string;
  type: ContentType;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * next/image wrapper: lazy-loads, optimizes known hosts, and degrades to a
 * branded gradient placeholder when the image is missing or fails to load
 * (news APIs frequently return broken image URLs).
 */
export function SmartImage({ src, alt, type, sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw", className, priority }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const { icon: Icon, colorVar } = TYPE_META[type];

  if (!src || failed) {
    return (
      <div
        className={cn("absolute inset-0 grid place-items-center", className)}
        style={{ background: `radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, ${colorVar} 45%, transparent), transparent 60%), var(--surface-2)` }}
        aria-hidden
      >
        <Icon className="size-10 opacity-40" style={{ color: colorVar }} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!isOptimizable(src)}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
