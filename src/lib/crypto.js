// Modul Kriptografi Server-Side untuk Enkripsi Data KTP (AES-256-GCM + HMAC NIK)
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV standar untuk GCM
const TAG_LENGTH = 16;

function getKey() {
  const envKey = process.env.KTP_ENC_KEY;
  if (!envKey) {
    // Fallback key untuk development agar aplikasi tetap jalan tanpa crash
    return crypto.createHash('sha256').update('default-dev-secret-key-kkn-sampah-2026').digest();
  }
  // Cek apakah key dalam bentuk base64 atau string biasa
  if (envKey.length === 44 && envKey.endsWith('=')) {
    try {
      const buf = Buffer.from(envKey, 'base64');
      if (buf.length === 32) return buf;
    } catch (_) {}
  }
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Enkripsi string teks dengan AES-256-GCM
 * Output format: iv:tag:ciphertext (semua hex)
 */
export function encryptText(plainText) {
  if (plainText === null || plainText === undefined || plainText === '') {
    return null;
  }
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const textToEncrypt = typeof plainText === 'object' ? JSON.stringify(plainText) : String(plainText);
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Dekripsi string dari format iv:tag:ciphertext
 */
export function decryptText(cipherBundle) {
  if (!cipherBundle || typeof cipherBundle !== 'string') return null;
  const parts = cipherBundle.split(':');
  if (parts.length !== 3) return cipherBundle; // jika belum terenkripsi / teks biasa

  try {
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Jika JSON, coba parse
    if ((decrypted.startsWith('{') && decrypted.endsWith('}')) || (decrypted.startsWith('[') && decrypted.endsWith(']'))) {
      try {
        return JSON.parse(decrypted);
      } catch (_) {}
    }
    return decrypted;
  } catch (err) {
    console.error('Gagal mendekripsi ciphertext:', err.message);
    return null;
  }
}

/**
 * Hitung HMAC-SHA256 dari NIK untuk mencegah pendaftaran ganda tanpa menyimpan plain text
 */
export function hashNik(nik) {
  if (!nik) return null;
  const key = getKey();
  return crypto.createHmac('sha256', key).update(String(nik).trim()).digest('hex');
}
