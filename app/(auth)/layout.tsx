import { AuthProvider } from "@/components/auth/auth-provider";
import { BrandPanel } from "@/components/auth/brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative grid min-h-dvh overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="dot-grid-faint pointer-events-none absolute inset-0" />
        <div className="bg-auth-glow pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-28 top-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl dark:bg-brand/20" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-bold text-primary-foreground">
                P
              </span>
              <p className="font-heading text-lg font-semibold tracking-tight">
                Plan<span className="text-brand">break</span>
              </p>
            </div>
            <ThemeToggle />
          </div>

          <AuthProvider>{children}</AuthProvider>
        </div>
      </main>

      <div className="absolute right-5 top-5 z-10 hidden lg:block">
        <ThemeToggle />
      </div>
    </div>
  );
}
