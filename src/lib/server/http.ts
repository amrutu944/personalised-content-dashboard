/**
 * Server-only fetch helper. Responses are cached by Next.js' Data Cache for
 * `revalidate` seconds, which protects free-tier API quotas (NewsAPI: 100 req/day).
 */
export async function fetchJson<T>(
  url: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  const { revalidate = 600, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Upstream ${new URL(url).host} responded ${res.status}`);
  }
  return (await res.json()) as T;
}
