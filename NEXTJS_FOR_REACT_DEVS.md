# Next.js for React developers: a map of this project

If you know React, you already know most of this codebase. Components, hooks, props, state and Redux work exactly as in a Vite/CRA app. This page explains **only the parts that are specific to Next.js**, using real files from this repo.

---

## 1. Routing = folders (no react-router)

| React Router | Next.js (this repo) |
|---|---|
| `<Route path="/" element={<Feed/>} />` | `src/app/(dashboard)/page.tsx` |
| `<Route path="/trending" …/>` | `src/app/(dashboard)/trending/page.tsx` |
| `<Route path="/login" …/>` | `src/app/login/page.tsx` |
| `<Link to="/x">` | `<Link href="/x">` from `next/link` |
| `useNavigate()` | `useRouter()` from `next/navigation` → `router.push("/x")` |
| `useLocation().pathname` | `usePathname()` |
| `useSearchParams()` | `useSearchParams()` from `next/navigation` |

**Rule:** a folder becomes a URL segment, and the `page.tsx` inside it is what renders there.

**`(dashboard)`** — folders in parentheses are *route groups*: they organise files but are **not part of the URL**. We use one so every dashboard page shares the sidebar + header, but `/login` doesn't.

## 2. Layouts replace the "App.jsx wrapper"

- `src/app/layout.tsx` is the **root layout**: the `<html>` / `<body>` that wraps every page. It loads fonts, global CSS and our `<Providers>` (Redux, i18n, Framer Motion), the same job `main.jsx` + `App.jsx` do in Vite.
- `src/app/(dashboard)/layout.tsx` wraps only dashboard pages in `<AppShell>` (sidebar + header + auth guard).
- `src/app/(dashboard)/template.tsx` is like a layout but **re-mounts on every navigation**, which is why we use it for the page-transition animation.

## 3. Server vs Client Components (`"use client"`)

By default, files in `app/` are **Server Components**: they render on the server and ship no JavaScript. That's great for static content, but **they can't use hooks, state, effects, event handlers or browser APIs**.

Add `"use client"` at the top of a file to make it a normal React component. In this project:

- `page.tsx` files are tiny server components that export `metadata` (the page `<title>`) and render a client view, e.g. `<FeedView />`.
- Everything interactive (`components/views/*`, cards, header, Redux hooks) starts with `"use client"`.

> Interview line: *"Pages are server components for metadata and static shells; the interactive dashboard lives in client components, so we get fast initial HTML while keeping full React interactivity."*

## 4. API routes = a backend inside the same project

`src/app/api/feed/route.ts` exports `GET(request)` and becomes the endpoint `GET /api/feed`. This code runs **only on the server**, so:

- it can read secret env vars (`process.env.NEWS_API_KEY`) safely
- it calls NewsAPI + TMDB + social **in parallel** and returns one combined response
- the browser never sees the API keys

This pattern is called **Backend-for-Frontend (BFF)**. Without Next.js you'd need a separate Express server.

`src/app/api/stream/route.ts` returns a streaming `Response` for **Server-Sent Events** (real-time posts).

## 5. Environment variables

| Name | Visible where? |
|---|---|
| `NEWS_API_KEY` (no prefix) | **Server only** (API routes) ✅ used for secrets |
| `NEXT_PUBLIC_SOMETHING` | Bundled into browser JS ❌ never put secrets here |

Local values go in `.env.local` (git-ignored). See `.env.example`.

## 6. Data caching on the server

In `src/lib/server/http.ts`:

```ts
fetch(url, { next: { revalidate: 600 } })
```

Next.js caches that upstream response for 10 minutes, so 100 users hitting the feed only cost **one** NewsAPI request. That protects the free 100-requests/day quota.

## 7. Built-in optimizations used here

- **`next/font`** (`layout.tsx`) self-hosts Google Fonts at build time, so there's no layout shift and no runtime request to Google.
- **`next/image`** (`components/ui/SmartImage.tsx`) gives lazy loading, responsive `sizes`, and optimization for allowed hosts (configured in `next.config.ts`).
- **`metadata` export** in each `page.tsx` sets the browser tab title (`My Feed · Pulse`).
- **`<Suspense>`** around pages that call `useSearchParams()`, which Next.js requires for static prerendering.

## 8. Hydration (why there's a splash screen)

The server can't read `localStorage`, so it renders a neutral splash. In the browser, `Providers.tsx` loads saved state into Redux, then the real UI appears. If the first browser render differed from the server HTML, React would throw a *hydration mismatch*. `hooks/useHydrated.ts` prevents that, and the inline script in `layout.tsx` applies your saved theme **before** the first paint, so there's no white flash.

## 9. Redux in Next.js

The only difference from a Vite app: **create the store inside a component** (`useState(() => makeStore())` in `Providers.tsx`), not as a global `export const store = …`. On a server, a global store would be shared between different users' requests.

---

### Commands cheat-sheet

```bash
npm run dev      # like `vite` — dev server with hot reload
npm run build    # production build (also type-checks)
npm start        # serve the production build
```

### 60-second tour for an interview

1. `app/(dashboard)/layout.tsx` → shared shell
2. `app/api/feed/route.ts` → BFF, parallel fetch, keys hidden
3. `store/api/contentApi.ts` → RTK Query infinite feed
4. `components/feed/SortableGrid.tsx` → accessible drag-and-drop
5. `hooks/useDebounce.ts` + `components/views/SearchView.tsx` → debounced search
6. `store/persistence.ts` → SSR-safe localStorage
7. `e2e/dnd.spec.ts` → proves DnD works with mouse **and** keyboard
