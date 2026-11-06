-- Migration 002: Add Timeline, Rundown, Legal Documents, and Seragam tables

-- 1. Timeline Items (Checklist berdasarkan tahapan waktu)
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

-- 2. Rundown Items (Susunan acara hari H)
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

-- 3. Legal Documents (Checklist berkas KUA / Catatan Sipil)
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

-- 4. Seragam Items (Rekap pembagian seragam & bahan kain)
CREATE TABLE IF NOT EXISTS seragam_items (
    id TEXT PRIMARY KEY,
    wedding_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    role_category TEXT NOT NULL, -- 'Keluarga Pria', 'Keluarga Wanita', 'Bridesmaid', 'Groomsmen', 'Panitia / Among Tamu'
    cloth_type TEXT NOT NULL,
    size_or_meter TEXT,
    status TEXT DEFAULT 'Belum Diberikan', -- 'Belum Diberikan', 'Sudah Diberikan', 'Sudah Jahit'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_timeline_wedding ON timeline_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_rundown_wedding ON rundown_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_legal_wedding ON legal_documents(wedding_id);
CREATE INDEX IF NOT EXISTS idx_seragam_wedding ON seragam_items(wedding_id);
