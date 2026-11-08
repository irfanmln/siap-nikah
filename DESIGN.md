# Design Direction: Siap Nikah (Wedding Planning & Budgeting Suite)

Dokumen ini adalah acuan resmi desain, identitas visual, dan standar antarmuka (*single source of truth*) untuk platform **Siap Nikah**.

---

## 1. Identitas & Karakter Produk
* **Personality:** Hangat, Romantis, Elegan, Tenang, dan Transparan.
* **Tujuan Visual:** Mengurangi stres calon pengantin dalam merencanakan pernikahan. Antarmuka harus terasa seperti buku jurnal pernikahan premium yang rapi dan teratur, bukan dasbor korporat yang kaku atau template SaaS AI generik.
* **Audience:** Pasangan calon pengantin (Pria & Wanita) usia 22–35 tahun yang mengakses lewat ponsel pintar (mobile-first) dan laptop.

---

## 2. Three Dials (Konfigurasi Liveliness Anti-Slop)

| Dial | Level | Nilai | Penjelasan & Alasan |
|---|---|---|---|
| **ENERGY** | Level 2 | Balanced | Hangat dan menyambut tanpa berteriak. Menghindari animasi norak, partikel melayang, dan gradien pelangi. |
| **RHYTHM** | Level 2 | Consistent with Breaks | Kartu modul teratur dan rapi dengan penekanan visual khusus pada KPI penting (Countdown Hari H & Progres Tabungan). |
| **MOTION** | Level 1 | Micro-interactions | Mengutamakan performa dan aksesibilitas: transisi hover halus (150–200ms), modal fade-in cepat, tanpa gerakan terus-menerus yang memicu distraksi. |

---

## 3. Sistem Warna (Color System)

| Peran | Token Tailwind | Nilai Hex | Alasan Pemilihan & Fungsi |
|---|---|---|---|
| **Primary (Romance)** | `rose-600` / `rose-700` | `#e11d48` / `#be123c` | Mewakili kehangatan cinta, pernikahan, dan tombol aksi utama (*CTA*). |
| **Neutral Base (Warm Paper)** | `stone-50` / `stone-100` | `#faf8f5` / `#f5f5f4` | Nuansa kertas undangan mewah (*off-white warm*), tidak memakai putih silau murni. |
| **Neutral Text (Ink)** | `stone-900` / `stone-700` | `#1c1917` / `#44403c` | Warna tinta cetak hitam-hangat berteksur dengan rasio kontras WCAG AAA (>7:1). |
| **Secondary Accent (Prosperity)**| `amber-500` / `amber-600` | `#f59e0b` / `#d97706` | Digunakan eksklusif untuk indikator mahar emas/logam mulia & status VIP. |
| **Success / Progress** | `emerald-600` | `#059669` | Indikator progres lunas, verifikasi checklist dokumen, dan centang selesai. |

*Aturan Ketat Warna:*
- Dilarang menggunakan gradien neon biru-ungu (AI default gradient).
- Dilarang menumpuk lebih dari 3 warna kontras dalam 1 komponen.

---

## 4. Tipografi (Typography)

* **Display & Judul (Headings):** `Playfair Display` (Serif)
  * *Alasan:* Memberikan sentuhan klasik, sakral, dan elegan seperti undangan pernikahan fisik.
* **Isi & Formulir (Body & Inputs):** `Plus Jakarta Sans` (Sans-Serif)
  * *Alasan:* Sangat mudah dibaca (*legibility tinggi*) pada layar HP berukuran kecil, angka nominal rupiah jelas, dan ramah pengguna.
* **Ukuran Input Minimum:** `16px` pada perangkat layar sentuh untuk mencegah auto-zoom iOS Safari.

---

## 5. Skala Bentuk (Border Radius Scale)

Untuk menjaga konsistensi visual:
* **Tombol & Input Form:** `rounded-xl` (12px)
* **Kartu Konten & Banner:** `rounded-2xl` (16px) hingga `rounded-3xl` (24px)
* **Badge Status / Pill:** `rounded-full` (hanya untuk label status kecil seperti "Lunas", "DP", "Hadir")
