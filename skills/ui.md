---
name: modern-web-design
description: Panduan desain visual modern + scroll-trigger animation kompleks. Gunakan setiap kali membuat atau mendesain ulang UI web, agar hasilnya tidak terlihat seperti "template bikinan AI" dan punya interaksi scroll yang terasa premium/custom.
---

# Modern Web Design + Complex Scroll-Trigger

Perlakukan diri sebagai motion/interaction designer di studio yang dikenal
membuat website yang orang screenshot dan bilang "gila, ini gimana bikinnya".
Klien sudah bosan lihat landing page yang terasa dibuat AI. Tugasmu: bikin
sesuatu yang punya identitas visual sendiri DAN interaksi scroll yang terasa
direkayasa dengan teliti, bukan efek acak yang ditempel.

---

## 1. Hindari "Bau AI" (AI-tell) di Desain

Desain hasil AI generatif saat ini cenderung jatuh ke 3 pola generik. Kenali
supaya bisa dihindari kecuali brief secara eksplisit meminta:

1. Background krem hangat (~#F4F1EA) + serif display kontras tinggi +
   aksen terracotta/oranye tanah (~#D97757).
2. Background nyaris hitam + satu aksen neon (hijau asam / vermilion),
   dengan glow/gradient di semua tempat.
3. Layout ala "broadsheet": garis tipis (hairline rules), radius 0,
   kolom rapat mirip koran.

Tanda lain yang bikin web "terasa AI":

- Icon dari satu icon-pack yang sama dipakai di semua section tanpa variasi.
- Card dengan shadow lembut + border-radius besar seragam di semua elemen.
- Hero section: judul besar + subjudul + 2 tombol (gradient) + badge kecil
  di atas judul — pola template ini valid tapi HARUS dipertanyakan dulu,
  jangan otomatis dipakai.
- Semua section punya struktur yang persis sama (judul tengah, 3 kolom,
  ikon di atas teks) — beri variasi ritme antar section.
- Copy generik: "Empowering your workflow", "Unlock your potential",
  "Seamless experience" — tulis copy yang spesifik untuk produk ini.

**Aturan:** sebelum ngoding, tanya ke diri sendiri "kalau saya dapat brief
serupa besok, apakah saya akan menghasilkan hal yang sama persis?" Kalau ya,
ubah setidaknya satu sumbu (warna, tipografi, atau struktur layout).

---

## 2. Proses Desain (2 tahap wajib)

**Tahap 1 — Rancang token system sebelum ngoding:**

- **Warna:** 4–6 hex value bernama, spesifik untuk brief ini (bukan default).
- **Tipografi:** minimal 2 font role — display (berkarakter, dipakai
  terbatas) + body (netral, nyaman dibaca). Tentukan scale (ukuran, weight,
  letter-spacing) secara eksplisit, jangan pakai default Tailwind mentah.
- **Layout:** deskripsikan konsep grid/ritme per section pakai kalimat +
  ASCII wireframe kalau perlu.
- **Signature moment:** satu elemen yang bikin halaman ini diingat — bisa
  berupa scroll interaction, transisi, atau treatment visual unik.

**Tahap 2 — Kritik sebelum build:**
Bandingkan rencana dengan 3 pola AI-tell di atas. Kalau ada yang mirip,
revisi dan catat apa yang diubah. Baru setelah itu mulai coding, dan ikuti
rencana yang sudah direvisi.

---

## 3. Scroll-Trigger: Stack yang Direkomendasikan

Untuk Next.js/React, gunakan kombinasi ini (semua gratis, ringan):

| Kebutuhan                                   | Library                         |
| ------------------------------------------- | ------------------------------- |
| Smooth scroll (inertia)                     | `lenis`                         |
| Scroll-linked animation, pinning, scrubbing | `gsap` + `ScrollTrigger`        |
| Animasi state React (masuk/keluar viewport) | `framer-motion` (`whileInView`) |
| Deteksi elemen masuk viewport (ringan)      | `IntersectionObserver` native   |

Install:

```bash
npm install gsap lenis
```

Setup dasar Lenis + GSAP ScrollTrigger sinkron (taruh di root layout, client
component):

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

---

## 4. Pola Scroll-Trigger yang "Kompleks" (bukan sekadar fade-in)

Fade-in-on-scroll biasa itu template. Kombinasikan minimal 2–3 pola berikut
supaya interaksi terasa direkayasa:

1. **Pinning + scrub (section "menempel" saat di-scroll)**
   Section tetap diam di layar selama user scroll, sementara konten di
   dalamnya berubah progresif (mis. angka statistik naik, gambar berganti,
   teks berubah baris demi baris).

   ```js
   gsap
     .timeline({
       scrollTrigger: {
         trigger: ".pin-section",
         start: "top top",
         end: "+=2000",
         pin: true,
         scrub: 1,
       },
     })
     .to(".layer-1", { yPercent: -30 })
     .to(".headline", { opacity: 1, y: 0 }, "<")
     .to(".stat-number", { innerText: 128 }, "<");
   ```

2. **Staggered text reveal per kata/huruf**
   Split teks jadi span per kata (pakai util split manual, hindari lib
   berat), lalu animasikan masuk satu-satu dengan stagger saat section
   masuk viewport.

3. **Horizontal scroll section**
   Satu section discroll ke samping mengikuti scroll vertikal (cocok untuk
   galeri proyek/portfolio):

   ```js
   gsap.to(".track", {
     xPercent: -100 * (slidesCount - 1),
     ease: "none",
     scrollTrigger: {
       trigger: ".horizontal-wrapper",
       pin: true,
       scrub: 1,
       end: () => "+=" + document.querySelector(".track").offsetWidth,
     },
   });
   ```

4. **Parallax berlapis (multi-depth)**
   Minimal 2–3 layer bergerak dengan kecepatan berbeda (`yPercent`
   berbeda-beda) untuk memberi kedalaman — bukan cuma 1 gambar yang geser.

5. **Scroll-linked SVG path drawing**
   Garis/ikon SVG "digambar" progresif sesuai posisi scroll, cocok untuk
   timeline atau diagram proses (pakai `stroke-dashoffset` di-scrub).

6. **Mask/clip-path reveal**
   Gambar atau blok teks muncul lewat `clip-path` yang membuka progresif
   (bukan cuma opacity), terasa lebih premium.

7. **Progress indicator yang nyata**
   Kalau ada pinned section panjang, kasih indikator progres (garis di
   sisi layar / angka section) yang terikat ke progress scrollTrigger,
   bukan animasi kosmetik doang.

8. **Color/theme transition saat scroll**
   Background section berubah warna secara halus (di-scrub, bukan snap)
   saat scroll melewati batas antar section — beri jeda ritme visual.

**Aturan komposisi:** jangan tumpuk semua pola di satu halaman. Pilih 1
"signature scroll moment" yang jadi pusat perhatian (biasanya di hero atau
satu section pivot), dan buat sisanya lebih tenang (reveal sederhana,
stagger ringan) supaya yang signature benar-benar menonjol.

---

## 5. Wajib: Performa & Aksesibilitas

- Hormati preferensi user: bungkus semua animasi berat dengan cek
  `prefers-reduced-motion`, dan sediakan versi statis/fade sederhana.
  ```js
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mql.matches) {
    /* skip pin/parallax, pakai fade biasa */
  }
  ```
- Selalu `ScrollTrigger.refresh()` setelah font/image selesai load, supaya
  posisi trigger tidak meleset.
- Jangan animasikan properti yang memicu layout reflow (`width`, `top`,
  `left`). Pakai `transform` (`x`, `y`, `scale`) dan `opacity` saja.
- Set `will-change: transform` hanya pada elemen yang benar-benar
  dianimasikan, lalu lepas setelah selesai (hindari memori GPU membengkak).
- Uji di mobile: pinning/scrub yang berat bisa terasa patah di device
  low-end — sediakan fallback lebih sederhana untuk viewport kecil.
- Bersihkan semua `ScrollTrigger` instance saat komponen unmount
  (`ScrollTrigger.getAll().forEach(t => t.kill())` di cleanup effect React)
  supaya tidak bocor saat navigasi client-side Next.js.

---

## 6. Checklist Sebelum Selesai

- [ ] Palet warna & tipografi spesifik untuk brief ini, bukan default.
- [ ] Tidak ada 2 dari 3 pola "AI-tell" yang muncul tanpa alasan.
- [ ] Ada satu signature scroll moment yang jelas, sisanya tenang.
- [ ] Minimal 1 pola scroll kompleks selain fade-in (pinning/horizontal/
      parallax/mask/SVG draw).
- [ ] `prefers-reduced-motion` dihormati.
- [ ] Tidak ada animasi yang mengubah `width/top/left` (pakai transform).
- [ ] ScrollTrigger di-cleanup saat unmount.
- [ ] Sudah dites di viewport mobile.
