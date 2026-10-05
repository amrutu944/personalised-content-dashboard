import type { Metadata } from "next";
import { FeedView } from "@/components/views/FeedView";

export const metadata: Metadata = { title: "My Feed" };

export default function FeedPage() {
  return <FeedView />;
}
