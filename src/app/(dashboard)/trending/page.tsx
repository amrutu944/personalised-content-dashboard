import type { Metadata } from "next";
import { TrendingView } from "@/components/views/TrendingView";

export const metadata: Metadata = { title: "Trending" };

export default function TrendingPage() {
  return <TrendingView />;
}
