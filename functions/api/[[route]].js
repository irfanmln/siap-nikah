import { verifySession } from './auth-helper.js';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-wedding-id, x-actor',
      ...headers
    }
  });
}

// Template pos anggaran awal untuk pasangan baru
const DEFAULT_BUDGET_TEMPLATES = [
  // Resepsi & Vendor
  { module: 'wedding', category: 'Venue & Gedung', name: 'Sewa Gedung / Venue', target_cost: 15000000 },
  { module: 'wedding', category: 'Katering', name: 'Paket Katering (500 pax)', target_cost: 25000000 },
  { module: 'wedding', category: 'Dekorasi', name: 'Dekorasi Pelaminan & Ruangan', target_cost: 10000000 },
  { module: 'wedding', category: 'Make Up & Busana', name: 'Rias Pengantin & Orang Tua', target_cost: 8000000 },
  { module: 'wedding', category: 'Foto & Video', name: 'Dokumentasi Liputan & Cetak Album', target_cost: 6000000 },
  { module: 'wedding', category: 'WO / Organizer', name: 'Wedding Organizer (D-Day)', target_cost: 5000000 },
  { module: 'wedding', category: 'Entertainment', name: 'Akustik / Sound System', target_cost: 3500000 },
  
  // Mahar & Seserahan
  { module: 'mahar', category: 'Logam Mulia', name: 'Emas Batangan / Perhiasan', target_cost: 10000000 },
  { module: 'mahar', category: 'Alat Sholat', name: 'Mukena & Sajadah Mahar', target_cost: 1000000 },
  { module: 'seserahan', category: 'Alat shalat', name: 'Set Alat Sholat & Al-Qur\'an', target_cost: 1000000 },
  { module: 'seserahan', category: 'Skincare', name: 'Set Skincare & Perawatan Wajah', target_cost: 1500000 },
  { module: 'seserahan', category: 'Makeup', name: 'Set Makeup & Kosmetik Lengkap', target_cost: 1200000 },
  { module: 'seserahan', category: 'Tas', name: 'Tas Pesta / Kerja Wanita', target_cost: 1500000 },
  { module: 'seserahan', category: 'Sepatu/heels', name: 'Sepatu / Heels Pengantin Wanita', target_cost: 1000000 },
  { module: 'seserahan', category: 'Pakaian', name: 'Bahan Kebaya / Pakaian Pesta', target_cost: 1200000 },
  { module: 'seserahan', category: 'Perlengkapan Tidur', name: 'Pakaian Tidur / Piyama & Lingerie', target_cost: 500000 },
  { module: 'seserahan', category: 'Perlengkapan Mandi', name: 'Set Perlengkapan Mandi & Body Care', target_cost: 600000 },
  { module: 'seserahan', category: 'Parfum', name: 'Parfum Favorit Pengantin', target_cost: 1000000 },
  { module: 'seserahan', category: 'Box Seserahan', name: 'Box Akrilik & Jasa Hias Seserahan', target_cost: 800000 },
  
  // Undangan & Souvenir
  { module: 'undanganSouvenir', category: 'Souvenir', name: 'Souvenir Tamu (300 pcs)', target_cost: 2500000 },
  { module: 'undanganSouvenir', category: 'Cetak', name: 'Buku Tamu & Cetak Fisik', target_cost: 500000 }
];

// Template Checklist Timeline Berdasarkan Waktu
const DEFAULT_TIMELINE_TEMPLATES = [
  // H-12 Bulan
  { phase: 'H-12 Bulan', title: 'Tentukan tanggal pernikahan & konsep acara (Adat / Modern / Intimate)', assigned_to: 'Bersama' },
  { phase: 'H-12 Bulan', title: 'Tentukan estimasi total anggaran & target tabungan bersama', assigned_to: 'Bersama' },
  { phase: 'H-12 Bulan', title: 'Pertemuan keluarga besar (Lamaran / Perkenalan Keluarga)', assigned_to: 'Keluarga' },
  { phase: 'H-12 Bulan', title: 'Survey dan booking gedung / venue pernikahan', assigned_to: 'Bersama' },
  
  // H-6 Bulan
  { phase: 'H-6 Bulan', title: 'Booking MUA, Hairdo/Hijab do, & Busana Pengantin / Orang Tua', assigned_to: 'Wanita' },
  { phase: 'H-6 Bulan', title: 'Pilih & booking vendor Katering (Food tasting)', assigned_to: 'Bersama' },
  { phase: 'H-6 Bulan', title: 'Booking vendor Dekorasi Pelaminan & Ruangan', assigned_to: 'Bersama' },
  { phase: 'H-6 Bulan', title: 'Booking vendor Fotografi & Videografi Liputan', assigned_to: 'Pria' },
  { phase: 'H-6 Bulan', title: 'Pilih & booking Wedding Organizer (WO) Hari H', assigned_to: 'Bersama' },
  
  // H-3 Bulan
  { phase: 'H-3 Bulan', title: 'Pesan Cincin Kawin & Ukir Nama', assigned_to: 'Bersama' },
  { phase: 'H-3 Bulan', title: 'Beli / kumpulkan barang Seserahan & Hantaran', assigned_to: 'Pria' },
  { phase: 'H-3 Bulan', title: 'Beli Mahar Pernikahan (Logam Mulia / Uang Mahar)', assigned_to: 'Pria' },
  { phase: 'H-3 Bulan', title: 'Pilih & pesan Souvenir Tamu', assigned_to: 'Wanita' },
  { phase: 'H-3 Bulan', title: 'Pesan Undangan Digital & Cetak Fisik', assigned_to: 'Bersama' },
  { phase: 'H-3 Bulan', title: 'Beli bahan kain seragam keluarga & bridesmaid', assigned_to: 'Wanita' },

  // H-1 Bulan
  { phase: 'H-1 Bulan', title: 'Urus berkas pendaftaran nikah di KUA / Catatan Sipil', assigned_to: 'Bersama' },
  { phase: 'H-1 Bulan', title: 'Pemeriksaan kesehatan pranikah (Puskesmas / Elsimil)', assigned_to: 'Bersama' },
  { phase: 'H-1 Bulan', title: 'Fitting final busana pengantin & orang tua', assigned_to: 'Bersama' },
  { phase: 'H-1 Bulan', title: 'Finalisasi daftar tamu undangan & porsi katering', assigned_to: 'Bersama' },
  { phase: 'H-1 Bulan', title: 'Distribusikan bahan kain seragam ke keluarga & bridesmaid', assigned_to: 'Wanita' },

  // H-2 Minggu
  { phase: 'H-2 Minggu', title: 'Sebar undangan digital & fisik ke para tamu', assigned_to: 'Bersama' },
  { phase: 'H-2 Minggu', title: 'Technical Meeting (TM) seluruh vendor & panitia keluarga', assigned_to: 'WO' },
  { phase: 'H-2 Minggu', title: 'Konfirmasi kehadiran saksi nikah dari kedua pihak', assigned_to: 'Pria' },

  // H-1 Minggu
  { phase: 'H-1 Minggu', title: 'Gladi kotor / review rundown acara bersama keluarga inti', assigned_to: 'Bersama' },
  { phase: 'H-1 Minggu', title: 'Perawatan diri & istirahat yang cukup', assigned_to: 'Bersama' },
  { phase: 'H-1 Minggu', title: 'Siapkan amplop tips / honor pelunasan vendor', assigned_to: 'Pria' },
  { phase: 'H-1 Minggu', title: 'Cek kelengkapan mahar, cincin kawin, seserahan, & berkas', assigned_to: 'Bersama' },

  // Hari H
  { phase: 'Hari H', title: 'Bangun pagi, sarapan bernutrisi & hidrasi cukup', assigned_to: 'Bersama' },
  { phase: 'Hari H', title: 'Sesi Make Up & Hairdo tepat waktu', assigned_to: 'Wanita' },
  { phase: 'Hari H', title: 'Pastikan mahar & cincin kawin standby di meja akad', assigned_to: 'Pria' },
  { phase: 'Hari H', title: 'Fokus nikmati momen bahagia & tetap tersenyum!', assigned_to: 'Bersama' }
];

