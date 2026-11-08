const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('nikahplan_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('nikahplan_token', token);
  } else {
    localStorage.removeItem('nikahplan_token');
  }
}

export function getActiveWeddingId() {
  return localStorage.getItem('nikahplan_wedding_id') || '';
}

export function setActiveWeddingId(weddingId) {
  if (weddingId) {
    localStorage.setItem('nikahplan_wedding_id', weddingId);
  } else {
    localStorage.removeItem('nikahplan_wedding_id');
  }
}

// AUTH API
export async function loginWithGoogleApi(credential) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal login via Google');
  }
  return res.json();
}

export async function registerWithEmailApi(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mendaftar dengan email');
  }
  return data;
}

export async function loginWithEmailApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Email atau password salah');
  }
  return data;
}

export async function fetchCurrentUserApi() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    setAuthToken(null);
    return null;
  }
  return res.json();
}

export async function fetchDb() {
  const token = getAuthToken();
  const weddingId = getActiveWeddingId();
  const res = await fetch(`${API_BASE}/data${weddingId ? `?wedding_id=${weddingId}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-wedding-id': weddingId
    }
  });
  if (!res.ok) throw new Error('Gagal mengambil data dari server');
  return res.json();
}

function getHeaders(actor) {
  const token = getAuthToken();
  const weddingId = getActiveWeddingId();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-wedding-id': weddingId,
    'x-actor': actor || 'User'
  };
}

export async function updateMetadata(data, actor) {
  const res = await fetch(`${API_BASE}/metadata`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(data)
  });
  return res.json();
}

// TABUNGAN
export async function addTabungan(item, actor) {
  const res = await fetch(`${API_BASE}/tabungan`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateTabungan(id, item, actor) {
  const res = await fetch(`${API_BASE}/tabungan/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteTabungan(id, actor) {
  const res = await fetch(`${API_BASE}/tabungan/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// SESERAHAN
export async function addSeserahan(item, actor) {
  const res = await fetch(`${API_BASE}/seserahan`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateSeserahan(id, item, actor) {
  const res = await fetch(`${API_BASE}/seserahan/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteSeserahan(id, actor) {
  const res = await fetch(`${API_BASE}/seserahan/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// MAHAR
export async function addMahar(item, actor) {
  const res = await fetch(`${API_BASE}/mahar`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateMahar(id, item, actor) {
  const res = await fetch(`${API_BASE}/mahar/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteMahar(id, actor) {
  const res = await fetch(`${API_BASE}/mahar/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// WEDDING
export async function addWedding(item, actor) {
  const res = await fetch(`${API_BASE}/wedding`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateWedding(id, item, actor) {
  const res = await fetch(`${API_BASE}/wedding/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteWedding(id, actor) {
  const res = await fetch(`${API_BASE}/wedding/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// UNDANGAN & SOUVENIR
export async function addUndangan(item, actor) {
  const res = await fetch(`${API_BASE}/undangan-souvenir`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateUndangan(id, item, actor) {
  const res = await fetch(`${API_BASE}/undangan-souvenir/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteUndangan(id, actor) {
  const res = await fetch(`${API_BASE}/undangan-souvenir/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// TAMU UNDANGAN
export async function addTamu(item, actor) {
  const res = await fetch(`${API_BASE}/tamu`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateTamu(id, item, actor) {
  const res = await fetch(`${API_BASE}/tamu/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteTamu(id, actor) {
  const res = await fetch(`${API_BASE}/tamu/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

export async function updateAfterNikah(id, item, actor) {
  const res = await fetch(`${API_BASE}/after-nikah/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteAfterNikah(id, actor) {
  const res = await fetch(`${API_BASE}/after-nikah/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// TIMELINE / CHECKLIST
export async function addTimelineItem(item, actor) {
  const res = await fetch(`${API_BASE}/timeline`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateTimelineItem(id, item, actor) {
  const res = await fetch(`${API_BASE}/timeline/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteTimelineItem(id, actor) {
  const res = await fetch(`${API_BASE}/timeline/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// RUNDOWN HARI H
export async function addRundownItem(item, actor) {
  const res = await fetch(`${API_BASE}/rundown`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateRundownItem(id, item, actor) {
  const res = await fetch(`${API_BASE}/rundown/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteRundownItem(id, actor) {
  const res = await fetch(`${API_BASE}/rundown/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// LEGAL DOCUMENTS
export async function addLegalDocument(item, actor) {
  const res = await fetch(`${API_BASE}/legal`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateLegalDocument(id, item, actor) {
  const res = await fetch(`${API_BASE}/legal/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteLegalDocument(id, actor) {
  const res = await fetch(`${API_BASE}/legal/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}

// SERAGAM KELUARGA & PANITIA
export async function addSeragamItem(item, actor) {
  const res = await fetch(`${API_BASE}/seragam`, {
    method: 'POST',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function updateSeragamItem(id, item, actor) {
  const res = await fetch(`${API_BASE}/seragam/${id}`, {
    method: 'PUT',
    headers: getHeaders(actor),
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function deleteSeragamItem(id, actor) {
  const res = await fetch(`${API_BASE}/seragam/${id}`, {
    method: 'DELETE',
    headers: getHeaders(actor)
  });
  return res.json();
}
