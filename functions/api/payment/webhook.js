// Webhook Handler untuk Mayar.id
// Endpoint: POST /api/payment/webhook

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.json().catch(() => ({}));
    
    // Debug log
    console.log('Mayar Webhook received:', JSON.stringify(payload));

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mayar payload structure:
    // payload.event = 'payment.received'
    // payload.data = { status: 'SUCCESS', customer: { email }, extraData: { weddingId } }
    const data = payload.data || payload;
    const url = new URL(request.url);

    // Ambil wedding_id dari berbagai kemungkinan field Mayar
    const weddingId = data?.extraData?.weddingId 
      || data?.metadata?.weddingId 
      || data?.custom_fields?.weddingId 
      || url.searchParams.get('wedding_id');

    if (weddingId) {
      await db.prepare('UPDATE weddings SET is_premium = 1 WHERE id = ?').bind(weddingId).run();
      
      await db.prepare(`
        INSERT INTO activity_logs (id, wedding_id, user_name, action, details)
        VALUES (?, ?, 'Sistem Mayar', 'Pembayaran Berhasil', 'Akun berhasil ditingkatkan ke status Siap Nikah VIP')
      `).bind('log_' + Date.now(), weddingId).run();

      return new Response(JSON.stringify({ success: true, message: 'Status VIP berhasil diaktifkan' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Jika weddingId tidak langsung tertera, cocokkan via email customer Mayar
    const customerEmail = data?.customer?.email || data?.customer_email || data?.email;
    if (customerEmail) {
      const matchedUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(customerEmail.toLowerCase().trim()).first();
      if (matchedUser) {
        await db.prepare('UPDATE weddings SET is_premium = 1 WHERE owner_id = ?').bind(matchedUser.id).run();
        return new Response(JSON.stringify({ success: true, message: 'VIP diaktifkan via email user' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ received: true, note: 'Webhook diproses tetapi wedding_id tidak ditemukan' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal webhook error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