// Template Rundown Hari H
const DEFAULT_RUNDOWN_TEMPLATES = [
  { time_start: '05:30', time_end: '07:30', title: 'Make Up & Persiapan Busana Pengantin', location: 'Kamar Rias / Ruang Ganti', pic: 'MUA & Bridesmaid', notes: 'Sarapan pagi sebelum mulai rias', sort_order: 1 },
  { time_start: '07:30', time_end: '08:00', title: 'Kedatangan Rombongan Keluarga Calon Pengantin Pria', location: 'Lobi Depan Gedung', pic: 'Among Tamu & Panitia', notes: 'Penyambutan & serah terima seserahan simbolis', sort_order: 2 },
  { time_start: '08:00', time_end: '08:45', title: 'Prosesi Akad Nikah & Ijab Qabul', location: 'Meja Akad / Pelaminan', pic: 'Penghulu, Saksi, & MC', notes: 'Suasana khidmat, siapkan mic untuk pengantin & wali', sort_order: 3 },
  { time_start: '08:45', time_end: '09:15', title: 'Penyerahan Mahar, Tukar Cincin & Buku Nikah', location: 'Meja Akad', pic: 'Penghulu & Fotografer', notes: 'Dokumentasi penyerahan mas kawin & tanda tangan buku nikah', sort_order: 4 },
  { time_start: '09:15', time_end: '10:00', title: 'Prosesi Sungkeman kepada Kedua Orang Tua', location: 'Pelaminan', pic: 'MC & Operator Musik', notes: 'Instrumen haru syahdu, siapkan tisu', sort_order: 5 },
  { time_start: '10:00', time_end: '10:45', title: 'Foto Bersama Keluarga Inti & Retouch Rias Resepsi', location: 'Pelaminan / Ruang Rias', pic: 'Fotografer & MUA', notes: 'Ganti busana resepsi (jika ada)', sort_order: 6 },
  { time_start: '10:45', time_end: '11:15', title: 'Opening Resepsi & Kirab Masuk Pengantin', location: 'Pintu Masuk Utama', pic: 'MC, WO, & Pengiring', notes: 'Diiringi lagu romantis & bridesmaid', sort_order: 7 },
  { time_start: '11:15', time_end: '12:30', title: 'Ramah Tamah, Prasmanan Katering & Foto Tamu Undangan', location: 'Pelaminan & Dining Area', pic: 'WO, MC, & Band/Akustik', notes: 'Sesi foto bergantian per kelompok tamu', sort_order: 8 },
  { time_start: '12:30', time_end: '13:00', title: 'Closing, Lempar Hand Bouquet & Foto Panitia', location: 'Area Tengah Pelaminan', pic: 'MC & Seluruh Panitia', notes: 'Sesi foto akrab sahabat & seluruh vendor', sort_order: 9 }
];

// Template Dokumen Legalitas KUA & Catatan Sipil
const DEFAULT_LEGAL_DOCUMENTS = [
  // KUA (Muslim)
  { category: 'kua', name: 'Surat Pengantar Nikah (N1) dari Kelurahan', description: 'Diterbitkan Kelurahan/Desa asal calon pengantin pria & wanita' },
  { category: 'kua', name: 'Surat Permohonan Kehendak Nikah (N2)', description: 'Formulir pendaftaran nikah dari Kelurahan' },
  { category: 'kua', name: 'Surat Persetujuan Calon Mempelai (N4)', description: 'Pernyataan kedua mempelai sepakat menikah tanpa paksaan' },
  { category: 'kua', name: 'Surat Rekomendasi Nikah (dari KUA Asal)', description: 'Wajib jika akad nikah diadakan di luar kecamatan domisili' },
  { category: 'kua', name: 'Fotokopi KTP Calon Pengantin & Orang Tua', description: 'Masing-masing 2 lembar fotokopi jelas' },
  { category: 'kua', name: 'Fotokopi Kartu Keluarga (KK) Calon Pengantin', description: 'KK terbaru calon pengantin & orang tua' },
  { category: 'kua', name: 'Fotokopi Akta Kelahiran & Ijazah Terakhir', description: 'Untuk pencocokan ejaan nama resmi di Buku Nikah' },
  { category: 'kua', name: 'Pasfoto Berlatar Belakang Biru (2x3 & 4x6)', description: 'Ukuran 2x3 (4 lembar) & 4x6 (2 lembar), pakaian rapi' },
  { category: 'kua', name: 'Sertifikat Elsimil & Keterangan Kesehatan', description: 'Pemeriksaan kesehatan & imunisasi TT dari Puskesmas' },
  { category: 'kua', name: 'Bukti Pembayaran PNBP Nikah (Jika di Luar KUA)', description: 'Gratis di KUA saat jam kerja, Rp 600.000 jika di luar KUA/akhir pekan' }
];

