import { Sparkles } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Insight mingguan
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Insight mingguan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan pola produktivitas dan saran dari AI.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-xl bg-black p-6 text-slate-100 ring-1 ring-white/10 sm:p-8">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#2dd4bf]/15 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/15 text-[#2dd4bf]">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              AI weekly insight
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
              Insight pekan ini masih disiapkan
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-300">
              Setelah cukup data tugas, AI akan merangkum pola produktivitas,
              prioritas yang menumpuk, dan saran agar pekan depan lebih ringan.
              Fitur ini hadir di rilis berikutnya.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
