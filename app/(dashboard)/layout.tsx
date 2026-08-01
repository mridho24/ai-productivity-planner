import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/dashboard" className="shrink-0">
              <p className="font-heading text-lg font-semibold tracking-tight">
                Plan<span className="text-brand">break</span>
              </p>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground lg:inline">
              {session.user.email}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <Toaster />
    </div>
  );
}
