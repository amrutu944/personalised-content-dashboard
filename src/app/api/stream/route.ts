import type { NextRequest } from "next/server";
import { parseCategories } from "@/lib/types";
import { liveSocialPost } from "@/lib/mock/generators";

/**
 * GET /api/stream?categories=... — Server-Sent Events (SSE) real-time feed.
 *
 * Pushes a new social post every few seconds. Serverless hosts cap request
 * duration, so the stream closes itself after ~50s and the browser's
 * EventSource reconnects automatically (using the `retry` hint below).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const INTERVAL_MS = 12_000;
const LIFETIME_MS = 50_000;

export async function GET(request: NextRequest) {
  const categories = parseCategories(request.nextUrl.searchParams.get("categories"));
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let closer: ReturnType<typeof setTimeout> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let tick = 0;
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* stream already closed */
        }
      };
      send(`retry: 3000\n: connected\n\n`);
      timer = setInterval(() => {
        const post = liveSocialPost(categories, tick++);
        send(`event: post\ndata: ${JSON.stringify(post)}\n\n`);
      }, INTERVAL_MS);
      closer = setTimeout(() => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          /* noop */
        }
      }, LIFETIME_MS);
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        clearTimeout(closer);
      });
    },
    cancel() {
      clearInterval(timer);
      clearTimeout(closer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
