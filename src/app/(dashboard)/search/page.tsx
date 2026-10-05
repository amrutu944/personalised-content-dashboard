import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/views/SearchView";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  // useSearchParams() in a client component requires a Suspense boundary.
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