// Template Pembagian Seragam & Panitia
const DEFAULT_SERAGAM_TEMPLATES = [
  { recipient_name: 'Seragam Keluarga Pengantin Wanita', role_category: 'Keluarga Wanita', item_type: 'Bahan Kain (Meteran)', cloth_type: 'Bahan Kain Seragam Keluarga', size_or_meter: '8 Orang', cloth_cost: 1200000, tailor_cost: 800000, total_cost: 2000000, status: 'Belum Diberikan', notes: 'Keluarga besar wanita (om, tante, sepupu)' },
  { recipient_name: 'Seragam Keluarga Pengantin Pria', role_category: 'Keluarga Pria', item_type: 'Bahan Kain (Meteran)', cloth_type: 'Bahan Kain Seragam Keluarga', size_or_meter: '8 Orang', cloth_cost: 1200000, tailor_cost: 800000, total_cost: 2000000, status: 'Belum Diberikan', notes: 'Keluarga besar pria (om, tante, sepupu)' },
  { recipient_name: 'Bridesmaid', role_category: 'Bridesmaid', item_type: 'Dress / Gamis', cloth_type: 'Bahan Satin Silk / Dress Jadi', size_or_meter: '5 Orang', cloth_cost: 750000, tailor_cost: 0, total_cost: 750000, status: 'Belum Diberikan', notes: 'Diberikan bersama bridesmaid box' },
  { recipient_name: 'Groomsmen', role_category: 'Groomsmen', item_type: 'Atasan', cloth_type: 'Kemeja Batik Siap Pakai', size_or_meter: '5 Orang', cloth_cost: 600000, tailor_cost: 0, total_cost: 600000, status: 'Belum Diberikan', notes: 'Batik motif modern seragam sahabat' },
  { recipient_name: 'Panitia & Among Tamu', role_category: 'Keluarga Wanita', item_type: 'One Set', cloth_type: 'Batik / Seragam Panitia Hari H', size_or_meter: '6 Orang', cloth_cost: 900000, tailor_cost: 0, total_cost: 900000, status: 'Belum Diberikan', notes: 'Among tamu dan panitia inti' }
];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');

  if (request.method === 'OPTIONS') {
    return json({ ok: true });
  }

  // Khusus route /api/auth dialihkan atau ditangani oleh router auth
  if (path.startsWith('auth/')) {
    return json({ error: 'Auth route' }, 404);
  }

  const db = env.DB;
  if (!db) {
    return json({ error: 'Database D1 belum terhubung' }, 500);
  }

  // 1. Ekstrak Auth Session
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || url.searchParams.get('token');
  const session = await verifySession(token, env.JWT_SECRET);
  if (!session) {
    return json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' }, 401);
  }
  const userId = session.userId;

  // 1b. ADMIN ROUTES (Khusus Pemilik Aplikasi)
  const ADMIN_EMAILS = [
    'irfanm991@gmail.com',
    'halo.weddingplan@gmail.com'
  ];
  if (env.ADMIN_EMAIL) {
    ADMIN_EMAILS.push(env.ADMIN_EMAIL.toLowerCase().trim());
  }

  if (path.startsWith('admin')) {
    const userEmail = (session.email || '').toLowerCase().trim();
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return json({ error: 'Akses ditolak. Endpoint ini hanya untuk Administrator Siap Nikah.' }, 403);
    }

    // GET /api/admin/weddings (Ambil semua rencana pernikahan & statistik)
    if (path === 'admin/weddings' && request.method === 'GET') {
      const weddingsQuery = await db.prepare(`
        SELECT 
          w.id,
          w.groom_name,
          w.bride_name,
          w.wedding_date,
          w.target_savings,
          w.is_premium,
          w.created_at,
          u.name as owner_name,
          u.email as owner_email,
          (SELECT COUNT(*) FROM wedding_members wm WHERE wm.wedding_id = w.id) as member_count,
          (SELECT COALESCE(SUM(amount), 0) FROM tabungan t WHERE t.wedding_id = w.id) as total_savings,
          (SELECT COUNT(*) FROM budget_items b WHERE b.wedding_id = w.id) as item_count,
          (SELECT COUNT(*) FROM tamu_undangan tm WHERE tm.wedding_id = w.id) as guest_count
        FROM weddings w
        LEFT JOIN users u ON w.owner_id = u.id
        ORDER BY w.created_at DESC
      `).all();

      const userCountQuery = await db.prepare('SELECT COUNT(*) as total FROM users').first();

      const weddings = weddingsQuery.results || [];
      const totalUsers = userCountQuery?.total || 0;
      const totalWeddings = weddings.length;
      const totalVip = weddings.filter(w => w.is_premium === 1).length;
      const totalFree = totalWeddings - totalVip;
      const totalRevenue = totalVip * 45000;

      return json({
        success: true,
        stats: {
          totalUsers,
          totalWeddings,
          totalVip,
          totalFree,
          totalRevenue
        },
        weddings
      });
    }

    // POST /api/admin/toggle-vip (Ubah status VIP rencana pernikahan secara manual)
    if (path === 'admin/toggle-vip' && request.method === 'POST') {
      const body = await request.json();
      const { weddingId, isPremium } = body;

      if (!weddingId) {
        return json({ error: 'weddingId diperlukan' }, 400);
      }

      const targetStatus = isPremium ? 1 : 0;
      await db.prepare('UPDATE weddings SET is_premium = ? WHERE id = ?').bind(targetStatus, weddingId).run();

      await db.prepare(`
        INSERT INTO activity_logs (id, wedding_id, user_name, action, details)
        VALUES (?, ?, 'Admin', ?, ?)
      `).bind(
        'log_' + Date.now(),
        weddingId,
        targetStatus ? 'Aktivasi VIP Manual' : 'Pencabutan VIP Manual',
        `Status VIP diubah manual oleh Administrator (${session.email})`
      ).run();

      return json({
        success: true,
        weddingId,
        isPremium: Boolean(targetStatus)
      });
    }

    return json({ error: 'Admin route not found' }, 404);
  }

  // 2. POST /api/weddings (Buat Workspace Pernikahan Baru)
  if (path === 'weddings' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { groomName, brideName, weddingDate, targetSavings } = body;

      if (!groomName || !brideName) {
        return json({ error: 'Nama pria dan wanita wajib diisi' }, 400);
      }

      const weddingId = 'wed_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const title = `Wedding Plan ${groomName} & ${brideName}`;

      // Insert wedding
      await db.prepare(`
        INSERT INTO weddings (id, owner_id, groom_name, bride_name, title, wedding_date, target_savings, gold_price, silver_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        weddingId,
        userId,
        groomName,
        brideName,
        title,
        weddingDate || '',
        parseInt(targetSavings) || 50000000,
        2700000,
        800000
      ).run();

      // Insert member role
      await db.prepare(`
        INSERT INTO wedding_members (id, wedding_id, user_id, role)
        VALUES (?, ?, ?, 'owner')
      `).bind('mem_' + Date.now(), weddingId, userId).run();

      // Seed starter budget items
      for (const item of DEFAULT_BUDGET_TEMPLATES) {
        await db.prepare(`
          INSERT INTO budget_items (id, wedding_id, module, category, name, target_cost, actual_cost, paid_amount, status)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'Pending')
        `).bind(
          'item_' + Math.random().toString(36).substring(2, 9),
          weddingId,
          item.module,
          item.category,
          item.name,
          item.target_cost
        ).run();
      }

      // Log activity
      await db.prepare(`
        INSERT INTO activity_logs (id, wedding_id, user_name, action, details)
        VALUES (?, ?, ?, 'Membuat Rencana', 'Workspace pernikahan baru berhasil dibuat')
      `).bind('log_' + Date.now(), weddingId, groomName || 'Penyelenggara').run();

      return json({
        success: true,
        wedding: {
          id: weddingId,
          groom_name: groomName,
          bride_name: brideName,
          wedding_date: weddingDate,
          target_savings: targetSavings
        }
      });
    } catch (err) {
      return json({ error: err.message || 'Gagal membuat rencana pernikahan' }, 500);
    }
  }

  // 2b. POST /api/weddings/join (Gabung Kolaborasi Pasangan)
  if (path === 'weddings/join' && request.method === 'POST') {
    try {
      const { code } = await request.json();
      if (!code) return json({ error: 'Kode undangan diperlukan' }, 400);

      const targetWedding = await db.prepare('SELECT * FROM weddings WHERE id = ?').bind(code).first();
      if (!targetWedding) {
        return json({ error: 'Rencana pernikahan tidak ditemukan' }, 404);
      }

      // Validasi fitur VIP: Kolaborasi pasangan hanya tersedia untuk paket VIP
      if (!targetWedding.is_premium) {
        return json({
          error: 'Fitur Kolaborasi Pasangan memerlukan akun Siap Nikah VIP. Silakan minta pasangan Anda untuk upgrade ke VIP terlebih dahulu.'
        }, 403);
      }

      // Cek apakah sudah jadi member
      const existingMember = await db.prepare(
        'SELECT * FROM wedding_members WHERE wedding_id = ? AND user_id = ?'
      ).bind(code, userId).first();

      if (!existingMember && targetWedding.owner_id !== userId) {
        await db.prepare(
          'INSERT INTO wedding_members (id, wedding_id, user_id, role) VALUES (?, ?, ?, ?)'
        ).bind('mem_' + Date.now(), code, userId, 'partner').run();

        await db.prepare(
          'INSERT INTO activity_logs (id, wedding_id, user_name, action, details) VALUES (?, ?, ?, ?, ?)'
        ).bind('log_' + Date.now(), code, session.name || 'Pasangan', 'Bergabung', 'Pasangan berhasil bergabung ke rencana pernikahan').run();
      }

      return json({
        success: true,
        wedding: targetWedding
      });
    } catch (err) {
      return json({ error: err.message || 'Gagal bergabung ke rencana pernikahan' }, 500);
    }
  }

  // 3. Verifikasi wedding_id dari Header / Query
  const weddingId = request.headers.get('x-wedding-id') || url.searchParams.get('wedding_id');
  if (!weddingId) {
    return json({ error: 'wedding_id diperlukan' }, 400);
  }

  // Verifikasi apakah user berhak mengakses wedding ini
  const accessCheck = await db.prepare(`
    SELECT id FROM weddings WHERE id = ? AND owner_id = ?
    UNION
    SELECT wedding_id FROM wedding_members WHERE wedding_id = ? AND user_id = ?
  `).bind(weddingId, userId, weddingId, userId).first();

  if (!accessCheck) {
    return json({ error: 'Anda tidak memiliki hak akses ke data pernikahan ini' }, 403);
  }

  const actor = request.headers.get('x-actor') || session.name || 'User';

  // 4. GET /api/data (Mengambil seluruh data scoped untuk wedding ini)
  if (path === 'data' && request.method === 'GET') {
    const wedding = await db.prepare('SELECT * FROM weddings WHERE id = ?').bind(weddingId).first();
    const tabungan = await db.prepare('SELECT * FROM tabungan WHERE wedding_id = ? ORDER BY date DESC').bind(weddingId).all();
    const budgetItems = await db.prepare('SELECT * FROM budget_items WHERE wedding_id = ?').bind(weddingId).all();
    const tamu = await db.prepare('SELECT * FROM tamu_undangan WHERE wedding_id = ? ORDER BY name ASC').bind(weddingId).all();
    const logs = await db.prepare('SELECT * FROM activity_logs WHERE wedding_id = ? ORDER BY timestamp DESC LIMIT 50').bind(weddingId).all();

    // Mapping items by module with UI-compatible fields
    const allBudgets = budgetItems.results || [];
    const seserahan = allBudgets.filter(i => i.module === 'seserahan').map(i => ({
      id: i.id,
      category: i.category || 'Pakaian',
      name: i.name,
      price: Number(i.target_cost) || 0,
      link: i.vendor_contact || '',
      purchased: i.status === 'Lunas' || i.status === 'Sudah',
      purchasedBy: i.vendor_name || null,
      notes: i.notes || ''
    }));

    const mahar = allBudgets.filter(i => i.module === 'mahar').map(i => {
      const weightMatch = (i.name || '').match(/\(([^)]*gr[^)]*)\)/i);
      const weight = i.vendor_name || (weightMatch ? weightMatch[1].trim() : '');
      return {
        id: i.id,
        category: i.category || 'Logam Mulia',
        name: i.name,
        price: Number(i.target_cost) || 0,
        weight: weight,
        detail: i.vendor_contact || i.notes || '',
        status: i.status || 'Rencana',
        notes: i.notes || ''
      };
    });

    const weddingVendor = allBudgets.filter(i => i.module === 'wedding').map(i => ({
      id: i.id,
      category: i.category || 'Vendor',
      name: i.name,
      estimatedCost: Number(i.target_cost) || 0,
      dpPaid: Number(i.paid_amount) || 0,
      detail: i.vendor_contact || i.notes || '',
      status: i.status || 'Pending',
      notes: i.notes || ''
    }));

    const undanganSouvenir = allBudgets.filter(i => i.module === 'undanganSouvenir').map(i => {
      const isSouvenir = (i.category || '').toLowerCase().includes('souvenir');
      const pcsMatch = (i.name || '').match(/\((\d+)\s*pcs\)/i);
      const qtyFromVendor = parseInt(i.vendor_name, 10);
      const quantity = (!isNaN(qtyFromVendor) && qtyFromVendor > 0)
        ? qtyFromVendor
        : (pcsMatch ? parseInt(pcsMatch[1], 10) : 1);
      const totalPrice = Number(i.target_cost) || 0;
      const unitPrice = quantity > 1 && totalPrice > 0 ? Math.round(totalPrice / quantity) : totalPrice;

      return {
        id: i.id,
        type: isSouvenir ? 'Souvenir' : 'Undangan',
        category: isSouvenir ? 'Souvenir' : 'Undangan',
        name: i.name,
        detail: i.notes || '',
        unitPrice: unitPrice,
        quantity: quantity,
        totalPrice: totalPrice,
        link: i.vendor_contact || '',
        checked: i.status === 'Lunas',
        notes: i.notes || ''
      };
    });

    const afterNikah = allBudgets.filter(i => i.module === 'afterNikah').map(i => ({
      id: i.id,
      name: i.name,
      estimatedPrice: Number(i.target_cost) || 0,
      priority: 'Tinggi',
      status: i.status === 'Sudah Dibeli' || i.status === 'Kado Tamu' || i.status === 'Sudah Ada' ? i.status : (i.paid_amount > 0 ? 'Sudah Dibeli' : 'Belum Ada'),
      notes: i.notes || ''
    }));

    const tamuList = (tamu.results || []).map(t => {
      let cat = 'Reguler';
      let rel = `Keluarga ${wedding.groom_name || 'Pria'}`;
      if (t.category) {
        const match = t.category.match(/^([^(]+)(?:\(([^)]+)\))?$/);
        if (match) {
          const part1 = match[1].trim();
          const part2 = match[2]?.trim();
          if (['VIP', 'VVIP', 'Reguler'].includes(part1)) {
            cat = part1;
            if (part2) rel = part2;
          } else if (part2 && ['VIP', 'VVIP', 'Reguler'].includes(part2)) {
            cat = part2;
            rel = part1;
          } else {
            rel = part1;
          }
        }
      }

      const isSent = t.status === 'Terkirim' || t.status === 'Sudah Dikirim';
      return {
        id: t.id,
        name: t.name,
        relationship: rel,
        category: cat,
        pax: t.pax || 1,
        statusKirim: isSent ? 'Terkirim' : 'Belum Dikirim',
        konfirmasi: t.rsvp_status === 'Hadir' ? 'Hadir' : (t.rsvp_status === 'Tidak Hadir' ? 'Tidak Hadir' : 'Belum Konfirmasi'),
        notes: t.phone || ''
      };
    });

    // Auto-seed Timeline Items jika masih kosong
    let timelineRes = await db.prepare('SELECT * FROM timeline_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    if (!timelineRes?.results || timelineRes.results.length === 0) {
      for (const t of DEFAULT_TIMELINE_TEMPLATES) {
        await db.prepare(`
          INSERT INTO timeline_items (id, wedding_id, phase, title, assigned_to, completed)
          VALUES (?, ?, ?, ?, ?, 0)
        `).bind('time_' + Math.random().toString(36).substring(2, 9), weddingId, t.phase, t.title, t.assigned_to).run();
      }
      timelineRes = await db.prepare('SELECT * FROM timeline_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    }

    // Auto-seed Rundown Items jika masih kosong
    let rundownRes = await db.prepare('SELECT * FROM rundown_items WHERE wedding_id = ? ORDER BY time_start ASC, sort_order ASC').bind(weddingId).all();
    if (!rundownRes?.results || rundownRes.results.length === 0) {
      for (const r of DEFAULT_RUNDOWN_TEMPLATES) {
        await db.prepare(`
          INSERT INTO rundown_items (id, wedding_id, time_start, time_end, title, location, pic, notes, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind('run_' + Math.random().toString(36).substring(2, 9), weddingId, r.time_start, r.time_end, r.title, r.location, r.pic, r.notes, r.sort_order).run();
      }
      rundownRes = await db.prepare('SELECT * FROM rundown_items WHERE wedding_id = ? ORDER BY time_start ASC, sort_order ASC').bind(weddingId).all();
    }

    // Auto-seed Legal Documents jika masih kosong
    let legalRes = await db.prepare('SELECT * FROM legal_documents WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    if (!legalRes?.results || legalRes.results.length === 0) {
      for (const l of DEFAULT_LEGAL_DOCUMENTS) {
        await db.prepare(`
          INSERT INTO legal_documents (id, wedding_id, category, name, description, status)
          VALUES (?, ?, ?, ?, ?, 'Belum')
        `).bind('leg_' + Math.random().toString(36).substring(2, 9), weddingId, l.category, l.name, l.description).run();
      }
      legalRes = await db.prepare('SELECT * FROM legal_documents WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    } else {
      // Auto-clean dokumen tidak umum (N5 / Cerai) jika belum diedit user
      await db.prepare("DELETE FROM legal_documents WHERE wedding_id = ? AND (name LIKE '%N5%' OR name LIKE '%Cerai%')").bind(weddingId).run().catch(() => {});
      legalRes = await db.prepare('SELECT * FROM legal_documents WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    }

    // Auto-seed Seragam Items jika masih kosong
    let seragamRes = await db.prepare('SELECT * FROM seragam_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    if (!seragamRes?.results || seragamRes.results.length === 0) {
      for (const s of DEFAULT_SERAGAM_TEMPLATES) {
        await db.prepare(`
          INSERT INTO seragam_items (id, wedding_id, recipient_name, role_category, item_type, cloth_type, size_or_meter, cloth_cost, tailor_cost, total_cost, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          'srg_' + Math.random().toString(36).substring(2, 9),
          weddingId,
          s.recipient_name,
          s.role_category,
          s.item_type || 'Bahan Kain (Meteran)',
          s.cloth_type,
          s.size_or_meter,
          s.cloth_cost || 0,
          s.tailor_cost || 0,
          s.total_cost || 0,
          s.status,
          s.notes
        ).run();
      }
      seragamRes = await db.prepare('SELECT * FROM seragam_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    } else {
      // Migrasi template seragam lama ke format keluarga (Pengantin Wanita & Pria, Bridesmaid, Groomsmen)
      await db.prepare("UPDATE seragam_items SET recipient_name = 'Seragam Keluarga Pengantin Wanita', cloth_type = 'Bahan Kain Seragam Keluarga', notes = 'Keluarga besar wanita (om, tante, sepupu)' WHERE wedding_id = ? AND (recipient_name = 'Ibu Kandung Pengantin Wanita' OR (recipient_name = 'Seragam Keluarga Pengantin Wanita' AND cloth_type LIKE '%Brokat%'))").bind(weddingId).run().catch(() => {});
      await db.prepare("UPDATE seragam_items SET recipient_name = 'Seragam Keluarga Pengantin Pria', cloth_type = 'Bahan Kain Seragam Keluarga', notes = 'Keluarga besar pria (om, tante, sepupu)' WHERE wedding_id = ? AND (recipient_name = 'Ibu Kandung Pengantin Pria' OR (recipient_name = 'Seragam Keluarga Pengantin Pria' AND (cloth_type LIKE '%Beskap%' OR cloth_type LIKE '%Brokat%')))") .bind(weddingId).run().catch(() => {});
      await db.prepare("UPDATE seragam_items SET recipient_name = 'Bridesmaid' WHERE wedding_id = ? AND recipient_name = 'Bridesmaid (Sahabat Pengantin)'").bind(weddingId).run().catch(() => {});
      await db.prepare("UPDATE seragam_items SET recipient_name = 'Groomsmen' WHERE wedding_id = ? AND recipient_name = 'Groomsmen (Sahabat Pengantin)'").bind(weddingId).run().catch(() => {});
      await db.prepare("DELETE FROM seragam_items WHERE wedding_id = ? AND (recipient_name = 'Ayah Kandung Pengantin Wanita' OR recipient_name = 'Ayah Kandung Pengantin Pria')").bind(weddingId).run().catch(() => {});
      seragamRes = await db.prepare('SELECT * FROM seragam_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    }

    return json({
      metadata: {
        id: wedding.id,
        groom: wedding.groom_name,
        bride: wedding.bride_name,
        title: wedding.title,
        weddingDate: wedding.wedding_date,
        targetSavings: wedding.target_savings,
        goldPricePerGram: wedding.gold_price,
        silverPrice: wedding.silver_price,
        isPremium: Boolean(wedding.is_premium),
        lastUpdated: wedding.updated_at
      },
      tabungan: tabungan.results || [],
      seserahan,
      mahar,
      wedding: weddingVendor,
      undanganSouvenir,
      tamuUndangan: tamuList,
      afterNikah,
      timeline: timelineRes.results || [],
      rundown: rundownRes.results || [],
      legalDocuments: legalRes.results || [],
      seragam: seragamRes.results || [],
      activityLogs: (logs.results || []).map(l => ({
        id: l.id,
        user: l.user_name,
        action: l.action,
        details: l.details,
        timestamp: l.timestamp
      }))
    });
  }

  // 5. POST /api/metadata (Update Target / Tanggal / Harga Emas)
  if (path === 'metadata' && request.method === 'POST') {
    const body = await request.json();
    await db.prepare(`
      UPDATE weddings 
      SET groom_name = ?, bride_name = ?, wedding_date = ?, target_savings = ?, 
          gold_price = ?, silver_price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.groom,
      body.bride,
      body.weddingDate,
      parseInt(body.targetSavings) || 0,
      parseInt(body.goldPricePerGram) || 0,
      parseInt(body.silverPrice) || 0,
      weddingId
    ).run();

    return json({ success: true });
  }

  // 6. Generic CRUD Helper untuk Budget Items (seserahan, mahar, wedding, undangan-souvenir, after-nikah)
  const budgetModules = ['seserahan', 'mahar', 'wedding', 'undanganSouvenir', 'afterNikah'];
  let routeModule = null;
  let routeItemId = null;

  if (path.startsWith('undangan-souvenir') || path.startsWith('undanganSouvenir')) {
    routeModule = 'undanganSouvenir';
    const parts = path.split('/');
    routeItemId = parts[1];
  } else if (path.startsWith('after-nikah') || path.startsWith('afterNikah')) {
    routeModule = 'afterNikah';
    const parts = path.split('/');
    routeItemId = parts[1];
  } else {
    for (const mod of budgetModules) {
      if (path.startsWith(mod)) {
        routeModule = mod;
        const parts = path.split('/');
        routeItemId = parts[1];
        break;
      }
    }
  }

  if (routeModule) {
    const mod = routeModule;
    const itemId = routeItemId;

    // ADD
    if (request.method === 'POST' && !itemId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM budget_items WHERE wedding_id = ? AND module = ?').bind(weddingId, mod).first();
        const limits = {
          wedding: 8,
          seserahan: 12,
          mahar: 5,
          undanganSouvenir: 6,
          afterNikah: 10
        };
        const maxAllowed = limits[mod] || 6;
        if ((countRes?.count || 0) >= maxAllowed) {
          return json({
            error: `Batas kuota akun Gratis tercapai (maksimal ${maxAllowed} item untuk ${mod}). Silakan upgrade ke Siap Nikah VIP untuk pos anggaran tanpa batas!`
          }, 403);
        }
      }

        const item = await request.json();
        const newId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const incomingTargetCost = item.targetCost ?? item.target_cost ?? item.price ?? item.estimatedCost ?? item.estimatedPrice ?? item.totalPrice ?? item.unitPrice ?? 0;
        const targetCost = parseInt(incomingTargetCost) || 0;
        const actualCost = parseInt(item.actualCost ?? item.actual_cost) || 0;
        const paidAmount = parseInt(item.paidAmount ?? item.paid_amount ?? item.dpPaid) || 0;

        let status = item.status || 'Pending';
        if (item.purchased !== undefined) {
          status = item.purchased ? 'Lunas' : 'Pending';
        }
        const vendorName = item.vendorName ?? item.vendor_name ?? item.purchasedBy ?? item.weight ?? '';
        const vendorContact = item.vendorContact ?? item.vendor_contact ?? item.link ?? item.detail ?? '';
        const notes = item.notes || item.detail || '';

        await db.prepare(`
          INSERT INTO budget_items (id, wedding_id, module, category, name, target_cost, actual_cost, paid_amount, status, vendor_name, vendor_contact, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newId,
          weddingId,
          mod,
          item.category || item.type || '',
          item.name || 'Pos Anggaran',
          targetCost,
          actualCost,
          paidAmount,
          status,
          vendorName,
          vendorContact,
          notes
        ).run();
        return json({ success: true, id: newId });
      }

      // UPDATE
      if (request.method === 'PUT' && itemId) {
        const item = await request.json();
        const existing = await db.prepare('SELECT * FROM budget_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).first();
        if (!existing) {
          return json({ error: 'Item tidak ditemukan' }, 404);
        }

        const category = item.category !== undefined 
          ? item.category 
          : (item.type !== undefined ? item.type : existing.category);
        const name = item.name !== undefined ? item.name : existing.name;

        let targetCost = existing.target_cost;
        const incomingTargetCost = item.targetCost ?? item.target_cost ?? item.price ?? item.estimatedCost ?? item.estimatedPrice ?? item.totalPrice ?? item.unitPrice;
        if (incomingTargetCost !== undefined) {
          targetCost = parseInt(incomingTargetCost) || 0;
        }

        let actualCost = existing.actual_cost;
        const incomingActualCost = item.actualCost ?? item.actual_cost;
        if (incomingActualCost !== undefined) {
          actualCost = parseInt(incomingActualCost) || 0;
        }

        let paidAmount = existing.paid_amount;
        const incomingPaidAmount = item.paidAmount ?? item.paid_amount ?? item.dpPaid;
        if (incomingPaidAmount !== undefined) {
          paidAmount = parseInt(incomingPaidAmount) || 0;
        }

        let status = existing.status;
        if (item.status !== undefined) {
          status = item.status;
        } else if (item.purchased !== undefined) {
          status = item.purchased ? 'Lunas' : 'Pending';
        } else if (item.checked !== undefined) {
          status = item.checked ? 'Lunas' : 'Pending';
        }

        let vendorName = existing.vendor_name;
        if (item.vendorName !== undefined || item.vendor_name !== undefined || item.purchasedBy !== undefined || item.weight !== undefined) {
          vendorName = item.vendorName ?? item.vendor_name ?? item.purchasedBy ?? item.weight ?? '';
        }

        let vendorContact = existing.vendor_contact;
        if (item.vendorContact !== undefined || item.vendor_contact !== undefined || item.link !== undefined || item.detail !== undefined) {
          vendorContact = item.vendorContact ?? item.vendor_contact ?? item.link ?? item.detail ?? '';
        }

        let notes = existing.notes;
        if (item.notes !== undefined) {
          notes = item.notes;
        } else if (item.detail !== undefined && !item.link) {
          notes = item.detail;
        }

        await db.prepare(`
          UPDATE budget_items 
          SET category = ?, name = ?, target_cost = ?, actual_cost = ?, paid_amount = ?, status = ?, vendor_name = ?, vendor_contact = ?, notes = ?
          WHERE id = ? AND wedding_id = ?
        `).bind(
          category,
          name,
          targetCost,
          actualCost,
          paidAmount,
          status,
          vendorName,
          vendorContact,
          notes,
          itemId,
          weddingId
        ).run();
        return json({ success: true });
      }

      // DELETE
      if (request.method === 'DELETE' && itemId) {
        await db.prepare('DELETE FROM budget_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).run();
        return json({ success: true });
      }
    }

  // 7. TABUNGAN CRUD
  if (path.startsWith('tabungan')) {
    const parts = path.split('/');
    const tabId = parts[1];

    if (request.method === 'POST' && !tabId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM tabungan WHERE wedding_id = ?').bind(weddingId).first();
        if ((countRes?.count || 0) >= 5) {
          return json({
            error: 'Batas kuota 5 kali setoran tabungan di akun Gratis tercapai. Silakan upgrade ke Siap Nikah VIP untuk riwayat setoran tanpa batas!'
          }, 403);
        }
      }

      const item = await request.json();
      const newId = 'tab_' + Date.now();
      await db.prepare(`
        INSERT INTO tabungan (id, wedding_id, date, amount, contributor, category, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        weddingId,
        item.date || new Date().toISOString().split('T')[0],
        parseInt(item.amount) || 0,
        item.contributor || actor,
        item.category || 'Tabungan',
        item.notes || ''
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && tabId) {
      const item = await request.json();
      const existing = await db.prepare('SELECT * FROM tabungan WHERE id = ? AND wedding_id = ?').bind(tabId, weddingId).first();
      if (!existing) {
        return json({ error: 'Data tabungan tidak ditemukan' }, 404);
      }

      const date = item.date ?? existing.date;
      const amount = item.amount !== undefined ? (parseInt(item.amount) || 0) : existing.amount;
      const contributor = item.contributor ?? existing.contributor;
      const category = item.category ?? existing.category;
      const notes = item.notes ?? existing.notes;

      await db.prepare(`
        UPDATE tabungan
        SET date = ?, amount = ?, contributor = ?, category = ?, notes = ?
        WHERE id = ? AND wedding_id = ?
      `).bind(date, amount, contributor, category, notes, tabId, weddingId).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && tabId) {
      await db.prepare('DELETE FROM tabungan WHERE id = ? AND wedding_id = ?').bind(tabId, weddingId).run();
      return json({ success: true });
    }
  }

  // 8. TAMU UNDANGAN CRUD
  if (path.startsWith('tamu')) {
    const parts = path.split('/');
    const tamuId = parts[1];

    if (request.method === 'POST' && !tamuId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM tamu_undangan WHERE wedding_id = ?').bind(weddingId).first();
        if ((countRes?.count || 0) >= 15) {
          return json({
            error: 'Batas kuota 15 tamu di akun Gratis tercapai. Silakan upgrade ke Siap Nikah VIP untuk kelola tamu tanpa batas!'
          }, 403);
        }
      }

      const item = await request.json();
      const newId = 'tamu_' + Date.now();
      const slug = (item.name || 'tamu').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let combinedCategory = item.category || 'Reguler';
      if (item.relationship) {
        combinedCategory = `${item.category || 'Reguler'} (${item.relationship})`;
      }
      
      const initialStatus = (item.status === 'Terkirim' || item.statusKirim === 'Terkirim' || item.statusKirim === 'Sudah Dikirim') ? 'Terkirim' : 'Draft';
      const initialRsvp = item.rsvpStatus || item.rsvp_status || item.konfirmasi || 'Pending';

      await db.prepare(`
        INSERT INTO tamu_undangan (id, wedding_id, name, category, pax, phone, slug, status, rsvp_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        weddingId,
        item.name || 'Nama Tamu',
        combinedCategory,
        parseInt(item.pax) || 1,
        item.phone || item.notes || '',
        slug,
        initialStatus,
        (initialRsvp === 'Hadir' || initialRsvp === 'Tidak Hadir') ? initialRsvp : 'Pending'
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && tamuId) {
      const item = await request.json();
      const existing = await db.prepare('SELECT * FROM tamu_undangan WHERE id = ? AND wedding_id = ?').bind(tamuId, weddingId).first();
      if (!existing) {
        return json({ error: 'Data tamu tidak ditemukan' }, 404);
      }

      const name = item.name ?? existing.name;
      
      let category = existing.category;
      if (item.category !== undefined || item.relationship !== undefined) {
        const cat = item.category || (existing.category?.includes('VIP') ? 'VIP' : 'Reguler');
        if (item.relationship) {
          category = `${cat} (${item.relationship})`;
        } else {
          category = item.category || existing.category;
        }
      }

      const pax = item.pax !== undefined ? (parseInt(item.pax) || 1) : existing.pax;
      const phone = item.phone ?? item.notes ?? existing.phone;
      
      let status = existing.status;
      if (item.status !== undefined) {
        status = item.status;
      } else if (item.statusKirim !== undefined) {
        status = (item.statusKirim === 'Terkirim' || item.statusKirim === 'Sudah Dikirim') ? 'Terkirim' : 'Draft';
      }

      let rsvpStatus = existing.rsvp_status;
      const incomingRsvp = item.rsvpStatus ?? item.rsvp_status ?? item.konfirmasi;
      if (incomingRsvp !== undefined) {
        rsvpStatus = (incomingRsvp === 'Hadir' || incomingRsvp === 'Tidak Hadir') ? incomingRsvp : 'Pending';
      }

      await db.prepare(`
        UPDATE tamu_undangan
        SET name = ?, category = ?, pax = ?, phone = ?, status = ?, rsvp_status = ?
        WHERE id = ? AND wedding_id = ?
      `).bind(name, category, pax, phone, status, rsvpStatus, tamuId, weddingId).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && tamuId) {
      await db.prepare('DELETE FROM tamu_undangan WHERE id = ? AND wedding_id = ?').bind(tamuId, weddingId).run();
      return json({ success: true });
    }
  }

  // 9. TIMELINE / CHECKLIST CRUD
  if (path.startsWith('timeline')) {
    const parts = path.split('/');
    const itemId = parts[1];

    if (request.method === 'POST' && !itemId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM timeline_items WHERE wedding_id = ?').bind(weddingId).first();
        if ((countRes?.count || 0) >= 35) {
          return json({
            error: 'Batas kuota checklist di akun Gratis tercapai. Silakan upgrade ke Siap Nikah VIP untuk checklist tugas tanpa batas!'
          }, 403);
        }
      }

      const item = await request.json();
      const newId = 'time_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await db.prepare(`
        INSERT INTO timeline_items (id, wedding_id, phase, title, assigned_to, completed, due_date, notes)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        newId,
        weddingId,
        item.phase || 'H-1 Bulan',
        item.title || 'Tugas Baru',
        item.assignedTo || item.assigned_to || 'Bersama',
        item.dueDate || item.due_date || '',
        item.notes || ''
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && itemId) {
      const item = await request.json();
      await db.prepare(`
        UPDATE timeline_items
        SET phase = COALESCE(?, phase),
            title = COALESCE(?, title),
            assigned_to = COALESCE(?, assigned_to),
            completed = COALESCE(?, completed),
            due_date = COALESCE(?, due_date),
            notes = COALESCE(?, notes)
        WHERE id = ? AND wedding_id = ?
      `).bind(
        item.phase ?? null,
        item.title ?? null,
        item.assignedTo ?? item.assigned_to ?? null,
        item.completed !== undefined ? (item.completed ? 1 : 0) : null,
        item.dueDate ?? item.due_date ?? null,
        item.notes ?? null,
        itemId,
        weddingId
      ).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && itemId) {
      await db.prepare('DELETE FROM timeline_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).run();
      return json({ success: true });
    }
  }

  // 10. RUNDOWN HARI H CRUD
  if (path.startsWith('rundown')) {
    const parts = path.split('/');
    const itemId = parts[1];

    if (request.method === 'POST' && !itemId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM rundown_items WHERE wedding_id = ?').bind(weddingId).first();
        if ((countRes?.count || 0) >= 12) {
          return json({
            error: 'Batas kuota 12 agenda rundown di akun Gratis tercapai. Silakan upgrade ke Siap Nikah VIP untuk rundown hari H tanpa batas!'
          }, 403);
        }
      }

      const item = await request.json();
      const newId = 'run_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await db.prepare(`
        INSERT INTO rundown_items (id, wedding_id, time_start, time_end, title, location, pic, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        weddingId,
        item.timeStart || item.time_start || '08:00',
        item.timeEnd || item.time_end || '',
        item.title || 'Sesi Acara',
        item.location || '',
        item.pic || '',
        item.notes || '',
        parseInt(item.sortOrder || item.sort_order) || 0
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && itemId) {
      const item = await request.json();
      await db.prepare(`
        UPDATE rundown_items
        SET time_start = COALESCE(?, time_start),
            time_end = COALESCE(?, time_end),
            title = COALESCE(?, title),
            location = COALESCE(?, location),
            pic = COALESCE(?, pic),
            notes = COALESCE(?, notes),
            sort_order = COALESCE(?, sort_order)
        WHERE id = ? AND wedding_id = ?
      `).bind(
        item.timeStart ?? item.time_start ?? null,
        item.timeEnd ?? item.time_end ?? null,
        item.title ?? null,
        item.location ?? null,
        item.pic ?? null,
        item.notes ?? null,
        item.sortOrder ?? item.sort_order ?? null,
        itemId,
        weddingId
      ).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && itemId) {
      await db.prepare('DELETE FROM rundown_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).run();
      return json({ success: true });
    }
  }

  // 11. DOKUMEN LEGALITAS KUA & SIPIL CRUD
  if (path.startsWith('legal')) {
    const parts = path.split('/');
    const itemId = parts[1];

    if (request.method === 'POST' && !itemId) {
      const item = await request.json();
      const newId = 'leg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      await db.prepare(`
        INSERT INTO legal_documents (id, wedding_id, category, name, description, status, notes)
        VALUES (?, ?, ?, ?, ?, 'Belum', ?)
      `).bind(
        newId,
        weddingId,
        item.category || 'kua',
        item.name || 'Dokumen Tambahan',
        item.description || '',
        item.notes || ''
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && itemId) {
      const item = await request.json();
      await db.prepare(`
        UPDATE legal_documents
        SET status = COALESCE(?, status),
            notes = COALESCE(?, notes),
            name = COALESCE(?, name),
            description = COALESCE(?, description)
        WHERE id = ? AND wedding_id = ?
      `).bind(
        item.status ?? null,
        item.notes ?? null,
        item.name ?? null,
        item.description ?? null,
        itemId,
        weddingId
      ).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && itemId) {
      await db.prepare('DELETE FROM legal_documents WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).run();
      return json({ success: true });
    }
  }

  // 12. REKAP SERAGAM KELUARGA & PANITIA CRUD
  if (path.startsWith('seragam')) {
    const parts = path.split('/');
    const itemId = parts[1];

    if (request.method === 'POST' && !itemId) {
      const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
      if (!wedding?.is_premium) {
        const countRes = await db.prepare('SELECT COUNT(*) as count FROM seragam_items WHERE wedding_id = ?').bind(weddingId).first();
        if ((countRes?.count || 0) >= 8) {
          return json({
            error: 'Batas kuota 8 data seragam di akun Gratis tercapai. Silakan upgrade ke Siap Nikah VIP untuk rekap seragam tanpa batas!'
          }, 403);
        }
      }

      const item = await request.json();
      const newId = 'srg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const clothCost = parseInt(item.clothCost ?? item.cloth_cost) || 0;
      const tailorCost = parseInt(item.tailorCost ?? item.tailor_cost) || 0;
      const totalCost = clothCost + tailorCost;

      await db.prepare(`
        INSERT INTO seragam_items (id, wedding_id, recipient_name, role_category, item_type, cloth_type, size_or_meter, cloth_cost, tailor_cost, total_cost, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newId,
        weddingId,
        item.recipientName || item.recipient_name || 'Penerima Seragam',
        item.roleCategory || item.role_category || 'Keluarga Wanita',
        item.itemType || item.item_type || 'Bahan Kain (Meteran)',
        item.clothType || item.cloth_type || 'Kain',
        item.sizeOrMeter || item.size_or_meter || '',
        clothCost,
        tailorCost,
        totalCost,
        item.status || 'Belum Diberikan',
        item.notes || ''
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'PUT' && itemId) {
      const item = await request.json();
      const clothCost = item.clothCost !== undefined ? parseInt(item.clothCost) : item.cloth_cost !== undefined ? parseInt(item.cloth_cost) : null;
      const tailorCost = item.tailorCost !== undefined ? parseInt(item.tailorCost) : item.tailor_cost !== undefined ? parseInt(item.tailor_cost) : null;
      
      let totalCost = null;
      if (clothCost !== null || tailorCost !== null) {
        const currentItem = await db.prepare('SELECT cloth_cost, tailor_cost FROM seragam_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).first();
        const finalCloth = clothCost !== null ? clothCost : (currentItem?.cloth_cost || 0);
        const finalTailor = tailorCost !== null ? tailorCost : (currentItem?.tailor_cost || 0);
        totalCost = finalCloth + finalTailor;
      }

      await db.prepare(`
        UPDATE seragam_items
        SET recipient_name = COALESCE(?, recipient_name),
            role_category = COALESCE(?, role_category),
            item_type = COALESCE(?, item_type),
            cloth_type = COALESCE(?, cloth_type),
            size_or_meter = COALESCE(?, size_or_meter),
            cloth_cost = COALESCE(?, cloth_cost),
            tailor_cost = COALESCE(?, tailor_cost),
            total_cost = COALESCE(?, total_cost),
            status = COALESCE(?, status),
            notes = COALESCE(?, notes)
        WHERE id = ? AND wedding_id = ?
      `).bind(
        item.recipientName ?? item.recipient_name ?? null,
        item.roleCategory ?? item.role_category ?? null,
        item.itemType ?? item.item_type ?? null,
        item.clothType ?? item.cloth_type ?? null,
        item.sizeOrMeter ?? item.size_or_meter ?? null,
        clothCost,
        tailorCost,
        totalCost,
        item.status ?? null,
        item.notes ?? null,
        itemId,
        weddingId
      ).run();
      return json({ success: true });
    }

    if (request.method === 'DELETE' && itemId) {
      await db.prepare('DELETE FROM seragam_items WHERE id = ? AND wedding_id = ?').bind(itemId, weddingId).run();
      return json({ success: true });
    }
  }

  // 13. SIMULASI / TESTING TOGGLE STATUS VIP
  if (path === 'test/toggle-vip' && request.method === 'POST') {
    const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
    const newStatus = wedding?.is_premium ? 0 : 1;
    await db.prepare('UPDATE weddings SET is_premium = ? WHERE id = ?').bind(newStatus, weddingId).run();
    return json({ success: true, isPremium: Boolean(newStatus) });
  }

  // 10. GET /api/export-excel (Ekspor Spreadsheet CSV/Excel)
  if (path === 'export-excel' && request.method === 'GET') {
    const wedding = await db.prepare('SELECT * FROM weddings WHERE id = ?').bind(weddingId).first();
    if (!wedding || !wedding.is_premium) {
      return json({ error: 'Fitur Unduh Backup Spreadsheet hanya tersedia untuk pengguna Siap Nikah VIP.' }, 403);
    }

    const tabungan = await db.prepare('SELECT * FROM tabungan WHERE wedding_id = ? ORDER BY date ASC').bind(weddingId).all();
    const budgetItems = await db.prepare('SELECT * FROM budget_items WHERE wedding_id = ? ORDER BY module, category').bind(weddingId).all();
    const tamu = await db.prepare('SELECT * FROM tamu_undangan WHERE wedding_id = ? ORDER BY name ASC').bind(weddingId).all();
    const timeline = await db.prepare('SELECT * FROM timeline_items WHERE wedding_id = ? ORDER BY id ASC').bind(weddingId).all();
    const rundown = await db.prepare('SELECT * FROM rundown_items WHERE wedding_id = ? ORDER BY time_start ASC, sort_order ASC').bind(weddingId).all();
    const legal = await db.prepare('SELECT * FROM legal_documents WHERE wedding_id = ? ORDER BY category, id ASC').bind(weddingId).all();
    const seragam = await db.prepare('SELECT * FROM seragam_items WHERE wedding_id = ? ORDER BY role_category, recipient_name ASC').bind(weddingId).all();

    let csv = '\uFEFF'; // UTF-8 BOM untuk Microsoft Excel
    csv += `LAPORAN PERENCANAAN PERNIKAHAN: ${wedding.groom_name} & ${wedding.bride_name}\n`;
    csv += `Tanggal Pernikahan: ${wedding.wedding_date || '-'}\n`;
    csv += `Target Tabungan: Rp ${Number(wedding.target_savings || 0).toLocaleString('id-ID')}\n\n`;

    csv += `--- TABUNGAN BERSAMA ---\n`;
    csv += `Tanggal,Pengisi,Jumlah (Rp),Kategori,Catatan\n`;
    for (const t of (tabungan.results || [])) {
      csv += `"${t.date || ''}","${t.contributor || ''}",${t.amount || 0},"${t.category || ''}","${(t.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += `\n--- RINCIAN ANGGARAN & VENDOR ---\n`;
    csv += `Modul,Kategori,Nama Item,Target Biaya (Rp),Realisasi (Rp),Terbayar DP (Rp),Status,Catatan\n`;
    for (const b of (budgetItems.results || [])) {
      csv += `"${b.module || ''}","${b.category || ''}","${(b.name || '').replace(/"/g, '""')}",${b.target_cost || 0},${b.actual_cost || 0},${b.paid_amount || 0},"${b.status || ''}","${(b.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += `\n--- DAFTAR BUKU TAMU UNDANGAN ---\n`;
    csv += `Nama Tamu,Kategori/Relasi,Pax,No Telepon,Status Kirim,Konfirmasi Kehadiran\n`;
    for (const tm of (tamu.results || [])) {
      csv += `"${(tm.name || '').replace(/"/g, '""')}","${tm.category || ''}",${tm.pax || 1},"${tm.phone || ''}","${tm.status || ''}","${tm.rsvp_status || ''}"\n`;
    }

    csv += `\n--- TIMELINE & CHECKLIST PERSIAPAN ---\n`;
    csv += `Tahapan Waktu,Tugas,Penanggung Jawab,Status,Target Tanggal,Catatan\n`;
    for (const tl of (timeline.results || [])) {
      csv += `"${tl.phase || ''}","${(tl.title || '').replace(/"/g, '""')}","${tl.assigned_to || ''}","${tl.completed ? 'Selesai' : 'Belum'}","${tl.due_date || ''}","${(tl.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += `\n--- RUNDOWN SUSUNAN ACARA HARI H ---\n`;
    csv += `Waktu Mulai,Waktu Selesai,Agenda Acara,Lokasi,Penanggung Jawab (PIC),Catatan / Perlengkapan\n`;
    for (const rd of (rundown.results || [])) {
      csv += `"${rd.time_start || ''}","${rd.time_end || ''}","${(rd.title || '').replace(/"/g, '""')}","${(rd.location || '').replace(/"/g, '""')}","${(rd.pic || '').replace(/"/g, '""')}","${(rd.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += `\n--- CHECKLIST DOKUMEN LEGALITAS KUA & CATATAN SIPIL ---\n`;
    csv += `Instansi,Nama Berkas/Dokumen,Keterangan,Status Kelengkapan,Catatan\n`;
    for (const lg of (legal.results || [])) {
      csv += `"${lg.category === 'kua' ? 'KUA (Muslim)' : 'Catatan Sipil'}","${(lg.name || '').replace(/"/g, '""')}","${(lg.description || '').replace(/"/g, '""')}","${lg.status || 'Belum'}","${(lg.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += `\n--- REKAP PEMBAGIAN SERAGAM KELUARGA & BRIDESMAID ---\n`;
    csv += `Nama Penerima,Kelompok,Bentuk Seragam,Rincian Bahan/Busana,Ukuran/Meter,Biaya Bahan (Rp),Ongkos Jahit (Rp),Total Biaya (Rp),Status Pembagian,Catatan\n`;
    for (const sg of (seragam.results || [])) {
      csv += `"${(sg.recipient_name || '').replace(/"/g, '""')}","${sg.role_category || ''}","${sg.item_type || ''}","${(sg.cloth_type || '').replace(/"/g, '""')}","${sg.size_or_meter || ''}",${sg.cloth_cost || 0},${sg.tailor_cost || 0},${sg.total_cost || 0},"${sg.status || ''}","${(sg.notes || '').replace(/"/g, '""')}"\n`;
    }

    const filename = `WeddingPlan_${(wedding.groom_name || 'Pria')}_${(wedding.bride_name || 'Wanita')}.csv`;
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  }

  return json({ error: 'Endpoint tidak ditemukan' }, 404);
}
