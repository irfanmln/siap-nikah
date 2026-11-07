-- Database Schema for Multi-Tenant Wedding SaaS

-- 1. Users table (terintegrasi dengan Google OAuth / Auth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Weddings table (Data utama rencana pernikahan)
CREATE TABLE IF NOT EXISTS weddings (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    groom_name TEXT NOT NULL,
    bride_name TEXT NOT NULL,
    title TEXT NOT NULL,
    wedding_date TEXT,
    target_savings INTEGER DEFAULT 0,
    gold_price INTEGER DEFAULT 0,
    silver_price INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Wedding Members (Kolaborasi pasangan / keluarga)
CREATE TABLE IF NOT EXISTS wedding_members (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('owner', 'partner', 'planner')) DEFAULT 'partner',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(wedding_id, user_id)
);

-- 4. Tabungan & Kontribusi
CREATE TABLE IF NOT EXISTS tabungan (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    contributor TEXT NOT NULL,
    category TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 5. Anggaran & Biaya (Seserahan, Mahar, Resepsi, Souvenir, Pasca-Nikah)
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    module TEXT NOT NULL, -- 'seserahan' | 'mahar' | 'wedding' | 'undanganSouvenir' | 'afterNikah'
    category TEXT,
    name TEXT NOT NULL,
    target_cost INTEGER DEFAULT 0,
    actual_cost INTEGER DEFAULT 0,
    paid_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'DP', 'Lunas'
    vendor_name TEXT,
    vendor_contact TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 6. Tamu Undangan (Siap integrasi dengan Undangan Digital & RSVP)
CREATE TABLE IF NOT EXISTS tamu_undangan (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT, -- 'Keluarga', 'Teman Kantor', 'Teman Sekolah', dll
    pax INTEGER DEFAULT 1,
    phone TEXT,
    slug TEXT, -- slug unik untuk URL personal undangan (misal: /u/budi-santoso)
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Terkirim', 'Dibaca'
    rsvp_status TEXT DEFAULT 'Pending', -- 'Pending', 'Hadir', 'Tidak Hadir'
    rsvp_pax INTEGER DEFAULT 0,
    rsvp_wishes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 7. Log Aktivitas
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- Indexes untuk query cepat per wedding_id
CREATE INDEX IF NOT EXISTS idx_weddings_owner ON weddings(owner_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON wedding_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tabungan_wedding ON tabungan(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budget_wedding ON budget_items(wedding_id, module);
CREATE INDEX IF NOT EXISTS idx_tamu_wedding ON tamu_undangan(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tamu_slug ON tamu_undangan(slug);

-- 8. Timeline Items (Checklist berdasarkan tahapan waktu)
CREATE TABLE IF NOT EXISTS timeline_items (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    phase TEXT NOT NULL, -- 'H-12 Bulan', 'H-6 Bulan', 'H-3 Bulan', 'H-1 Bulan', 'H-2 Minggu', 'H-1 Minggu', 'Hari H'
    title TEXT NOT NULL,
    assigned_to TEXT, -- 'Pria', 'Wanita', 'Bersama', 'Keluarga', 'WO'
    completed INTEGER DEFAULT 0,
    due_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 9. Rundown Items (Susunan acara hari H)
CREATE TABLE IF NOT EXISTS rundown_items (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    time_start TEXT NOT NULL,
    time_end TEXT,
    title TEXT NOT NULL,
    location TEXT,
    pic TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 10. Legal Documents (Checklist berkas KUA / Catatan Sipil)
CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    category TEXT NOT NULL, -- 'kua' | 'sipil'
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Belum', -- 'Belum', 'Proses', 'Lengkap'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- 11. Seragam Items (Rekap pembagian seragam & bahan kain)
CREATE TABLE IF NOT EXISTS seragam_items (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    role_category TEXT NOT NULL, -- 'Keluarga Wanita', 'Keluarga Pria', 'Bridesmaid', 'Groomsmen'
    item_type TEXT DEFAULT 'Bahan Kain', -- 'Bahan Kain (Meteran)', 'Atasan', 'Bawahan', 'One Set', 'Dress / Gamis'
    cloth_type TEXT NOT NULL,
    size_or_meter TEXT,
    cloth_cost INTEGER DEFAULT 0,
    tailor_cost INTEGER DEFAULT 0,
    total_cost INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Belum Diberikan', -- 'Belum Diberikan', 'Sudah Diberikan', 'Sudah Jahit'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_wedding ON timeline_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_rundown_wedding ON rundown_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_legal_wedding ON legal_documents(wedding_id);
CREATE INDEX IF NOT EXISTS idx_seragam_wedding ON seragam_items(wedding_id);

