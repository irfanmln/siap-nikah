// Lightweight JWT & Google OAuth Helper for Cloudflare Workers / Pages

const DEFAULT_SECRET = 'wedding-saas-jwt-secret-key-salt-2026';

// Base64Url encode/decode helpers
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return decodeURIComponent(escape(atob(base64)));
}

async function getCryptoKey(secret) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret || DEFAULT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Create signed JWT
export async function signSession(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataToSign));
  
  // Convert signature buffer to base64url
  const sigBytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const encodedSig = base64UrlEncode(binary);

  return `${dataToSign}.${encodedSig}`;
}

// Verify signed JWT
export async function verifySession(token, secret) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;
    const key = await getCryptoKey(secret);

    // Decode signature
    let sigBinary = base64UrlDecode(sigB64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(dataToVerify));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Verify Google ID token via Google TokenInfo API
export async function verifyGoogleIdToken(idToken, expectedClientId) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) {
    throw new Error('Google token tidak valid');
  }
  const data = await res.json();
  if (expectedClientId && data.aud !== expectedClientId) {
    throw new Error('Google token client id tidak cocok');
  }
  return {
    googleId: data.sub,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    picture: data.picture || ''
  };
}

// Password Hashing using PBKDF2 (Native Web Crypto API)
function bufferToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    256
  );

  return `${bufferToHex(salt)}:${bufferToHex(derivedBits)}`;
}

export async function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [saltHex, originalHashHex] = storedHash.split(':');
    const salt = hexToBuffer(saltHex);
    const enc = new TextEncoder();

    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      256
    );

    return bufferToHex(derivedBits) === originalHashHex;
  } catch (err) {
    return false;
  }
}
