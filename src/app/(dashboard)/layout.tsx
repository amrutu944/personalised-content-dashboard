import { AppShell } from "@/components/layout/AppShell";

/**
 * Route group "(dashboard)": the parentheses mean the folder name is NOT part
 * of the URL. Every page inside shares this layout (sidebar + header).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
