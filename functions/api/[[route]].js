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
  { module: 'seserahan', category: 'Skincare', name: 'Set Skincare & Bodycare', target_cost: 2000000 },
  { module: 'seserahan', category: 'Fashion', name: 'Tas & Sepatu Kerja', target_cost: 2500000 },
  { module: 'seserahan', category: 'Pakaian', name: 'Bahan Kebaya / Batik', target_cost: 1500000 },
  
  // Undangan & Souvenir
  { module: 'undanganSouvenir', category: 'Souvenir', name: 'Souvenir Tamu (300 pcs)', target_cost: 2500000 },
  { module: 'undanganSouvenir', category: 'Cetak', name: 'Buku Tamu & Cetak Fisik', target_cost: 500000 },
  
  // Pasca Nikah
  { module: 'afterNikah', category: 'Honeymoon', name: 'Tiket & Akomodasi Bulan Madu', target_cost: 7000000 },
  { module: 'afterNikah', category: 'Darurat', name: 'Dana Darurat Rumah Tangga Awal', target_cost: 5000000 }
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

    const mahar = allBudgets.filter(i => i.module === 'mahar').map(i => ({
      id: i.id,
      category: i.category || 'Logam Mulia',
      name: i.name,
      price: Number(i.target_cost) || 0,
      detail: i.notes || '',
      status: i.status || 'Rencana',
      notes: i.notes || ''
    }));

    const weddingVendor = allBudgets.filter(i => i.module === 'wedding').map(i => ({
      id: i.id,
      category: i.category || 'Vendor',
      name: i.name,
      estimatedCost: Number(i.target_cost) || 0,
      dpPaid: Number(i.paid_amount) || 0,
      detail: i.notes || '',
      status: i.status || 'Pending',
      notes: i.notes || ''
    }));

    const undanganSouvenir = allBudgets.filter(i => i.module === 'undanganSouvenir').map(i => ({
      id: i.id,
      type: i.category === 'Souvenir' ? 'Souvenir' : 'Undangan',
      name: i.name,
      detail: i.notes || '',
      unitPrice: Number(i.target_cost) || 0,
      quantity: 1,
      totalPrice: Number(i.target_cost) || 0,
      link: i.vendor_contact || '',
      checked: i.status === 'Lunas',
      notes: i.notes || ''
    }));

    const afterNikah = allBudgets.filter(i => i.module === 'afterNikah').map(i => ({
      id: i.id,
      name: i.name,
      estimatedPrice: Number(i.target_cost) || 0,
      priority: 'Tinggi',
      status: i.paid_amount > 0 ? 'Sudah Ada' : 'Belum Ada',
      notes: i.notes || ''
    }));

    const tamuList = (tamu.results || []).map(t => ({
      id: t.id,
      name: t.name,
      relationship: t.category || `Keluarga ${wedding.groom_name}`,
      category: 'Reguler',
      pax: t.pax || 1,
      statusKirim: t.status === 'Terkirim' ? 'Sudah Dikirim' : 'Belum Dikirim',
      konfirmasi: t.rsvp_status === 'Hadir' ? 'Hadir' : t.rsvp_status === 'Tidak Hadir' ? 'Tidak Hadir' : 'Belum Konfirmasi',
      notes: t.phone || ''
    }));

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

  // 6. Generic CRUD Helper untuk Budget Items (seserahan, mahar, wedding, dll)
  const budgetModules = ['seserahan', 'mahar', 'wedding', 'undanganSouvenir', 'afterNikah'];
  for (const mod of budgetModules) {
    if (path.startsWith(mod)) {
      const parts = path.split('/');
      const itemId = parts[1];

      // ADD
      if (request.method === 'POST' && !itemId) {
        const wedding = await db.prepare('SELECT is_premium FROM weddings WHERE id = ?').bind(weddingId).first();
        if (!wedding?.is_premium) {
          const countRes = await db.prepare('SELECT COUNT(*) as count FROM budget_items WHERE wedding_id = ? AND module = ?').bind(weddingId, mod).first();
          const limits = {
            wedding: 7,
            seserahan: 5,
            mahar: 3,
            undanganSouvenir: 3,
            afterNikah: 5
          };
          const maxAllowed = limits[mod] || 5;
          if ((countRes?.count || 0) >= maxAllowed) {
            return json({
              error: `Batas kuota akun Gratis tercapai (maksimal ${maxAllowed} item untuk ${mod}). Silakan upgrade ke Siap Nikah VIP untuk pos anggaran tanpa batas!`
            }, 403);
          }
        }

        const item = await request.json();
        const newId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        await db.prepare(`
          INSERT INTO budget_items (id, wedding_id, module, category, name, target_cost, actual_cost, paid_amount, status, vendor_name, vendor_contact, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newId,
          weddingId,
          mod,
          item.category || '',
          item.name || 'Pos Anggaran',
          parseInt(item.targetCost || item.target_cost) || 0,
          parseInt(item.actualCost || item.actual_cost) || 0,
          parseInt(item.paidAmount || item.paid_amount) || 0,
          item.status || 'Pending',
          item.vendorName || item.vendor_name || '',
          item.vendorContact || item.vendor_contact || '',
          item.notes || ''
        ).run();
        return json({ success: true, id: newId });
      }

      // UPDATE
      if (request.method === 'PUT' && itemId) {
        const item = await request.json();
        await db.prepare(`
          UPDATE budget_items 
          SET category = ?, name = ?, target_cost = ?, actual_cost = ?, paid_amount = ?, status = ?, vendor_name = ?, vendor_contact = ?, notes = ?
          WHERE id = ? AND wedding_id = ?
        `).bind(
          item.category || '',
          item.name,
          parseInt(item.targetCost ?? item.target_cost) || 0,
          parseInt(item.actualCost ?? item.actual_cost) || 0,
          parseInt(item.paidAmount ?? item.paid_amount) || 0,
          item.status || 'Pending',
          item.vendorName || item.vendor_name || '',
          item.vendorContact || item.vendor_contact || '',
          item.notes || '',
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
      await db.prepare(`
        INSERT INTO tamu_undangan (id, wedding_id, name, category, pax, phone, slug, status, rsvp_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', 'Pending')
      `).bind(
        newId,
        weddingId,
        item.name || 'Nama Tamu',
        item.category || 'Teman',
        parseInt(item.pax) || 1,
        item.phone || '',
        slug
      ).run();
      return json({ success: true, id: newId });
    }

    if (request.method === 'DELETE' && tamuId) {
      await db.prepare('DELETE FROM tamu_undangan WHERE id = ? AND wedding_id = ?').bind(tamuId, weddingId).run();
      return json({ success: true });
    }
  }

  // 9. SIMULASI / TESTING TOGGLE STATUS VIP
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
