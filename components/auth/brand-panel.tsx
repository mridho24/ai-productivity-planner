const steps = [
  { label: "Riset literatur & referensi", estimate: "± 45 menit" },
  { label: "Kerangka bab & draft awal", estimate: "± 2 jam" },
  { label: "Revisi & finalisasi", estimate: "± 1,5 jam" },
];

export function BrandPanel() {
  return (
    <aside className="dot-grid relative hidden overflow-hidden bg-[#0b1220] text-slate-100 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#0ea5e9]/10 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-bold text-primary-foreground">
          P
        </span>
        <p className="font-heading text-lg font-semibold tracking-tight">
          Plan<span className="text-[#2dd4bf]">break</span>
        </p>
      </div>

      <div className="relative">
        <p className="max-w-md font-heading text-4xl font-semibold leading-tight tracking-tight">
          Satu rencana besar,{" "}
          <span className="text-[#2dd4bf]">dipecah</span> jadi langkah kecil.
        </p>

        <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              Rencana besar
            </p>
            <span className="rounded-full bg-[#2dd4bf]/15 px-2.5 py-1 text-[11px] font-medium text-[#2dd4bf]">
              AI breakdown
            </span>
          </div>
          <p className="mt-3 text-lg font-medium text-white">Selesaikan proyek skripsi</p>

          <div className="mt-6 space-y-5 border-l border-slate-700/70 pl-5">
            {steps.map((step, index) => (
              <div key={step.label} className="relative">
                <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-[#2dd4bf] ring-4 ring-[#0b1220]" />
                <p className="font-mono text-[11px] tracking-widest text-slate-500">
                  0{index + 1}
                </p>
                <p className="text-sm text-slate-200">{step.label}</p>
                <p className="font-mono text-[11px] text-slate-500">{step.estimate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        Pecah · Kerjakan · Selesaikan
      </p>
    </aside>
  );
}
