# Siap Nikah - Project Context & Agent Memory

Dokumen ini adalah ringkasan konteks lengkap (*single source of truth*) untuk AI Agent (termasuk Remote Agents) agar dapat langsung melanjutkan pengembangan project **Siap Nikah** tanpa kehilangan histori teknis maupun keputusan produk.

---

## 1. Ringkasan Produk & Status Produksi
* **Nama Produk:** Siap Nikah (Wedding Planning & Budgeting Suite)
* **Domain Produksi:** `https://nikahplan.pages.dev`
* **Repository GitHub:** `https://github.com/irfanmln/siap-nikah`
* **Model Bisnis:** Freemium SaaS dengan opsi **Upgrade ke VIP (Rp 45.000 sekali bayar seumur hidup)** melalui gateway pembayaran Mayar.id.
* **Super Administrator:** `irfanm991@gmail.com` dan `halo.weddingplan@gmail.com` (dapat mengakses menu `/admin` untuk melihat omzet, daftar pasangan, dan aktivasi VIP manual).

---

## 2. Tech Stack & Infrastruktur
1. **Frontend:**
   * React 18 + Vite
   * Tailwind CSS (desain modern, elegan bernuansa *rose/stone*, mobile-first)
   * Lucide React Icons
   * Build output berada di folder `public/` (disajikan langsung oleh Cloudflare Pages)
2. **Backend (Serverless):**
   * Cloudflare Pages Functions (`functions/api/[[route]].js`)
   * RESTful JSON API + JWT Authentication
   * Endpoint Webhook Mayar untuk auto-upgrade VIP instan
   * Export Spreadsheet Excel (`/api/export-excel`) untuk backup data pengantin
3. **Database:**
   * Cloudflare D1 (Serverless SQLite Database di Edge)
   * Database Name: `wedding-db`
   * Database ID: `47f3439b-48c5-4841-9f4b-d215bc487d41`
4. **Autentikasi:**
   * Google Identity Services (GIS) Sign-In
   * Email & Password Register/Login fallback

---

## 3. Peta Direktori & Kode Sumber
```text
wedding-saas/
├── client/                     # Source code Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Root state, auth, actor, global sync, topbar
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # Navigasi kiri, accordion menu, wedding switcher
│   │   │   ├── DashboardTab.jsx # KPI ringkasan progres, tabungan, countdown hari H
│   │   │   ├── TabunganTab.jsx # Tabungan bersama & pembagian kontribusi
│   │   │   ├── TimelineTab.jsx # Checklist persiapan H-12 bulan s/d Hari H
│   │   │   ├── RundownTab.jsx  # Susunan acara Hari H berbasis waktu
│   │   │   ├── WeddingTab.jsx  # Vendor & Resepsi
│   │   │   ├── SeserahanTab.jsx # Seserahan & Hantaran
│   │   │   ├── MaharTab.jsx    # Mahar pernikahan & kalkulasi emas/perak
│   │   │   ├── UndanganSouvenirTab.jsx # Undangan cetak/digital & souvenir
│   │   │   ├── TamuTab.jsx     # Buku tamu undangan, pax, dan RSVP
│   │   │   ├── SeragamTab.jsx  # Rekap seragam keluarga & bridesmaid (kain + jahit)
│   │   │   ├── LegalDocTab.jsx # Checklist berkas KUA / Catatan Sipil
│   │   │   ├── AfterNikahTab.jsx # Wishlist perlengkapan rumah pasca nikah
│   │   │   ├── AdminPanel.jsx  # Dashboard super admin
│   │   │   ├── LoginView.jsx   # Form login Google & Email
│   │   │   ├── CreateWeddingModal.jsx # Pembuatan rencana pernikahan baru
│   │   │   ├── InvitePartnerModal.jsx # Tautan undang pasangan (kolaborasi 2 HP)
│   │   │   ├── SettingsModal.jsx # Edit nama pengantin, tanggal, target tabungan
│   │   │   └── UpgradeVipModal.jsx # Pop-up pembayaran VIP Mayar
│   │   └── utils/
│   │       └── api.js          # Client-side API fetchers & JWT storage
│   ├── package.json
│   └── vite.config.js
├── functions/                  # Cloudflare Pages Functions
│   └── api/
│       └── [[route]].js        # API Router: Auth, Weddings, Modul CRUD, Mayar, Admin
├── public/                     # Output build Vite + aset statis
├── schema.sql                  # Skema database SQLite D1 awal
├── migrations_002.sql          # Migrasi tabel Timeline, Rundown, Seragam, Dokumen KUA
├── wrangler.toml               # Konfigurasi Cloudflare Pages & D1 binding
└── PROJECT_CONTEXT.md          # Dokumen ini
```

