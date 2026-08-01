import { Sparkles } from "lucide-react";

export function AiBreakdownPlaceholder() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-black p-6 text-slate-100 ring-1 ring-white/10 sm:p-7">
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#2dd4bf]/15 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/15 text-[#2dd4bf]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
            AI breakdown
          </p>
          <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
            Pecah tugas ini otomatis
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-300">
            AI akan membagi tugas besar ini menjadi sub-task lengkap dengan
            estimasi waktu. Fitur ini hadir di rilis berikutnya.
          </p>
        </div>
      </div>
    </section>
  );
}
