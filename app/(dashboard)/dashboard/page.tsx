import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="grid gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Ringkasan pekan ini
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Halo, {session?.user?.name ?? "kamu"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Statistik dan tugas kamu akan muncul di sini pada section berikutnya.
        </p>
      </div>
    </div>
  );
}