---

## 4. Fitur-Fitur Utama & Logika Bisnis
1. **Multi-Tenant & Kolaborasi Pasangan:**
   * Satu akun user dapat memiliki atau tergabung di lebih dari 1 rencana pernikahan.
   * `Sidebar.jsx` memiliki **Workspace Switcher** (`💍 Ganti Rencana`) otomatis muncul jika pengguna terdaftar di `weddings.length > 1`.
   * Tautan undang pasangan: `https://nikahplan.pages.dev/?join=<wedding_id>` langsung menautkan pasangan sebagai *Partner*.
2. **Pengisi Data Aktif (Actor Selection):**
   * Pengguna dapat berganti sudut pandang input: **Pria (🤵)** atau **Wanita (👰)**.
   * **Proteksi Sanitasi Cache:** Di `App.jsx`, `effectiveActor` selalu disanitasi terhadap `db.metadata.groom` dan `db.metadata.bride` dari pernikahan yang sedang aktif agar cache lama tidak pernah bocor ke rencana pernikahan lain.
3. **Modul Rekap Seragam & Bridesmaid:**
   * Difokuskan untuk: *Keluarga Wanita*, *Keluarga Pria*, *Bridesmaid*, dan *Groomsmen* (vendor/panitia ditiadakan karena biasanya sudah dari paket WO/catering).
   * Opsi jenis busana: *Bahan Kain (Meteran)*, *Dress / Gamis*, *One Set*, *Atasan*, *Bawahan*.
   * Kalkulasi biaya: `cloth_cost` (Bahan/Baju) + `tailor_cost` (Jahit) = `total_cost`.
4. **Rundown Hari H & Timeline:**
   * Rundown dilengkapi slot waktu mulai-selesai, PIC, lokasi, dan status checklist.
   * Timeline terbagi dalam fase: *H-12 Bulan*, *H-6 Bulan*, *H-3 Bulan*, *H-1 Bulan*, *H-2 Minggu*, *H-1 Minggu*, *Hari H*.
5. **Dokumen Legalitas KUA / Sipil:**
   * Checklist dokumen calon pengantin (N1, N2, N4, surat rekomendasi nikah, sertifikat elsimil/imunisasi, foto, dll).

---

## 5. Alur Deployment & Perintah Rutin
* **Build Frontend:**
  ```powershell
  cd client
  npm run build
  ```
  *(Hasil build otomatis masuk ke folder `public/`)*
* **Deploy ke Cloudflare Pages Production:**
  ```powershell
  npx wrangler pages deploy public --project-name=nikahplan --branch=production
  ```
* **Eksekusi Remote Database Cloudflare D1:**
  ```powershell
  npx wrangler d1 execute wedding-db --remote --command "SELECT * FROM weddings;"
  ```
* **Git Synchronization:**
  Branch aktif adalah `production` dan `main` yang terhubung ke `https://github.com/irfanmln/siap-nikah`.

---

## 6. Pedoman untuk Remote AI Agent
1. **Pertahankan Integritas Data & Kode:** Selalu jaga backward compatibility API di `functions/api/[[route]].js` dan skema D1.
2. **Mobile-First UX:** Pastikan setiap penambahan form/modal mudah diisi di layar HP (gunakan input sederhana, kurangi klik berulang, sediakan template default jika memungkinkan).
3. **Deploy Pipeline:** Setelah melakukan perubahan frontend di `client/src`, wajib menjalankan `npm run build` di dalam folder `client` sebelum men-deploy atau melakukan commit.
