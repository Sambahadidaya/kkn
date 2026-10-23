// Sanitasi Input Pengguna untuk Mencegah XSS dan Format Data Bersih

export function sanitizeString(val, maxLength = 255) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // Hapus tag HTML mencurigakan
    .trim()
    .slice(0, maxLength);
}

export function sanitizePhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d+]/g, '').trim();
  // Standarisasi awalan 08xxx menjadi 628xxx atau tetap 08xxx sesuai kebutuhan
  if (cleaned.startsWith('+62')) cleaned = '0' + cleaned.slice(3);
  if (cleaned.startsWith('62')) cleaned = '0' + cleaned.slice(2);
  return cleaned;
}

export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

export function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') return '';
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 30);
}
