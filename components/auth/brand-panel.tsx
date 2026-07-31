"use client";

import { motion } from "motion/react";

const steps = [
  { label: "Riset literatur & referensi", estimate: "± 45 menit" },
  { label: "Kerangka bab & draft awal", estimate: "± 2 jam" },
  { label: "Revisi & finalisasi", estimate: "± 1,5 jam" },
];

export function BrandPanel() {
  return (
    <aside className="dot-grid relative hidden overflow-hidden bg-[#0b1220] text-slate-100 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_15%_0%,rgb(45_212_191/0.12),transparent_62%),radial-gradient(50%_50%_at_100%_100%,rgb(14_165_233/0.12),transparent_62%)]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#0ea5e9]/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-heading text-sm font-bold text-primary-foreground">
            P
          </span>
          <p className="font-heading text-lg font-semibold tracking-tight">
            Plan<span className="text-[#2dd4bf]">break</span>
          </p>
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
            className="max-w-md font-heading text-4xl font-semibold leading-tight tracking-tight"
          >
            Satu rencana besar,{" "}
            <span className="text-[#2dd4bf]">dipecah</span> jadi langkah kecil.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.3 }}
            className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Rencana besar
              </p>
              <span className="rounded-full bg-[#2dd4bf]/15 px-2.5 py-1 text-[11px] font-medium text-[#2dd4bf]">
                AI breakdown
              </span>
            </div>
            <p className="mt-3 text-lg font-medium text-white">
              Selesaikan proyek skripsi
            </p>

            <div className="relative mt-6 space-y-5 pl-5">
              <motion.span
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.9, ease: "easeInOut", delay: 0.55 }}
                className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-gradient-to-b from-[#2dd4bf] via-[#2dd4bf]/60 to-transparent"
              />
              {steps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                    delay: 0.65 + index * 0.18,
                  }}
                  className="relative"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 16,
                      delay: 0.7 + index * 0.18,
                    }}
                    className="absolute -left-[26px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#2dd4bf] ring-4 ring-[#0b1220]"
                  />
                  <p className="font-mono text-[11px] tracking-widest text-slate-500">
                    0{index + 1}
                  </p>
                  <p className="text-sm text-slate-200">{step.label}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {step.estimate}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500"
        >
          Pecah · Kerjakan · Selesaikan
        </motion.p>
      </div>
    </aside>
  );
}
