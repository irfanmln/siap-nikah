import { signSession, verifySession, verifyGoogleIdToken, hashPassword, verifyPassword } from '../auth-helper.js';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/auth\/?/, '');

  if (request.method === 'OPTIONS') {
    return json({ ok: true });
  }

  const db = env.DB;
  if (!db) {
    return json({ error: 'Database D1 binding not found' }, 500);
  }

  // 1. POST /api/auth/google (Google Login & Auto Registration)
  if (path === 'google' && request.method === 'POST') {
    try {
      const { credential } = await request.json();
      if (!credential) {
        return json({ error: 'Credential Google diperlukan' }, 400);
      }

      // Verifikasi token ke Google
      const googleUser = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID);
      
      // Cek apakah user sudah ada di database
      let user = await db.prepare('SELECT * FROM users WHERE email = ?')
        .bind(googleUser.email)
        .first();

      if (!user) {
        // Registrasi user baru
        const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        await db.prepare(
          'INSERT INTO users (id, email, name, avatar_url) VALUES (?, ?, ?, ?)'
        ).bind(newUserId, googleUser.email, googleUser.name, googleUser.picture).run();

        user = {
          id: newUserId,
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture
        };
      }

      // Ambil daftar wedding yang dimiliki / diakses oleh user ini
      const weddings = await db.prepare(`
        SELECT w.*, 'owner' as role FROM weddings w WHERE w.owner_id = ?
        UNION
        SELECT w.*, wm.role FROM weddings w 
        JOIN wedding_members wm ON w.id = wm.wedding_id 
        WHERE wm.user_id = ?
      `).bind(user.id, user.id).all();

      // Buat token session
      const token = await signSession(
        { userId: user.id, email: user.email, name: user.name },
        env.JWT_SECRET
      );

      return json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url
        },
        weddings: weddings.results || []
      });
    } catch (err) {
      return json({ error: err.message || 'Gagal autentikasi Google' }, 401);
    }
  }

  // 2. POST /api/auth/register (Registrasi Email Dinonaktifkan - Full Wajib Akun Google)
  if (path === 'register' && request.method === 'POST') {
    return json({
      error: 'Pendaftaran menggunakan email manual dinonaktifkan demi keamanan. Silakan masuk menggunakan 1-Klik Akun Google resmi.'
    }, 400);
  }

  // 3. POST /api/auth/login (Masuk via Email Dinonaktifkan - Full Wajib Akun Google)
  if (path === 'login' && request.method === 'POST') {
    return json({
      error: 'Masuk dengan email manual dinonaktifkan. Silakan gunakan tombol Masuk dengan Akun Google resmi.'
    }, 400);
  }

  // 4. GET /api/auth/me (Cek User yang Sedang Login)
  if (path === 'me' && request.method === 'GET') {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const session = await verifySession(token, env.JWT_SECRET);
    if (!session) {
      return json({ error: 'Sesi tidak valid atau telah berakhir' }, 401);
    }

    const user = await db.prepare('SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?')
      .bind(session.userId)
      .first();

    if (!user) {
      return json({ error: 'User tidak ditemukan' }, 404);
    }

    const weddings = await db.prepare(`
      SELECT w.*, 'owner' as role FROM weddings w WHERE w.owner_id = ?
      UNION
      SELECT w.*, wm.role FROM weddings w 
      JOIN wedding_members wm ON w.id = wm.wedding_id 
      WHERE wm.user_id = ?
    `).bind(user.id, user.id).all();

    return json({
      user,
      weddings: weddings.results || []
    });
  }

  return json({ error: 'Endpoint auth tidak ditemukan' }, 404);
}
